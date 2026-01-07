const fs = require('fs');
const path = require('path');

// Load environment variables
const DOMAIN = process.env.DOMAIN || 'convertaudiofast.com';
const BASE_URL = `https://www.${DOMAIN}`;

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
    },
    {
        slug: 'ogg-to-wav',
        title: 'OGG to WAV Converter - High Quality Audio Conversion',
        h1: 'Convert OGG to WAV',
        description: 'Convert OGG files to WAV format for free. High-fidelity audio conversion without losing quality.',
        inputFormat: 'ogg',
        outputFormat: 'wav'
    },
    {
        slug: 'aac-to-wav',
        title: 'AAC to WAV Converter - Convert Apple Audio to WAV',
        h1: 'Convert AAC to WAV',
        description: 'Convert AAC to WAV online for free. Get uncompressed audio quality from your AAC files.',
        inputFormat: 'aac',
        outputFormat: 'wav'
    },
    {
        slug: 'm4a-to-wav',
        title: 'M4A to WAV Converter - Convert M4A to Uncompressed WAV',
        h1: 'Convert M4A to WAV',
        description: 'Convert M4A files to WAV format for free. Simple, fast, and secure audio conversion.',
        inputFormat: 'm4a',
        outputFormat: 'wav'
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

Sitemap: ${BASE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
console.log('✓ Created: /robots.txt');


// Copy Favicon Assets
const faviconFiles = [
    'favicon.ico', 
    'favicon.svg', 
    'favicon-96x96.png', 
    'apple-touch-icon.png', 
    'site.webmanifest',
    'web-app-manifest-192x192.png',
    'web-app-manifest-512x512.png'
];

faviconFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(publicDir, file));
    }
});
console.log('✓ Copied: Favicon assets');

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
console.log('🚀 Run "node server.js" to start the server\n');

// --- HELPER FUNCTIONS ---

