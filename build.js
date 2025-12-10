const fs = require('fs');
const path = require('path');

// Define all converter pages we want to generate
const converters = [
    {
        slug: 'mp3-to-wav',
        title: 'MP3 to WAV Converter - Free Online Audio Converter',
        h1: 'Convert MP3 to WAV',
        description: 'Convert MP3 files to WAV format for free. High-quality audio conversion with no signup required.',
        inputFormat: 'mp3',
        outputFormat: 'wav'
    },
    {
        slug: 'wav-to-mp3',
        title: 'WAV to MP3 Converter - Free Online Audio Converter',
        h1: 'Convert WAV to MP3',
        description: 'Convert WAV files to MP3 format for free. Reduce file size while maintaining quality.',
        inputFormat: 'wav',
        outputFormat: 'mp3'
    },
    {
        slug: 'flac-to-mp3',
        title: 'FLAC to MP3 Converter - Free Online Audio Converter',
        h1: 'Convert FLAC to MP3',
        description: 'Convert FLAC lossless audio to MP3 format for free. Perfect for compatibility and smaller file sizes.',
        inputFormat: 'flac',
        outputFormat: 'mp3'
    },
    {
        slug: 'mp3-to-flac',
        title: 'MP3 to FLAC Converter - Free Online Audio Converter',
        h1: 'Convert MP3 to FLAC',
        description: 'Convert MP3 files to FLAC lossless format for free. Preserve audio quality with lossless compression.',
        inputFormat: 'mp3',
        outputFormat: 'flac'
    },
    {
        slug: 'aac-to-mp3',
        title: 'AAC to MP3 Converter - Free Online Audio Converter',
        h1: 'Convert AAC to MP3',
        description: 'Convert AAC files to MP3 format for free. Universal compatibility for all devices.',
        inputFormat: 'aac',
        outputFormat: 'mp3'
    },
    {
        slug: 'ogg-to-mp3',
        title: 'OGG to MP3 Converter - Free Online Audio Converter',
        h1: 'Convert OGG to MP3',
        description: 'Convert OGG Vorbis files to MP3 format for free. Improve compatibility across all platforms.',
        inputFormat: 'ogg',
        outputFormat: 'mp3'
    },
    {
        slug: 'm4a-to-mp3',
        title: 'M4A to MP3 Converter - Free Online Audio Converter',
        h1: 'Convert M4A to MP3',
        description: 'Convert M4A files to MP3 format for free. Convert Apple audio to universal MP3 format.',
        inputFormat: 'm4a',
        outputFormat: 'mp3'
    },
    {
        slug: 'wav-to-flac',
        title: 'WAV to FLAC Converter - Free Online Audio Converter',
        h1: 'Convert WAV to FLAC',
        description: 'Convert WAV files to FLAC format for free. Reduce file size with lossless compression.',
        inputFormat: 'wav',
        outputFormat: 'flac'
    }
];

// Read the template HTML file
const templatePath = path.join(__dirname, 'template.html');
let template;

try {
    template = fs.readFileSync(templatePath, 'utf8');
} catch (err) {
    console.error('❌ Error: template.html not found!');
    console.error('   Please ensure template.html exists in the root directory');
    process.exit(1);
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

console.log('\n🏗️  Building SEO-optimized landing pages...\n');

// Generate homepage (index.html in public/)
const homepageHtml = template
    .replace(/\{\{TITLE\}\}/g, 'Free Audio Converter - Convert MP3, WAV, FLAC & More')
    .replace(/\{\{H1\}\}/g, '🎵 Free Audio Converter')
    .replace(/\{\{DESCRIPTION\}\}/g, 'Free online audio converter. Convert MP3, WAV, FLAC, AAC, M4A, OGG and more. Fast, simple, no signup required.')
    .replace(/\{\{CANONICAL_URL\}\}/g, '/')
    .replace(/\{\{DEFAULT_OUTPUT\}\}/g, 'mp3');

fs.writeFileSync(path.join(publicDir, 'index.html'), homepageHtml);
console.log('✓ Created: /index.html (Homepage)');

// Generate each converter page
converters.forEach(converter => {
    // Create directory for this converter
    const converterDir = path.join(publicDir, converter.slug);
    if (!fs.existsSync(converterDir)) {
        fs.mkdirSync(converterDir, { recursive: true });
    }

    // Replace placeholders in template
    const html = template
        .replace(/\{\{TITLE\}\}/g, converter.title)
        .replace(/\{\{H1\}\}/g, converter.h1)
        .replace(/\{\{DESCRIPTION\}\}/g, converter.description)
        .replace(/\{\{CANONICAL_URL\}\}/g, `/${converter.slug}/`)
        .replace(/\{\{DEFAULT_OUTPUT\}\}/g, converter.outputFormat);

    // Write the HTML file
    const filePath = path.join(converterDir, 'index.html');
    fs.writeFileSync(filePath, html);

    console.log(`✓ Created: /${converter.slug}/index.html`);
});

// Generate sitemap.xml
const sitemap = generateSitemap(converters);
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log('✓ Created: /sitemap.xml');

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
`;
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
console.log('✓ Created: /robots.txt');

// Copy static informational pages to public directory
const staticPages = [
    'formats-details.html',
    'legal-disclaimer.html',
    'file-handling.html'
];

staticPages.forEach(page => {
    const sourcePath = path.join(__dirname, page);
    const destPath = path.join(publicDir, page);

    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✓ Copied: /${page}`);
    } else {
        console.warn(`⚠️  Warning: ${page} not found, skipping`);
    }
});

console.log('\n✅ Build complete! Generated', converters.length + 1, 'pages + 3 static pages\n');
console.log('📁 All files are in the /public directory');
console.log('🚀 Run "npm start" to start the server\n');

// Helper function to generate sitemap
function generateSitemap(converters) {
    const baseUrl = 'https://yourdomain.com'; // TODO: Replace with your actual domain

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Homepage
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    // Converter pages
    converters.forEach(converter => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/${converter.slug}/</loc>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
    });

    // Static informational pages
    const staticPages = [
        'formats-details.html',
        'legal-disclaimer.html',
        'file-handling.html'
    ];

    staticPages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/${page}</loc>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
    });

    xml += '</urlset>';

    return xml;
}
