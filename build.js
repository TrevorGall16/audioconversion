const fs = require('fs');
const path = require('path');

// Load environment variables
const DOMAIN = process.env.DOMAIN || 'convertaudiofast.com';

// Define REAL converter pages (No "Use Cases")
const converters = [
    // --- VIDEO TOOLS ---
    { slug: 'mp4-to-mp3', title: 'MP4 to MP3', h1: 'Convert MP4 to MP3', description: 'Extract audio from MP4.', inputFormat: 'mp4', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'mov-to-mp3', title: 'MOV to MP3', h1: 'Convert MOV to MP3', description: 'Extract audio from MOV.', inputFormat: 'mov', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'mkv-to-mp3', title: 'MKV to MP3', h1: 'Convert MKV to MP3', description: 'Extract audio from MKV.', inputFormat: 'mkv', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'webm-to-mp3', title: 'WebM to MP3', h1: 'Convert WebM to MP3', description: 'Extract audio from WebM.', inputFormat: 'webm', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'avi-to-mp3', title: 'AVI to MP3', h1: 'Convert AVI to MP3', description: 'Extract audio from AVI.', inputFormat: 'avi', outputFormat: 'mp3', uniqueContent: '' },

    // --- PROFESSIONAL FORMATS ---
    { slug: 'wav-to-aiff', title: 'WAV to AIFF', h1: 'Convert WAV to AIFF', description: 'Convert WAV to AIFF.', inputFormat: 'wav', outputFormat: 'aiff', uniqueContent: '' },
    { slug: 'aiff-to-wav', title: 'AIFF to WAV', h1: 'Convert AIFF to WAV', description: 'Convert AIFF to WAV.', inputFormat: 'aiff', outputFormat: 'wav', uniqueContent: '' },
    { slug: 'flac-to-alac', title: 'FLAC to ALAC', h1: 'Convert FLAC to ALAC', description: 'Convert FLAC to ALAC.', inputFormat: 'flac', outputFormat: 'alac', uniqueContent: '' },
    { slug: 'alac-to-flac', title: 'ALAC to FLAC', h1: 'Convert ALAC to FLAC', description: 'Convert ALAC to FLAC.', inputFormat: 'alac', outputFormat: 'flac', uniqueContent: '' },
    { slug: 'wma-to-mp3', title: 'WMA to MP3', h1: 'Convert WMA to MP3', description: 'Convert WMA to MP3.', inputFormat: 'wma', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'opus-to-mp3', title: 'OPUS to MP3', h1: 'Convert OPUS to MP3', description: 'Convert OPUS to MP3.', inputFormat: 'opus', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'mp3-to-opus', title: 'MP3 to OPUS', h1: 'Convert MP3 to OPUS', description: 'Convert MP3 to OPUS.', inputFormat: 'mp3', outputFormat: 'opus', uniqueContent: '' },

    // --- STANDARD CONVERTERS ---
    { slug: 'mp3-to-wav', title: 'MP3 to WAV', h1: 'Convert MP3 to WAV', description: 'Convert MP3 to WAV free.', inputFormat: 'mp3', outputFormat: 'wav', uniqueContent: '' },
    { slug: 'wav-to-mp3', title: 'WAV to MP3', h1: 'Convert WAV to MP3', description: 'Convert WAV to MP3 free.', inputFormat: 'wav', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'flac-to-mp3', title: 'FLAC to MP3', h1: 'Convert FLAC to MP3', description: 'Convert FLAC to MP3 free.', inputFormat: 'flac', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'mp3-to-flac', title: 'MP3 to FLAC', h1: 'Convert MP3 to FLAC', description: 'Convert MP3 to FLAC free.', inputFormat: 'mp3', outputFormat: 'flac', uniqueContent: '' },
    { slug: 'aac-to-mp3', title: 'AAC to MP3', h1: 'Convert AAC to MP3', description: 'Convert AAC to MP3 free.', inputFormat: 'aac', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'ogg-to-mp3', title: 'OGG to MP3', h1: 'Convert OGG to MP3', description: 'Convert OGG to MP3 free.', inputFormat: 'ogg', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'm4a-to-mp3', title: 'M4A to MP3', h1: 'Convert M4A to MP3', description: 'Convert M4A to MP3 free.', inputFormat: 'm4a', outputFormat: 'mp3', uniqueContent: '' },
    { slug: 'wav-to-flac', title: 'WAV to FLAC', h1: 'Convert WAV to FLAC', description: 'Convert WAV to FLAC free.', inputFormat: 'wav', outputFormat: 'flac', uniqueContent: '' },
    { slug: 'ogg-to-wav', title: 'OGG to WAV', h1: 'Convert OGG to WAV', description: 'Convert OGG to WAV free.', inputFormat: 'ogg', outputFormat: 'wav', uniqueContent: '' },
    { slug: 'aac-to-wav', title: 'AAC to WAV', h1: 'Convert AAC to WAV', description: 'Convert AAC to WAV free.', inputFormat: 'aac', outputFormat: 'wav', uniqueContent: '' },
    { slug: 'm4a-to-wav', title: 'M4A to WAV', h1: 'Convert M4A to WAV', description: 'Convert M4A to WAV free.', inputFormat: 'm4a', outputFormat: 'wav', uniqueContent: '' }
];

const templatePath = path.join(__dirname, 'template.html');
let template;