function generateSitemap(converters) {
    const baseUrl = BASE_URL; 

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

    // Audio Knowledge page
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/audio-knowledge/</loc>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';

    // Static pages
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

function wrapStaticPageWithTemplate(sourcePath, destPath, pageTitle, baseTemplate) {
    const originalContent = fs.readFileSync(sourcePath, 'utf-8');
    const bodyMatch = originalContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let contentToWrap = bodyMatch ? bodyMatch[1] : originalContent;

    // Clean up potentially conflicting containers from the source file
    contentToWrap = contentToWrap.replace(/<div class="container">|<\/div>\s*$/gi, '');
    contentToWrap = contentToWrap.replace(/<div class="info-page-content">|<\/div>\s*$/gi, '');

    let wrappedHtml = baseTemplate
        .replace(/\{\{TITLE\}\}/g, pageTitle)
        .replace(/\{\{H1\}\}/g, pageTitle.split('|')[0].trim().replace(/&/g, '&amp;'))
        .replace(/\{\{DESCRIPTION\}\}/g, `${pageTitle} - Free Audio Converter`)
        .replace(/\{\{CANONICAL_URL\}\}/g, `/${path.basename(destPath)}`)
        .replace(/\{\{DEFAULT_OUTPUT\}\}/g, 'mp3');

    // Replace the Main Content area with a Two-Column Layout (Content + Sidebar)
    // This ensures the 300x250 Banner appears in the sidebar
    // and the Native Banner appears below the content.
    
    const conversionAreaPattern = /<div class="main-content">[\s\S]*?<\/footer>/;
    
    const staticContentSection = `
        <div class="main-content">
            <div>
                <div class="conversion-section">
                    ${contentToWrap}
                </div>

                <div style="margin: 30px 0; display: flex; justify-content: center;">
                    <script async="async" data-cfasync="false" src="https://pl28362942.effectivegatecpm.com/e47ed53060fddab9bd61ace6c036baf8/invoke.js"></script>
                    <div id="container-e47ed53060fddab9bd61ace6c036baf8"></div>
                </div>
            </div>

            <aside class="sidebar">
                <div style="display: flex; justify-content: center; margin-bottom: 25px;">
                    <script type="text/javascript">
                        atOptions = {
                            'key' : 'fd100a56284a7742ca2c8f546b7e338a',
                            'format' : 'iframe',
                            'height' : 250,
                            'width' : 300,
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" src="https://www.highperformanceformat.com/fd100a56284a7742ca2c8f546b7e338a/invoke.js"></script>
                </div>

                <div class="features-box">
                    <h3>✨ Features</h3>
                    <ul class="feature-list">
                        <li>Free & Unlimited</li>
                        <li>Secure (Files deleted instantly)</li>
                        <li>High Quality (FFmpeg powered)</li>
                        <li>Works on Mobile & Desktop</li>
                    </ul>
                </div>
            </aside>
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
    fs.writeFileSync(destPath, wrappedHtml);
}

// Helper function to generate the dedicated Audio Knowledge page
function generateAudioKnowledgePage(publicDir, baseTemplate) {
    const knowledgeDir = path.join(publicDir, 'audio-knowledge');
    if (!fs.existsSync(knowledgeDir)) {
        fs.mkdirSync(knowledgeDir, { recursive: true });
    }

    // --- IMPROVED FORMATTING (STYLES + CONTENT) ---
    const knowledgeStyles = `
        <style>
            /* Specific formatting for Knowledge Page */
            .knowledge-page-container { max-width: 1000px; margin: 0 auto; }
            
            .content-section {
                background: white;
                border-radius: 20px;
                padding: 48px;
                margin-bottom: 40px;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                border: 1px solid #e2e8f0;
            }
            .content-section h2 { 
                font-size: 1.8rem; color: #0f172a; margin-bottom: 30px; 
                padding-bottom: 15px; border-bottom: 2px solid #f1f5f9; 
            }
            .content-section h3 { 
                font-size: 1.4rem; color: #334155; margin-top: 35px; margin-bottom: 15px; 
            }
            .content-section p, .content-section li { 
                font-size: 1.1rem; line-height: 1.7; color: #475569; margin-bottom: 15px; 
            }
            
            /* FAQ Cards */
            .faq-item {
                background: #f8fafc; border: 1px solid #e2e8f0;
                padding: 24px; border-radius: 16px; margin-bottom: 20px;
            }
            .faq-question { font-weight: 700; color: #0f172a; font-size: 1.15rem; margin-bottom: 10px; }
            
            /* Tables */
            .table-wrapper { overflow-x: auto; margin: 25px 0; }
            .comparison-table { width: 100%; border-collapse: collapse; min-width: 600px; }
            .comparison-table th { background: #f1f5f9; padding: 16px; text-align: left; font-weight: 600; color: #334155; }
            .comparison-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; color: #475569; }

            /* Grid for Terms */
            .knowledge-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
            .knowledge-term { background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .knowledge-term strong { display: block; font-size: 1.1rem; color: #0f172a; margin-bottom: 8px; }
        </style>
    `;

    const knowledgeContent = `
        <div class="knowledge-page-container">
            ${knowledgeStyles}
            
            <section class="content-section">
                <h2>📚 How Audio Conversion Works</h2>
                <p>Audio conversion is the process of changing an audio file from one format to another using specialized software called a <strong>codec</strong> (compressor-decompressor). This process involves decoding the original file and re-encoding it into the desired format.</p>

                <h3>Understanding Audio Formats</h3>
                <p>Audio formats generally fall into two main categories based on how they handle data:</p>
                <ul>
                    <li><strong>Compressed Formats (MP3, AAC):</strong> Use lossy compression to reduce file size by removing audio data that humans are less likely to notice. This makes files smaller but permanently removes some audio information.</li>
                    <li><strong>Uncompressed or Lossless Formats (WAV, FLAC):</strong> Preserve all original audio data. WAV stores everything without compression, while FLAC compresses without losing quality (like a ZIP file for audio).</li>
                </ul>

                <h3>Format Comparison</h3>
                <div class="table-wrapper">
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
                                <td>Music players, streaming</td>
                                <td>Good (data removed)</td>
                            </tr>
                            <tr>
                                <td><strong>WAV</strong></td>
                                <td>Uncompressed</td>
                                <td>Professional editing</td>
                                <td>Perfect (original)</td>
                            </tr>
                            <tr>
                                <td><strong>FLAC</strong></td>
                                <td>Lossless Compressed</td>
                                <td>Archiving, audiophiles</td>
                                <td>Perfect (no loss)</td>
                            </tr>
                            <tr>
                                <td><strong>AAC</strong></td>
                                <td>Lossy Compressed</td>
                                <td>Apple devices</td>
                                <td>Better than MP3</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <div style="margin: 40px 0; display: flex; justify-content: center;">
                <script async="async" data-cfasync="false" src="https://pl28362942.effectivegatecpm.com/e47ed53060fddab9bd61ace6c036baf8/invoke.js"></script>
                <div id="container-e47ed53060fddab9bd61ace6c036baf8"></div>
            </div>

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
                    <div class="faq-answer">No. All files are automatically deleted immediately after conversion completes. We do not store, retain, or have access to your files after you download them.</div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">What's the maximum file size I can convert?</div>
                    <div class="faq-answer">The maximum file size is 50MB. This limit ensures fast conversion times and prevents server overload.</div>
                </div>
            </section>

            <section class="content-section">
                <h2>🎓 Audio Knowledge Basics</h2>
                <p>Understanding these fundamental audio terms will help you make better decisions when converting files:</p>

                <div class="knowledge-grid">
                    <div class="knowledge-term">
                        <strong>Bitrate</strong>
                        <p>The amount of data processed per second, measured in kbps. Higher bitrate means better quality but larger file size.</p>
                    </div>

                    <div class="knowledge-term">
                        <strong>Sample Rate</strong>
                        <p>How many times per second audio is measured. CD quality is 44.1 kHz (44,100 times per second).</p>
                    </div>

                    <div class="knowledge-term">
                        <strong>Channels</strong>
                        <p>Mono has 1 channel, Stereo has 2 (left/right). Surround sound has 5 or more.</p>
                    </div>

                    <div class="knowledge-term">
                        <strong>Codec</strong>
                        <p>Software that compresses (encodes) and decompresses (decodes) audio data. Examples: MP3, AAC.</p>
                    </div>
                </div>
            </section>

            <div style="display: flex; justify-content: center; margin: 40px 0;">
                <script type="text/javascript">
                    atOptions = {
                        'key' : 'fd100a56284a7742ca2c8f546b7e338a',
                        'format' : 'iframe',
                        'height' : 250,
                        'width' : 300,
                        'params' : {}
                    };
                </script>
                <script type="text/javascript" src="https://www.highperformanceformat.com/fd100a56284a7742ca2c8f546b7e338a/invoke.js"></script>
            </div>

            <section style="text-align: center; margin-top: 40px; margin-bottom: 60px;">
                <a href="/" style="display: inline-block; padding: 14px 28px; background: #0f172a; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">← Back to Audio Converter</a>
            </section>
        </div>
    `;

    // Replace placeholders in main template
    let knowledgeHtml = baseTemplate
        .replace(/\{\{TITLE\}\}/g, 'Audio Knowledge & FAQ - Understanding Audio Conversion')
        .replace(/\{\{H1\}\}/g, '🎓 Audio Knowledge & FAQ')
        .replace(/\{\{DESCRIPTION\}\}/g, 'Learn how audio conversion works, understand audio formats, and find answers to frequently asked questions about MP3, WAV, FLAC, and other audio formats.')
        .replace(/\{\{CANONICAL_URL\}\}/g, '/audio-knowledge/')
        .replace(/\{\{DEFAULT_OUTPUT\}\}/g, 'mp3');

    // Remove the conversion UI and sidebars from the template, replace with our new content
    const mainContentPattern = /<div class="main-content">[\s\S]*?<\/aside>/;
    
    // We replace the entire main-content block with our custom knowledge content
    const knowledgeMainContent = `
        <div class="main-content" style="display: block;">
            ${knowledgeContent}
        </div>
    `;

    knowledgeHtml = knowledgeHtml.replace(mainContentPattern, knowledgeMainContent);

    // Write the HTML file
    const filePath = path.join(knowledgeDir, 'index.html');
    fs.writeFileSync(filePath, knowledgeHtml);

    console.log('✓ Created: /audio-knowledge/index.html (Educational content page)');
}