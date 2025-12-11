const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// --- FFMPEG SETUP (The Robust Way) ---
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
console.log(`✅ FFmpeg Engine linked at: ${ffmpegPath}`);
// -------------------------------------

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiting Configuration
// Strict limiter for expensive conversion endpoint
const conversionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 conversion requests per windowMs
    message: {
        message: 'Too many conversion requests from this IP. Please try again in 15 minutes.'
    },
    statusCode: 429,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skipFailedRequests: true, // Don't count failed requests (allows retries on network errors)
    handler: (req, res) => {
        res.status(429).json({
            message: 'Too many conversion requests from this IP. Please try again in 15 minutes.'
        });
    }
});

// General limiter for all other traffic
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP. Please try again later.'
    },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false
});

// Middleware
app.use(cors());
app.use(express.json());
// Serve 'public' folder. 
// If user hits root '/', send them public/index.html (The Built Homepage)
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ensure required directories exist with proper permissions
const UPLOAD_DIR = 'uploads';
const OUTPUT_DIR = 'outputs';

[UPLOAD_DIR, OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
        console.log(`📁 Created directory: ${dir}`);
    }
});

// Cleanup on startup - delete any leftover files
function cleanupOnStartup() {
    console.log('🧹 Cleaning up leftover files...');
    [UPLOAD_DIR, OUTPUT_DIR].forEach(dir => {
        if (fs.existsSync(dir)) {
            try {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    if (file !== '.gitkeep') fs.unlinkSync(path.join(dir, file));
                });
            } catch (e) { console.log('Cleanup non-critical error:', e.message); }
        }
    });
    console.log('✅ Startup cleanup complete');
}
cleanupOnStartup();

// Configure multer (50MB limit)
const upload = multer({
    dest: UPLOAD_DIR + '/', // Added slash for safety
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Simple check: Is it audio?
        if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|flac|aac|m4a|ogg|wma)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    }
});

// Helper Codec Selector
function getAudioCodec(format) {
    const codecs = {
        'mp3': 'libmp3lame', 'wav': 'pcm_s16le', 'flac': 'flac',
        'aac': 'aac', 'm4a': 'aac', 'ogg': 'libvorbis', 'wma': 'wmav2'
    };
    return codecs[format] || 'copy';
}

// --- MAIN CONVERSION ROUTE ---
app.post('/convert', upload.single('audioFile'), (req, res) => {
    
    // 1. Validation
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const inputPath = req.file.path;
    const outputFormat = req.body.format || 'mp3';
    const validFormats = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma'];
    
    if (!validFormats.includes(outputFormat)) {
        if(fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        return res.status(400).json({ message: 'Invalid output format' });
    }

    const outputFileName = `${req.file.filename}.${outputFormat}`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);

    console.log(`🎵 Converting: ${req.file.originalname} -> .${outputFormat}`);

    // 2. Process
    ffmpeg(inputPath)
        .toFormat(outputFormat)
        .audioCodec(getAudioCodec(outputFormat))
        .on('error', (err) => {
            console.error(`❌ Error: ${err.message}`);
            if(fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            res.status(500).json({ message: `Conversion failed: ${err.message}` });
        })
        .on('end', () => {
            console.log(`✅ Success! Sending file...`);
            res.download(outputPath, `converted.${outputFormat}`, (err) => {
                // 3. Cleanup after download
                if(fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if(fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });
        })
        .save(outputPath);
});

// Error handling (File size, etc)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(413).json({ message: 'File too large (Max 50MB)' });
    }
    if (err) return res.status(400).json({ message: err.message });
    next();
});

// Start
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});