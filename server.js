const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');

// --- APP SETUP ---
const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || 200);
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
const CONVERSION_TIMEOUT_MS = Number(process.env.CONVERSION_TIMEOUT_MS || 5 * 60 * 1000);
const MAX_CONCURRENT_CONVERSIONS = Number(process.env.MAX_CONCURRENT_CONVERSIONS || 4);

// --- LOGGING ---
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});
if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// --- MIDDLEWARE ---
app.use(compression());
app.use(helmet({
    contentSecurityPolicy: false, // Fixes Broken Downloads & Missing Ads
    crossOriginEmbedderPolicy: false
}));

// --- RATE LIMITING ---
const convertLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many conversions. Please try again later.'
});

// =========================================================================
// STATIC FILE SETUP - All assets served from 'public' directory
// =========================================================================
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html'],
    index: 'index.html'
}));

// =========================================================================
// CONVERSION ENGINE
// =========================================================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedFormats = new Set(['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma', 'opus', 'aiff', 'alac']);
const allowedInputExtensions = new Set([
    '.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg', '.wma', '.opus', '.aiff', '.alac',
    '.mp4', '.mov', '.mkv', '.webm', '.avi'
]);
const allowedMimePrefixes = ['audio/', 'video/'];

const upload = multer({
    dest: uploadsDir,
    limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const mimeType = (file.mimetype || '').toLowerCase();
        const isAllowedExt = allowedInputExtensions.has(ext);
        const isAllowedMime = allowedMimePrefixes.some(prefix => mimeType.startsWith(prefix));

        if (!isAllowedExt || !isAllowedMime) {
            return cb(new Error('Unsupported file type.'));
        }

        cb(null, true);
    }
});

let activeConversions = 0;

async function cleanupFiles(...filePaths) {
    await Promise.all(filePaths.filter(Boolean).map(async (filePath) => {
        try {
            await fsp.unlink(filePath);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                logger.warn(`Cleanup failed for ${filePath}: ${err.message}`);
            }
        }
    }));
}

app.post('/convert', convertLimiter, upload.single('audioFile'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    if (activeConversions >= MAX_CONCURRENT_CONVERSIONS) {
        await cleanupFiles(req.file.path);
        return res.status(429).json({ message: 'Server is busy. Please retry shortly.' });
    }

    const inputPath = req.file.path;
    const originalName = req.file.originalname;
    const requestedFormat = String(req.body.format || 'mp3').toLowerCase();

    if (!allowedFormats.has(requestedFormat)) {
        await cleanupFiles(inputPath);
        return res.status(400).json({ message: 'Invalid format.' });
    }

    const outputFilename = `converted_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${requestedFormat}`;
    const outputPath = path.join(uploadsDir, outputFilename);

    const ffmpegArgs = ['-i', inputPath, '-y'];
    if (['mp3', 'aac', 'm4a', 'wma'].includes(requestedFormat)) {
        ffmpegArgs.push('-b:a', '192k');
    }
    ffmpegArgs.push(outputPath);

    logger.info(`Starting conversion: ${originalName} -> ${requestedFormat}`);
    activeConversions += 1;

    const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderrOutput = '';
    ffmpeg.stderr.on('data', chunk => {
        if (stderrOutput.length < 8_192) {
            stderrOutput += chunk.toString();
        }
    });

    const timeout = setTimeout(() => {
        ffmpeg.kill('SIGKILL');
    }, CONVERSION_TIMEOUT_MS);

    ffmpeg.on('error', async (error) => {
        clearTimeout(timeout);
        activeConversions -= 1;
        logger.error(`FFmpeg spawn error: ${error.message}`);
        await cleanupFiles(inputPath, outputPath);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Conversion failed.' });
        }
    });

    ffmpeg.on('close', async (code, signal) => {
        clearTimeout(timeout);
        activeConversions -= 1;

        if (code !== 0) {
            logger.error(`Conversion Error: code=${code}, signal=${signal}, stderr=${stderrOutput.slice(0, 1024)}`);
            await cleanupFiles(inputPath, outputPath);
            if (!res.headersSent) {
                const timeoutReached = signal === 'SIGKILL';
                return res.status(timeoutReached ? 408 : 500).json({
                    message: timeoutReached ? 'Conversion timed out.' : 'Conversion failed.'
                });
            }
            return;
        }

        res.download(outputPath, outputFilename, async (err) => {
            await cleanupFiles(inputPath, outputPath);
            if (err) logger.error(`Download Error: ${err.message}`);
        });
    });
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: `File too large. Maximum size is ${MAX_UPLOAD_SIZE_MB}MB.` });
        }
        return res.status(400).json({ message: err.message });
    }

    if (err && err.message === 'Unsupported file type.') {
        return res.status(400).json({ message: err.message });
    }

    logger.error(`Unhandled error: ${err.message}`);
    return res.status(500).json({ message: 'Unexpected server error.' });
});

// --- SERVER START ---
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
