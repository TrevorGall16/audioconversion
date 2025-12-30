const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. SEO FIX: Force WWW Redirect ---
// Redirects non-www to www (avoids duplicate content on Google)
app.use((req, res, next) => {
    const host = req.get('host');
    if (host && !host.startsWith('www.') && !host.includes('localhost')) {
        return res.redirect(301, 'https://www.convertaudiofast.com' + req.originalUrl);
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
app.post('/convert', upload.single('audioFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    let outputFormat = req.body.format || 'mp3';
    
    // --- THE FIX: Format Mapping ---
    // We map the requested extension (key) to the strict FFmpeg format name (value).
    // If the format isn't in the list, we just use the name as-is (like 'mp3' or 'wav').
    const formatMap = {
        'm4a': 'mp4',   // M4A is technically an MP4 container
        'aac': 'adts'   // Raw AAC usually requires ADTS container
    };

    // Get the correct technical name for FFmpeg
    const ffmpegFormat = formatMap[outputFormat] || outputFormat;

    const outputFilename = `converted-${Date.now()}.${outputFormat}`;
    const outputPath = path.join(__dirname, 'uploads', outputFilename);

    // Run FFmpeg
    ffmpeg(inputPath)
        .toFormat(ffmpegFormat) // Use the translated technical name
        .on('error', (err) => {
            console.error('Conversion Error:', err);
            // Cleanup on error
            fs.unlink(inputPath, () => {}); 
            fs.unlink(outputPath, () => {}); // Try to delete partial file
            res.status(500).json({ message: 'Conversion failed: ' + err.message });
        })
        .on('end', () => {
            // Send the file back
            res.download(outputPath, outputFilename, (err) => {
                // Cleanup after download
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