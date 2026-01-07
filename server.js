const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'convertaudiofast.com';
const NODE_ENV = process.env.NODE_ENV || 'development';

// --- SECURITY: Helmet.js (Security Headers) ---
app.use(helmet({
    contentSecurityPolicy: false, // Disabled due to inline scripts and third-party ads
    crossOriginEmbedderPolicy: false // Disabled to allow ad network embeds
}));

// --- SECURITY: Request Body Size Limits ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- SECURITY: Rate Limiting (50 conversions per 15 minutes per IP) ---
const convertLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Allow 50 conversions (for batch album conversions)
    message: { message: 'Too many conversion requests from this IP. Please try again in 15 minutes.' },
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
});

// --- 1. SEO FIX: Force WWW Redirect (Environment-Aware) ---
// Redirects non-www to www (avoids duplicate content on Google)
app.use((req, res, next) => {
    const host = req.get('host');
    if (host && !host.startsWith('www.') && !host.includes('localhost') && NODE_ENV === 'production') {
        return res.redirect(301, `https://www.${DOMAIN}${req.originalUrl}`);
    }
    next();
});

// Configure Uploads (Stored in 'uploads/' temp folder)
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static('public'));

// --- FIX FOR MENU LINKS ---
app.get(['/audio-formats', '/privacy', '/faq'], (req, res) => {
    res.redirect('/');
});

// --- 2. Handle the Conversion Logic ---
app.post('/convert', convertLimiter, upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const inputPath = req.file.path;

    // --- SECURITY: Format Validation Whitelist ---
    const ALLOWED_FORMATS = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'];
    let outputFormat = req.body.format || 'mp3';

    if (!ALLOWED_FORMATS.includes(outputFormat)) {
        fs.unlink(inputPath, (err) => {
            if (err) console.error('Failed to delete invalid upload:', err);
        });
        return res.status(400).json({ message: 'Invalid output format. Allowed: mp3, wav, flac, aac, m4a, ogg' });
    }

    // --- SECURITY: MIME Type Validation with Fallback ---
    const ALLOWED_MIME_TYPES = [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
        'audio/wave', 'audio/flac', 'audio/x-flac', 'audio/aac',
        'audio/m4a', 'audio/x-m4a', 'audio/mp4', 'audio/ogg',
        'audio/vorbis', 'audio/x-ogg', 'application/octet-stream' // Generic fallback
    ];

    const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    // Check MIME type OR file extension (for octet-stream uploads)
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        fs.unlink(inputPath, (err) => {
            if (err) console.error('Failed to delete invalid file type:', err);
        });
        return res.status(400).json({ message: 'Invalid file type. Please upload an audio file.' });
    }

    // If MIME is generic octet-stream, validate by extension
    if (req.file.mimetype === 'application/octet-stream' && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
        fs.unlink(inputPath, (err) => {
            if (err) console.error('Failed to delete unknown file type:', err);
        });
        return res.status(400).json({ message: 'Invalid audio file extension. Allowed: mp3, wav, flac, aac, m4a, ogg' });
    }

    // --- Format Mapping for FFmpeg ---
    const formatMap = {
        'm4a': 'mp4',   // M4A is technically an MP4 container
        'aac': 'adts'   // Raw AAC usually requires ADTS container
    };

    // Get the correct technical name for FFmpeg
    const ffmpegFormat = formatMap[outputFormat] || outputFormat;

    // --- FIX: Use outputs directory with unique UUID-based filename ---
    const crypto = require('crypto');
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const outputFilename = `converted-${uniqueId}.${outputFormat}`;
    const outputPath = path.join(__dirname, 'outputs', outputFilename);

    // Run FFmpeg
    ffmpeg(inputPath)
        .toFormat(ffmpegFormat) // Use the translated technical name
        .on('error', (err) => {
            console.error('Conversion Error:', err.message);
            // Cleanup on error with proper error handling
            fs.unlink(inputPath, (unlinkErr) => {
                if (unlinkErr) console.error('Failed to delete input file:', unlinkErr);
            });
            fs.unlink(outputPath, (unlinkErr) => {
                if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                    console.error('Failed to delete partial output file:', unlinkErr);
                }
            });
            res.status(500).json({ message: 'Conversion failed: ' + err.message });
        })
        .on('end', () => {
            // Send the file back
            res.download(outputPath, outputFilename, (downloadErr) => {
                // Cleanup after download with proper error handling
                fs.unlink(inputPath, (unlinkErr) => {
                    if (unlinkErr) console.error('Failed to delete input file:', unlinkErr);
                });
                fs.unlink(outputPath, (unlinkErr) => {
                    if (unlinkErr) console.error('Failed to delete output file:', unlinkErr);
                });

                if (downloadErr) {
                    console.error('Download error:', downloadErr);
                }
            });
        })
        .save(outputPath);
});

// Ensure required directories exist
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}
if (!fs.existsSync('outputs')){
    fs.mkdirSync('outputs');
}

// --- SECURITY: Global Error Handlers ---
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    console.error('Stack:', err.stack);
    // Log to monitoring service in production
    process.exit(1); // Let process manager (PM2/systemd) restart
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION at:', promise);
    console.error('Reason:', reason);
    // Log to monitoring service in production
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Rate limit: 50 requests per 15 minutes`);
});