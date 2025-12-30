const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. SEO FIX: Force WWW Redirect ---
// This ensures Google doesn't see duplicate content. 
// If someone visits 'convertaudiofast.com', they are sent to 'www.convertaudiofast.com'
app.use((req, res, next) => {
    // Check if the host exists and does NOT start with 'www.'
    // We also exclude 'localhost' so you can still test on your computer
    const host = req.get('host');
    if (host && !host.startsWith('www.') && !host.includes('localhost')) {
        return res.redirect(301, 'https://www.convertaudiofast.com' + req.originalUrl);
    }
    next();
});

// Configure Uploads (Stored in 'uploads/' temp folder)
const upload = multer({ dest: 'uploads/' });

// Serve static files (CSS/JS/Images)
app.use(express.static('public'));

// --- FIX FOR MENU LINKS ---
// Redirects /audio-formats, /privacy, etc. to home until you have real pages for them.
// Note: Since you generated 'audio-knowledge' in build.js, we don't need to redirect that one if it exists.
app.get(['/audio-formats', '/privacy', '/faq'], (req, res) => {
    res.redirect('/');
});

// --- 2. Handle the Conversion Logic ---
app.post('/convert', upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputFormat = req.body.format || 'mp3';
    const outputFilename = `converted-${Date.now()}.${outputFormat}`;
    const outputPath = path.join(__dirname, 'uploads', outputFilename);

    // Run FFmpeg
    ffmpeg(inputPath)
        .toFormat(outputFormat)
        .on('error', (err) => {
            console.error('Conversion Error:', err);
            fs.unlink(inputPath, () => {}); 
            res.status(500).json({ message: 'Conversion failed: ' + err.message });
        })
        .on('end', () => {
            res.download(outputPath, outputFilename, (err) => {
                fs.unlink(inputPath, () => {}); 
                fs.unlink(outputPath, () => {}); 
            });
        })
        .save(outputPath);
});

// Ensure 'uploads' directory exists
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});