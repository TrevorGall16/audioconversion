const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan'); // NEW: Traffic logging
const winston = require('winston'); // NEW: Error logging

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'convertaudiofast.com';
const NODE_ENV = process.env.NODE_ENV || 'development';

// --- INTELLIGENCE: Setup Winston Logger ---
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Write all errors to `error.log`
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        // Write all logs to `combined.log`
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// If we're not in production, log to the console with simple format
if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// --- INTELLIGENCE: Setup Morgan (HTTP Traffic Logs) ---
// This connects Morgan to Winston so traffic shows up in your log files
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// --- PERFORMANCE: Gzip Compression ---
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// --- SECURITY: Helmet.js ---
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// --- SECURITY: Request Body Size Limits ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- SECURITY: Rate Limiting ---
const convertLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { message: 'Too many conversion requests. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- SEO: Force WWW Redirect ---
app.use((req, res, next) => {
    const host = req.get('host');
    if (host && !host.startsWith('www.') && !host.includes('localhost') && NODE_ENV === 'production') {
        return res.redirect(301, `https://www.${DOMAIN}${req.originalUrl}`);
    }
    next();
});

// Configure Uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files with caching
app.use(express.static('public', {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.png') ||
            path.endsWith('.jpg') || path.endsWith('.svg') || path.endsWith('.ico')) {
            res.setHeader('Cache-Control', 'public, max-age=604800');
        }
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        }
    }
}));

// Menu Redirects
app.get(['/audio-formats', '/privacy', '/faq'], (req, res) => res.redirect('/'));

// --- CONVERSION LOGIC ---
app.post('/convert', convertLimiter, upload.single('audioFile'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const inputPath = req.file.path;
    
    // Validate Format
    const ALLOWED_FORMATS = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'];
    let outputFormat = req.body.format || 'mp3';

    if (!ALLOWED_FORMATS.includes(outputFormat)) {
        fs.unlink(inputPath, () => {});
        return res.status(400).json({ message: 'Invalid output format' });
    }

    // Validate MIME Type
    const ALLOWED_MIME_TYPES = [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
        'audio/wave', 'audio/flac', 'audio/x-flac', 'audio/aac',
        'audio/m4a', 'audio/x-m4a', 'audio/mp4', 'audio/ogg',
        'audio/vorbis', 'audio/x-ogg', 'application/octet-stream'
    ];
    const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        fs.unlink(inputPath, () => {});
        return res.status(400).json({ message: 'Invalid file type.' });
    }
    if (req.file.mimetype === 'application/octet-stream' && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
        fs.unlink(inputPath, () => {});
        return res.status(400).json({ message: 'Invalid audio file extension.' });
    }

    const formatMap = { 'm4a': 'mp4', 'aac': 'adts' };
    const ffmpegFormat = formatMap[outputFormat] || outputFormat;

    const crypto = require('crypto');
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const outputFilename = `converted-${uniqueId}.${outputFormat}`;
    const outputPath = path.join(__dirname, 'outputs', outputFilename);

    logger.info(`Starting conversion: ${outputFormat}`); // Log conversion start

    ffmpeg(inputPath)
        .toFormat(ffmpegFormat)
        .on('error', (err) => {
            logger.error(`Conversion Error: ${err.message}`); // Log error
            fs.unlink(inputPath, () => {});
            fs.unlink(outputPath, (unlinkErr) => {
                if (unlinkErr && unlinkErr.code !== 'ENOENT') logger.error(`Cleanup error: ${unlinkErr}`);
            });
            res.status(500).json({ message: 'Conversion failed' });
        })
        .on('end', () => {
            logger.info(`Conversion success: ${outputFilename}`); // Log success
            res.download(outputPath, outputFilename, (downloadErr) => {
                fs.unlink(inputPath, () => {});
                fs.unlink(outputPath, () => {});
                if (downloadErr) logger.error(`Download error: ${downloadErr}`);
            });
        })
        .save(outputPath);
});

// Ensure directories
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('outputs')) fs.mkdirSync('outputs');

// --- INTELLIGENCE: Global Error Handlers ---
process.on('uncaughtException', (err) => {
    logger.error(`UNCAUGHT EXCEPTION: ${err.message}`, { stack: err.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('UNHANDLED REJECTION', { reason });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
});