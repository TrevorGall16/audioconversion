const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure required directories exist with proper permissions
const UPLOAD_DIR = 'uploads';
const OUTPUT_DIR = 'outputs';

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true, mode: 0o755 });
    console.log(`📁 Created directory: ${UPLOAD_DIR}`);
}

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true, mode: 0o755 });
    console.log(`📁 Created directory: ${OUTPUT_DIR}`);
}

// Cleanup on startup - delete any leftover files from previous runs
function cleanupOnStartup() {
    console.log('🧹 Cleaning up leftover files from previous sessions...');

    [UPLOAD_DIR, OUTPUT_DIR].forEach(dir => {
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                try {
                    fs.unlinkSync(filePath);
                    console.log(`   Deleted: ${filePath}`);
                } catch (err) {
                    console.error(`   Failed to delete ${filePath}:`, err.message);
                }
            });
        }
    });

    console.log('✅ Cleanup complete\n');
}

// Run cleanup on server start
cleanupOnStartup();

// Configure multer with HARD file size limit (50MB)
const upload = multer({
    dest: UPLOAD_DIR,
    limits: {
        fileSize: 50 * 1024 * 1024  // 50MB hard limit
    },
    fileFilter: (req, file, cb) => {
        // Validate file type
        const allowedMimes = [
            'audio/mpeg',
            'audio/wav',
            'audio/wave',
            'audio/x-wav',
            'audio/flac',
            'audio/x-flac',
            'audio/aac',
            'audio/m4a',
            'audio/x-m4a',
            'audio/ogg',
            'audio/vorbis',
            'audio/x-ms-wma'
        ];

        if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|flac|aac|m4a|ogg|wma)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    }
});

// Helper function to safely delete a file
function safeDeleteFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✓ Deleted: ${filePath}`);
        }
    } catch (err) {
        console.error(`✗ Failed to delete ${filePath}:`, err.message);
    }
}

// Conversion endpoint
app.post('/convert', upload.single('audioFile'), (req, res) => {
    let inputPath = null;
    let outputPath = null;

    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    inputPath = req.file.path;
    const outputFormat = req.body.format || 'mp3';

    // Validate output format
    const validFormats = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma'];
    if (!validFormats.includes(outputFormat)) {
        safeDeleteFile(inputPath);
        return res.status(400).json({ message: 'Invalid output format' });
    }

    const outputFileName = `${req.file.filename}.${outputFormat}`;
    outputPath = path.join(OUTPUT_DIR, outputFileName);

    console.log(`\n🎵 Starting conversion:`);
    console.log(`   Input: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`   Output: ${outputFormat.toUpperCase()}`);

    // Perform conversion with try/finally for guaranteed cleanup
    ffmpeg(inputPath)
        .toFormat(outputFormat)
        .audioCodec(getAudioCodec(outputFormat))
        .on('start', (commandLine) => {
            console.log(`   Command: ${commandLine}`);
        })
        .on('progress', (progress) => {
            if (progress.percent) {
                console.log(`   Progress: ${Math.round(progress.percent)}%`);
            }
        })
        .on('end', () => {
            console.log(`✅ Conversion complete`);

            // Send file to user
            res.download(outputPath, `converted.${outputFormat}`, (downloadErr) => {
                // GUARANTEED CLEANUP in finally-style callback
                console.log(`\n🧹 Cleaning up files...`);
                safeDeleteFile(inputPath);
                safeDeleteFile(outputPath);
                console.log(`✅ Cleanup complete\n`);

                if (downloadErr) {
                    console.error('Download error:', downloadErr);
                }
            });
        })
        .on('error', (err) => {
            console.error(`❌ Conversion error:`, err.message);

            // Clean up on error
            safeDeleteFile(inputPath);
            safeDeleteFile(outputPath);

            res.status(500).json({
                message: `Conversion failed: ${err.message}`
            });
        })
        .save(outputPath);
});

// Helper function to get appropriate audio codec
function getAudioCodec(format) {
    const codecs = {
        'mp3': 'libmp3lame',
        'wav': 'pcm_s16le',
        'flac': 'flac',
        'aac': 'aac',
        'm4a': 'aac',
        'ogg': 'libvorbis',
        'wma': 'wmav2'
    };
    return codecs[format] || 'copy';
}

// Error handling for multer (file size exceeded, etc.)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                message: 'File too large - Maximum file size is 50MB'
            });
        }
        return res.status(400).json({
            message: `Upload error: ${err.message}`
        });
    }

    if (err) {
        return res.status(400).json({
            message: err.message
        });
    }

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Audio Converter Server`);
    console.log(`   Running on: http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Max file size: 50MB`);
    console.log(`\n   Ready to convert audio files!\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 SIGTERM received, shutting down gracefully...');
    cleanupOnStartup(); // Clean up files before exit
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received, shutting down gracefully...');
    cleanupOnStartup(); // Clean up files before exit
    process.exit(0);
});
