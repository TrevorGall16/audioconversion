const express = require('express');
const multer = require('multer');
const { exec } = require('child_process'); // <--- USING EXEC (Shell)
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');

const app = express();
app.set('trust proxy', 1); 
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'convertaudiofast.com';
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
if (NODE_ENV !== 'production') logger.add(new winston.transports.Console({ format: winston.format.simple() }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// --- MIDDLEWARE ---
app.use(compression({ level: 6 }));
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const convertLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});


const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB
});

app.use(express.static('public', {
    maxAge: '7d',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) res.setHeader('Cache-Control', 'public, max-age=3600');
    }
}));

// --- STATIC PAGE ROUTES ---

// Serve specific HTML files from the root
app.get('/privacy-policy.html', (req, res) => {
    res.sendFile(__dirname + '/privacy-policy.html');
});

app.get('/formats-details.html', (req, res) => {
    res.sendFile(__dirname + '/formats-details.html');
});

app.get('/legal-disclaimer.html', (req, res) => {
    res.sendFile(__dirname + '/legal-disclaimer.html');
});

app.get('/file-handling.html', (req, res) => {
    res.sendFile(__dirname + '/file-handling.html');
});

// Serve the Audio Knowledge folder as a static directory
app.use('/audio-knowledge', express.static(path.join(__dirname, 'audio-knowledge')));

app.get(['/audio-formats', '/privacy', '/faq'], (req, res) => res.redirect('/'));

// --- CONVERSION LOGIC (RAW SHELL) ---
app.post('/convert', convertLimiter, upload.single('audioFile'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // 1. PATH SETUP
    const tempPath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Validate Extension
    const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg', '.wma', '.aiff', '.aif', '.opus', '.alac', '.mp4', '.m4v', '.mov', '.mkv', '.webm', '.avi'];
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        try { fs.unlinkSync(tempPath); } catch(e){}
        return res.status(400).json({ message: 'Invalid file extension.' });
    }

    // Validate Output Format
    const outputFormat = req.body.format || 'mp3';
    const ALLOWED_FORMATS = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma', 'aiff', 'opus', 'alac'];
    if (!ALLOWED_FORMATS.includes(outputFormat)) {
        try { fs.unlinkSync(tempPath); } catch(e){}
        return res.status(400).json({ message: 'Invalid output format' });
    }

    // RENAME INPUT
    const inputPath = tempPath + fileExtension;
    try {
        fs.renameSync(tempPath, inputPath);
    } catch (err) {
        logger.error(`Rename Error: ${err}`);
        return res.status(500).json({ message: 'File processing error' });
    }

    // 2. OUTPUT SETUP
    const outputDir = path.join(__dirname, 'outputs');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    const crypto = require('crypto');
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const outputFilename = `converted-${uniqueId}.${outputFormat}`;
    const outputPath = path.join(outputDir, outputFilename);

    // 3. NUCLEAR PATH FIX: Force Forward Slashes and Quotes
    const safeInput = `"${inputPath.replace(/\\/g, '/')}"`;
    const safeOutput = `"${outputPath.replace(/\\/g, '/')}"`;

    // 4. AUDIO STREAM CHECK (Prevent silent video crash)
    const VIDEO_EXTENSIONS = ['.mp4', '.m4v', '.mov', '.mkv', '.webm', '.avi'];
    if (VIDEO_EXTENSIONS.includes(fileExtension)) {
        const probeCmd = `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 ${safeInput}`;

        exec(probeCmd, (probeError, probeStdout, probeStderr) => {
            if (probeError || !probeStdout.trim()) {
                logger.error(`No audio track found in video: ${req.file.originalname}`);
                try { fs.unlinkSync(inputPath); } catch(e){}
                return res.status(400).json({ message: 'This video has no audio track to extract.' });
            }
            // Audio exists, proceed with conversion
            runConversion();
        });
    } else {
        // Audio file, skip probe
        runConversion();
    }

    function runConversion() {
        let cmd = `ffmpeg -i ${safeInput} -y`;

        if (['mp3', 'aac', 'm4a', 'wma'].includes(outputFormat)) {
            cmd += ` -b:a 192k`;
        }

        if (outputFormat === 'alac') cmd += ` -c:a alac`;
        else if (outputFormat === 'aiff') cmd += ` -c:a pcm_s16be`;
        else if (outputFormat === 'opus') cmd += ` -c:a libopus`;

        cmd += ` ${safeOutput}`;

        logger.info(`Running Raw Command: ${cmd}`);

        // EXECUTE SHELL COMMAND
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                logger.error(`Exec Error: ${error.message}`);
                logger.error(`FFmpeg Stderr: ${stderr}`);

                try { fs.unlinkSync(inputPath); } catch(e){}
                try { fs.unlinkSync(outputPath); } catch(e){}
                return res.status(500).json({ message: 'Conversion failed.' });
            }

            logger.info(`Conversion success: ${outputFilename}`);
            res.download(outputPath, outputFilename, (err) => {
                try { fs.unlinkSync(inputPath); } catch(e){}
                try { fs.unlinkSync(outputPath); } catch(e){}
                if (err) logger.error(`Download error: ${err}`);
            });
        });
    }
});

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('outputs')) fs.mkdirSync('outputs');

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});