try {
    template = fs.readFileSync(templatePath, 'utf8');
} catch (err) {
    console.error('❌ Error: template.html not found!');
    process.exit(1);
}

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

console.log('\n🏗️  Building Clean Pages...\n');

// Helper: Determine if format is video
const VIDEO_FORMATS = ['mp4', 'mov', 'mkv', 'webm', 'avi'];

function getUploadUI(inputFormat) {
    const isVideo = VIDEO_FORMATS.includes(inputFormat);
    const formatUpper = inputFormat.toUpperCase();
    return {
        headline: isVideo ? `Upload Your ${formatUpper} Video` : `Upload Your ${formatUpper} Audio`,
        dragDropText: isVideo ? `Drag & Drop your ${formatUpper} video here` : `Drag & Drop your ${formatUpper} file here`,
        acceptExtensions: `.${inputFormat}`
    };
}

function generateGrid(items) {
    return items.map(c => 
        `<a href="/${c.slug}/" class="info-bar-link" style="display:inline-block; margin:5px; padding: 10px 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #334155; font-weight: 500;">
            ${c.h1.replace('Convert ', '').replace('Extract ', '')}
        </a>`
    ).join('');
}

// Categorize Converters
const videoTools = converters.filter(c => ['mp4', 'mov', 'mkv', 'webm', 'avi'].includes(c.inputFormat));
const proTools = converters.filter(c => ['wav', 'aiff', 'flac', 'alac', 'opus', 'wma'].includes(c.inputFormat));
const standardTools = converters.filter(c => !videoTools.includes(c) && !proTools.includes(c));

// Generate Homepage (Clean Layout)
const homepageHtml = template
    .replace(/\{\{TITLE\}\}/g, 'Convert Audio Fast - The Fastest Online Audio Converter')
    .replace(/\{\{H1\}\}/g, '⚡ Convert Audio Fast')
    .replace(/\{\{DESCRIPTION\}\}/g, 'The fastest free online audio converter. Server-side processing for maximum speed.')
    .replace(/\{\{CANONICAL_URL\}\}/g, '/')
    .replace(/\{\{DEFAULT_OUTPUT\}\}/g, 'mp3')
    .replace(/\{\{UPLOAD_HEADLINE\}\}/g, 'Upload & Convert Your File')
    .replace(/\{\{DRAG_DROP_TEXT\}\}/g, 'Drag & Drop your audio or video file here')
    .replace(/\{\{ACCEPT_EXTENSIONS\}\}/g, 'audio/*,video/*')
    .replace(/\{\{UNIQUE_CONTENT\}\}/g, `
        <div class="educational-content">
            <h2>Why is Convert Audio Fast so... fast?</h2>
            <p>Most online converters run inside your browser (WASM), which is slow. We use <strong>Server-Side FFmpeg</strong> for zero lag.</p>
            
            <div id="all-tools" style="margin-top: 40px;">
                <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">🎬 Video to Audio</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px;">
                    ${generateGrid(videoTools)}
                </div>

                <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">🎧 Professional Formats</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px;">
                    ${generateGrid(proTools)}
                </div>

                <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">📂 Standard Converters</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px;">
                    ${generateGrid(standardTools)}
                </div>
            </div>
        </div>
    `);

fs.writeFileSync(path.join(publicDir, 'index.html'), homepageHtml);
console.log('✓ Created: /index.html (Clean Homepage)');

// Generate Subpages
converters.forEach(converter => {
    const converterDir = path.join(publicDir, converter.slug);
    if (!fs.existsSync(converterDir)) fs.mkdirSync(converterDir, { recursive: true });

    const content = converter.uniqueContent || `<div class="educational-content"><h2>${converter.h1}</h2><p>${converter.description}</p></div>`;

    // Get dynamic upload UI based on input format
    const uploadUI = getUploadUI(converter.inputFormat);

    const html = template
        .replace(/\{\{TITLE\}\}/g, converter.title)
        .replace(/\{\{H1\}\}/g, converter.h1)
        .replace(/\{\{DESCRIPTION\}\}/g, converter.description)
        .replace(/\{\{CANONICAL_URL\}\}/g, `/${converter.slug}/`)
        .replace(/\{\{DEFAULT_OUTPUT\}\}/g, converter.outputFormat)
        .replace(/\{\{UPLOAD_HEADLINE\}\}/g, uploadUI.headline)
        .replace(/\{\{DRAG_DROP_TEXT\}\}/g, uploadUI.dragDropText)
        .replace(/\{\{ACCEPT_EXTENSIONS\}\}/g, uploadUI.acceptExtensions)
        .replace(/\{\{UNIQUE_CONTENT\}\}/g, content);

    fs.writeFileSync(path.join(converterDir, 'index.html'), html);
    console.log(`✓ Created: /${converter.slug}/index.html`);
});

function copyAssets() {
    const assetsDir = path.join(__dirname, 'assets');
    const mappings = [
        { src: path.join(assetsDir, 'css'), dest: path.join(publicDir, 'css') },
        { src: path.join(assetsDir, 'js'), dest: path.join(publicDir, 'js') }
    ];
    mappings.forEach(map => {
        if (fs.existsSync(map.src)) {
            if (!fs.existsSync(map.dest)) fs.mkdirSync(map.dest, { recursive: true });
            fs.readdirSync(map.src).forEach(file => {
                fs.copyFileSync(path.join(map.src, file), path.join(map.dest, file));
            });
        }
    });
}
copyAssets();
console.log('✅ Clean Build complete.');