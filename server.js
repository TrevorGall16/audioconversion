const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
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
    contentSecurityPolicy: false, // Allow inline scripts/ads
}));

// --- RATE LIMITING ---
const convertLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many conversions. Please try again later.'
});

// =========================================================================
// STATIC FILE SETUP - All assets served from 'public' directory
// =========================================================================
// Build process copies all static files (HTML, CSS, JS, audio-knowledge) to public/
// This single middleware handles everything - no manual routes needed
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html'],
    index: 'index.html'
}));

// =========================================================================
// 3. CONVERSION ENGINE
// =========================================================================
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 2000 * 1024 * 1024 } // 2GB Limit
});

app.post('/convert', convertLimiter, upload.single('audioFile'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const inputPath = req.file.path;
    const originalName = req.file.originalname;
    const outputFormat = req.body.format || 'mp3';
    const outputFilename = `converted_${Date.now()}.${outputFormat}`;
    const outputPath = path.join('uploads', outputFilename);

    // Security Check
    const allowedFormats = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma', 'opus', 'aiff', 'alac'];
    if (!allowedFormats.includes(outputFormat)) {
        try { fs.unlinkSync(inputPath); } catch(e){}
        return res.status(400).json({ message: 'Invalid format.' });
    }

    // Build FFmpeg Command
    let cmd = `ffmpeg -i "${inputPath}" -y`;
    if (['mp3', 'aac', 'm4a', 'wma'].includes(outputFormat)) {
        cmd += ` -b:a 192k`;
    }
    cmd += ` "${outputPath}"`;

    logger.info(`Starting conversion: ${originalName} -> ${outputFormat}`);

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            logger.error(`Conversion Error: ${error.message}`);
            try { fs.unlinkSync(inputPath); } catch(e){}
            try { fs.unlinkSync(outputPath); } catch(e){}
            return res.status(500).json({ message: 'Conversion failed.' });
        }

        res.download(outputPath, outputFilename, (err) => {
            // Cleanup after download
            try { fs.unlinkSync(inputPath); } catch(e){}
            try { fs.unlinkSync(outputPath); } catch(e){}
            if (err) logger.error(`Download Error: ${err.message}`);
        });
    });
});

// --- SERVER START ---
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});