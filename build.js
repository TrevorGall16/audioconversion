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

Sitemap: https://www.convertaudiofast.com/sitemap.xml
`;
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
console.log('✓ Created: /robots.txt');
// --- PASTE THE ADS.TXT COPY COMMAND HERE ---
fs.copyFileSync('ads.txt', 'public/ads.txt'); // <--- PASTE THIS LINE HERE
console.log('✓ Copied: /ads.txt');
// Generate dedicated Audio Knowledge page with educational content
generateAudioKnowledgePage(publicDir, template);

// Wrap and copy static informational pages with new SaaS styling
const staticPages = [
    { file: 'formats-details.html', title: 'Audio Format Details - Technical Specifications' },
    { file: 'legal-disclaimer.html', title: 'Legal Disclaimer & Copyright Information' },
    { file: 'file-handling.html', title: 'Privacy & File Handling Policy' },
    { file: 'privacy-policy.html', title: 'Privacy Policy' }
];

staticPages.forEach(page => {
    const sourcePath = path.join(__dirname, page.file);
    const destPath = path.join(publicDir, page.file);

    if (fs.existsSync(sourcePath)) {
        wrapStaticPageWithTemplate(sourcePath, destPath, page.title, template);
        console.log(`✓ Wrapped & Copied: /${page.file}`);
    } else {
        console.warn(`⚠️  Warning: ${page.file} not found, skipping`);
    }
});

console.log('\n✅ Build complete! Generated', converters.length + 1, 'converter pages + 1 knowledge page + 4 static pages\n');
console.log('📁 All files are in the /public directory');
console.log('🚀 Run "npm start" to start the server\n');

// Helper function to generate sitemap
function generateSitemap(converters) {
    const baseUrl = 'https://www.convertaudiofast.com'; // TODO: Replace with your actual domain

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

    // Audio Knowledge page (high-value educational content)
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/audio-knowledge/</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';

    // Static informational pages
    const staticPages = [
        'formats-details.html',
        'legal-disclaimer.html',
        'file-handling.html',
        'privacy-policy.html'
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

// Helper function to wrap static pages with new SaaS template
function wrapStaticPageWithTemplate(sourcePath, destPath, pageTitle, baseTemplate) {
    // Read the original static page content
    const originalContent = fs.readFileSync(sourcePath, 'utf-8');

    // Extract just the body content (everything inside .info-page-content or main content area)
    const bodyMatch = originalContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let contentToWrap = bodyMatch ? bodyMatch[1] : originalContent;

    // Remove any existing container divs and keep just the core content
    contentToWrap = contentToWrap.replace(/<div class="container">|<\/div>\s*$/gi, '');
    contentToWrap = contentToWrap.replace(/<div class="info-page-content">|<\/div>\s*$/gi, '');

    // Create wrapped HTML using the new template structure
    let wrappedHtml = baseTemplate
        .replace(/\{\{TITLE\}\}/g, pageTitle)
        .replace(/\{\{H1\}\}/g, pageTitle.split('|')[0].trim().replace(/&/g, '&amp;'))
        .replace(/\{\{DESCRIPTION\}\}/g, `${pageTitle} - Free Audio Converter`)
        .replace(/\{\{CANONICAL_URL\}\}/g, `/${path.basename(destPath)}`)
        .replace(/\{\{DEFAULT_OUTPUT\}\}/g, 'mp3');

    // Remove the entire main-content section (conversion UI) and replace with static content
    const conversionAreaPattern = /<div class="main-content">[\s\S]*?<\/footer>/;
    const staticContentSection = `
        <div class="main-content">
            <div class="conversion-area" style="max-width: 900px; margin: 0 auto;">
                <div class="conversion-section">
                    ${contentToWrap}
                </div>
            </div>
        </div>

        <footer>
            <p style="font-weight: 600; margin-bottom: 10px;">&copy; 2025 Free Audio Converter. All rights reserved.</p>
            <p style="margin-top: 10px; font-size: 0.9rem;">Fast, free, and simple audio file conversion.</p>
            <p style="margin-top: 15px; font-size: 0.9rem;">
                <a href="/legal-disclaimer.html">Legal Disclaimer</a> |
                <a href="/privacy-policy.html">Privacy Policy</a> |
                <a href="/file-handling.html">Privacy & File Handling</a>
            </p>
        </footer>
    `;

    wrappedHtml = wrappedHtml.replace(conversionAreaPattern, staticContentSection);

    // Write the wrapped content
    fs.writeFileSync(destPath, wrappedHtml);
}

// Helper function to generate the dedicated Audio Knowledge page
function generateAudioKnowledgePage(publicDir, baseTemplate) {
    // Create directory for audio-knowledge page
    const knowledgeDir = path.join(publicDir, 'audio-knowledge');
    if (!fs.existsSync(knowledgeDir)) {
        fs.mkdirSync(knowledgeDir, { recursive: true });
    }

    // Educational content blocks (extracted from original template)
    const knowledgeContent = `
                <!-- How Audio Conversion Works (Priority 1, Item 1) -->
                <section class="content-section">
                    <h2>📚 How Audio Conversion Works</h2>
                    <p>Audio conversion is the process of changing an audio file from one format to another using specialized software called a <strong>codec</strong> (compressor-decompressor). This process involves decoding the original file and re-encoding it into the desired format.</p>

                    <h3>Understanding Audio Formats</h3>
                    <p>Audio formats fall into two main categories:</p>
                    <ul>
                        <li><strong>Compressed Formats (MP3, AAC):</strong> Use lossy compression to reduce file size by removing audio data that humans are less likely to notice. This makes files smaller but permanently removes some audio information.</li>
                        <li><strong>Uncompressed or Lossless Formats (WAV, FLAC):</strong> Preserve all original audio data. WAV stores everything without compression, while FLAC compresses without losing quality (like a ZIP file for audio).</li>
                    </ul>

                    <h3>When Is Quality Lost?</h3>
                    <p><strong>Lossy Conversion:</strong> Converting from any format to MP3, AAC, or OGG results in quality loss because these formats discard audio data to achieve smaller file sizes.</p>
                    <p><strong>Lossless Conversion:</strong> Converting from WAV to FLAC (or vice versa) preserves perfect quality because both formats retain all audio data. However, converting from MP3 to WAV won't restore lost quality—it just creates a larger file with the same limited quality.</p>

                    <h3>Format Comparison</h3>
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th>Format</th>
                                <th>Type</th>
                                <th>Typical Use</th>
                                <th>Quality</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>MP3</strong></td>
                                <td>Lossy Compressed</td>
                                <td>Music players, streaming, general use</td>
                                <td>Good (some data removed)</td>
                            </tr>
                            <tr>
                                <td><strong>WAV</strong></td>
                                <td>Uncompressed</td>
                                <td>Professional editing, studio recording</td>
                                <td>Perfect (no compression)</td>
                            </tr>
                            <tr>
                                <td><strong>FLAC</strong></td>
                                <td>Lossless Compressed</td>
                                <td>Archiving, audiophile collections</td>
                                <td>Perfect (compressed but no loss)</td>
                            </tr>
                            <tr>
                                <td><strong>AAC</strong></td>
                                <td>Lossy Compressed</td>
                                <td>Apple devices, streaming platforms</td>
                                <td>Better than MP3 at same bitrate</td>
                            </tr>
                        </tbody>
                    </table>

                    <p><a href="/formats-details.html" style="color: #667eea; font-weight: 600;">→ Learn more about audio formats and technical details</a></p>
                </section>

                <!-- FAQ Section (Priority 2, Item 6) -->
                <section class="content-section">
                    <h2>❓ Frequently Asked Questions</h2>

                    <div class="faq-item">
                        <div class="faq-question">Does converting MP3 to WAV improve quality?</div>
                        <div class="faq-answer">No. Converting MP3 to WAV does not improve quality. MP3 is a lossy format that permanently removes audio data during compression. Converting it to WAV only creates a larger file with the same limited quality. The lost data cannot be recovered.</div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question">What is lossless audio?</div>
                        <div class="faq-answer">Lossless audio formats (like FLAC and WAV) preserve all original audio data without any quality loss. FLAC uses compression similar to ZIP files, reducing file size without removing data. WAV stores audio completely uncompressed.</div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question">Which format is best for music production?</div>
                        <div class="faq-answer">WAV or FLAC are best for music production and editing. These lossless formats preserve all audio data, giving you the highest quality for processing and editing. Use MP3 or AAC only for final distribution.</div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question">Are my files stored on your server?</div>
                        <div class="faq-answer">No. All files are automatically deleted immediately after conversion completes. We do not store, retain, or have access to your files after you download them. <a href="/file-handling.html" style="color: #667eea;">Learn more about our privacy policy</a>.</div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question">What's the difference between bitrate and sample rate?</div>
                        <div class="faq-answer">Bitrate (measured in kbps) determines how much data is used per second of audio—higher bitrate means better quality but larger files. Sample rate (measured in Hz) determines how many times per second the audio is measured—CD quality is 44.1 kHz.</div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question">Can I convert protected or DRM files?</div>
                        <div class="faq-answer">No. This converter cannot process files with DRM (Digital Rights Management) protection. You can only convert files you legally own or have permission to modify.</div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question">Why is my converted file larger than the original?</div>
                        <div class="faq-answer">Converting from a compressed format (like MP3) to an uncompressed format (like WAV) results in much larger files because WAV stores all audio data without compression. The quality remains the same as the original MP3—only the file size increases.</div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question">What's the maximum file size I can convert?</div>
                        <div class="faq-answer">The maximum file size is 50MB. This limit ensures fast conversion times and prevents server overload. For most audio files, this allows 30-60 minutes of audio depending on the format and quality.</div>
                    </div>
                </section>

                <!-- Audio Knowledge Basics (Priority 3, Item 7) -->
                <section class="content-section">
                    <h2>🎓 Audio Knowledge Basics</h2>
                    <p>Understanding these fundamental audio terms will help you make better decisions when converting files:</p>

                    <div class="knowledge-grid">
                        <div class="knowledge-term">
                            <strong>Bitrate</strong>
                            <p>The amount of data processed per second, measured in kbps (kilobits per second). Higher bitrate means better quality but larger file size.</p>
                        </div>

                        <div class="knowledge-term">
                            <strong>Sample Rate</strong>
                            <p>How many times per second audio is measured, expressed in Hz (Hertz). CD quality is 44.1 kHz, meaning 44,100 measurements per second.</p>
                        </div>

                        <div class="knowledge-term">
                            <strong>Channels</strong>
                            <p>Number of independent audio signals. Mono has 1 channel, stereo has 2 channels (left and right), and surround sound has 5 or more channels.</p>
                        </div>

                        <div class="knowledge-term">
                            <strong>Dynamic Range</strong>
                            <p>The difference between the quietest and loudest sounds in an audio file. Greater dynamic range provides more detail and realism.</p>
                        </div>

                        <div class="knowledge-term">
                            <strong>Codec</strong>
                            <p>Software that compresses (encodes) and decompresses (decodes) audio data. Examples include MP3, AAC, and FLAC codecs.</p>
                        </div>
                    </div>
                </section>

                <section class="content-section" style="text-align: center; margin-top: 40px;">
                    <a href="/" class="back-to-converter">← Back to Audio Converter</a>
                </section>
    `;

    // Replace the concise summary section with full knowledge content
    let knowledgeHtml = baseTemplate
        .replace(/\{\{TITLE\}\}/g, 'Audio Knowledge & FAQ - Understanding Audio Conversion')
        .replace(/\{\{H1\}\}/g, '🎓 Audio Knowledge & FAQ')
        .replace(/\{\{DESCRIPTION\}\}/g, 'Learn how audio conversion works, understand audio formats, and find answers to frequently asked questions about MP3, WAV, FLAC, and other audio formats.')
        .replace(/\{\{CANONICAL_URL\}\}/g, '/audio-knowledge/')
        .replace(/\{\{DEFAULT_OUTPUT\}\}/g, 'mp3');

    // Remove the entire conversion UI section and all main content, replace with educational content only
    const mainContentPattern = /<div class="main-content">[\s\S]*?<aside>[\s\S]*?<\/aside>\s*<\/div>/;
    const knowledgeMainContent = `
        <div class="main-content" style="display: block; max-width: 1000px; margin: 0 auto;">
            <div class="conversion-area">
                ${knowledgeContent}
            </div>
        </div>
    `;

    knowledgeHtml = knowledgeHtml.replace(mainContentPattern, knowledgeMainContent);

    // Write the HTML file
    const filePath = path.join(knowledgeDir, 'index.html');
    fs.writeFileSync(filePath, knowledgeHtml);

    console.log('✓ Created: /audio-knowledge/index.html (Educational content page)');
}
