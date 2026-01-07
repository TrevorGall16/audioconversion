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
        outputFormat: 'wav',
        uniqueContent: `
            <div class="educational-content">
                <h2>Why Convert MP3 to WAV?</h2>
                <p>Converting MP3 to WAV is essential when you need uncompressed audio for professional audio editing, music production, or burning CDs. While MP3 files are compressed and smaller, WAV files preserve the complete audio data without any quality loss, making them the preferred format for audio professionals and enthusiasts who demand the highest fidelity.</p>
                <p>WAV format is particularly important when you're working with digital audio workstations (DAWs) like Pro Tools, Logic Pro, or Ableton Live. These programs require lossless formats to apply effects, normalize audio, or master tracks without introducing additional compression artifacts. Additionally, if you're archiving music collections or preparing audio for video production, WAV ensures you maintain maximum quality throughout your workflow.</p>
                <p><strong>Common use cases:</strong> Audio editing projects, CD burning, professional music production, video soundtracks, podcast editing, and archival purposes where quality cannot be compromised.</p>
            </div>
        `
    },
    {
        slug: 'wav-to-mp3',
        title: 'WAV to MP3 Converter - Free Online Audio Converter',
        h1: 'Convert WAV to MP3',
        description: 'Convert WAV files to MP3 format for free. Reduce file size while maintaining quality.',
        inputFormat: 'wav',
        outputFormat: 'mp3',
        uniqueContent: `
            <div class="educational-content">
                <h2>Why Convert WAV to MP3?</h2>
                <p>Converting WAV to MP3 dramatically reduces file size—often by 90% or more—while maintaining perceptually similar audio quality. This makes MP3 the ideal format for sharing music online, uploading to streaming platforms, or storing large music libraries on devices with limited storage capacity. A typical 40MB WAV file becomes just 4MB as an MP3, making it practical for everyday use.</p>
                <p>MP3 is universally supported across all devices, platforms, and applications. Whether you're uploading podcasts to hosting platforms, creating playlists for smartphones, sending audio files via email, or building a music library for cloud storage services like Google Drive or Dropbox, MP3 ensures maximum compatibility without sacrificing too much quality at higher bitrates (256-320 kbps).</p>
                <p><strong>Common use cases:</strong> Podcast distribution, music sharing, email attachments, streaming uploads, portable device storage, social media audio posts, and general-purpose audio files where space efficiency matters.</p>
            </div>
        `
    },
    {
        slug: 'flac-to-mp3',
        title: 'FLAC to MP3 Converter - Free Online Audio Converter',
        h1: 'Convert FLAC to MP3',
        description: 'Convert FLAC lossless audio to MP3 format for free. Perfect for compatibility and smaller file sizes.',
        inputFormat: 'flac',
        outputFormat: 'mp3',
        uniqueContent: `
            <div class="educational-content">
                <h2>Why Convert FLAC to MP3?</h2>
                <p>FLAC (Free Lossless Audio Codec) files deliver perfect audio quality but consume 5-10 times more storage than MP3. Converting FLAC to MP3 is the practical solution when you need to free up disk space, transfer music to portable devices with limited capacity, or upload tracks to platforms that don't support lossless formats. Modern MP3 encoders at 320 kbps produce results that are virtually indistinguishable from the original for most listeners.</p>
                <p>Many smartphones, car stereos, and older MP3 players don't support FLAC playback. By converting your high-quality FLAC collection to MP3, you ensure compatibility across all your devices while maintaining excellent audio quality. This is particularly valuable for building portable music libraries for running, gym workouts, or commuting where storage space is at a premium.</p>
                <p><strong>Common use cases:</strong> Portable music players, smartphone storage optimization, car audio systems, sharing high-quality music files, creating compressed archives, and uploading to music platforms with size restrictions.</p>
            </div>
        `
    },
    {
        slug: 'mp3-to-flac',
        title: 'MP3 to FLAC Converter - Free Online Audio Converter',
        h1: 'Convert MP3 to FLAC',
        description: 'Convert MP3 files to FLAC lossless format for free. Preserve audio quality with lossless compression.',
        inputFormat: 'mp3',
        outputFormat: 'flac',
        uniqueContent: `
            <div class="educational-content">
                <h2>Should You Convert MP3 to FLAC?</h2>
                <p><strong>Important note:</strong> Converting MP3 to FLAC does NOT improve audio quality. MP3 is a lossy format that permanently discards audio data during compression. Converting it to FLAC simply creates a larger file with the same limited quality—the lost information cannot be recovered. However, this conversion is useful for specific organizational or archival purposes where you want a uniform format across your collection.</p>
                <p>You might convert MP3 to FLAC if you're building a music library with standardized lossless formats, integrating downloaded MP3 files into an archive that exclusively uses FLAC, or preparing files for systems that require FLAC input. Some audiophiles maintain FLAC-only libraries for consistency, even if some tracks originated as MP3s, clearly labeling them as "lossy source" to maintain transparency.</p>
                <p><strong>Common use cases:</strong> Library standardization, music management systems requiring uniform formats, archival organization, metadata preservation, and integration with lossless-only collections (with proper source documentation).</p>
            </div>
        `
    },
    {
        slug: 'aac-to-mp3',
        title: 'AAC to MP3 Converter - Free Online Audio Converter',
        h1: 'Convert AAC to MP3',
        description: 'Convert AAC files to MP3 format for free. Universal compatibility for all devices.',
        inputFormat: 'aac',
        outputFormat: 'mp3',
        uniqueContent: `
            <div class="educational-content">
                <h2>Why Convert AAC to MP3?</h2>
                <p>While AAC (Advanced Audio Coding) offers slightly better quality than MP3 at equivalent bitrates and is the default format for Apple devices, MP3 remains the most universally compatible audio format ever created. Converting AAC to MP3 ensures your audio files play on absolutely any device—from decade-old MP3 players to modern smart speakers, car stereos, and gaming consoles—without compatibility concerns.</p>
                <p>Many Android devices, Windows applications, and embedded systems have limited or inconsistent AAC support, while MP3 playback is guaranteed to work everywhere. If you've downloaded music from iTunes or ripped audio from Apple platforms, converting those AAC files to MP3 eliminates playback issues on non-Apple devices and ensures seamless integration with media players, DJ software, and audio editing tools that may not fully support AAC.</p>
                <p><strong>Common use cases:</strong> Cross-platform compatibility, older device support, DJ mixing software, Windows media players, Android devices, car audio systems, embedded devices, and ensuring universal playback across diverse hardware ecosystems.</p>
            </div>
        `
    },
    {
        slug: 'ogg-to-mp3',
        title: 'OGG to MP3 Converter - Free Online Audio Converter',
        h1: 'Convert OGG to MP3',
        description: 'Convert OGG Vorbis files to MP3 format for free. Improve compatibility across all platforms.',
        inputFormat: 'ogg',
        outputFormat: 'mp3',
        uniqueContent: `
            <div class="educational-content">
                <h2>Why Convert OGG to MP3?</h2>
                <p>OGG Vorbis is an excellent open-source audio codec that delivers superior quality to MP3 at lower bitrates, but it suffers from limited device support outside of desktop computers and web browsers. Converting OGG to MP3 is essential for playback on smartphones, car stereos, portable media players, and most consumer electronics, which overwhelmingly favor MP3's ubiquitous compatibility.</p>
                <p>While OGG files are common in gaming (especially indie games), voice recordings, and Linux environments, they cause playback problems on iOS devices, many Android phones, and virtually all standalone MP3 players. If you've downloaded audio from gaming platforms like Steam, recorded voice memos using open-source tools, or extracted game soundtracks, converting to MP3 ensures these files work everywhere without requiring specialized players.</p>
                <p><strong>Common use cases:</strong> Game audio extraction, voice recordings, Linux audio files, open-source project integration, mobile device playback, car stereo compatibility, and converting files from platforms that default to OGG format.</p>
            </div>
        `
    },
    {
        slug: 'm4a-to-mp3',
        title: 'M4A to MP3 Converter - Free Online Audio Converter',
        h1: 'Convert M4A to MP3',
        description: 'Convert M4A files to MP3 format for free. Convert Apple audio to universal MP3 format.',
        inputFormat: 'm4a',
        outputFormat: 'mp3',
        uniqueContent: `
            <div class="educational-content">
                <h2>Why Convert M4A to MP3?</h2>
                <p>M4A (MPEG-4 Audio) is Apple's preferred audio format, used extensively in iTunes, Apple Music, and iOS devices. While M4A offers excellent quality and efficient compression, it faces compatibility challenges outside the Apple ecosystem. Converting M4A to MP3 ensures your music, podcasts, and audiobooks play seamlessly on Android devices, Windows computers, car audio systems, and any other hardware that may not support MPEG-4 audio containers.</p>
                <p>If you've purchased music from iTunes, recorded voice memos on an iPhone, or downloaded podcasts that use M4A format, converting to MP3 makes these files truly portable. Many audio editing programs, older media players, and embedded systems (like fitness equipment with music playback) don't recognize M4A files, leading to frustrating "format not supported" errors that MP3 conversion eliminates entirely.</p>
                <p><strong>Common use cases:</strong> iTunes library migration to Android, cross-platform podcast distribution, voice memo sharing, audiobook conversion, car stereo compatibility, older device support, and ensuring playback on non-Apple hardware.</p>
            </div>
        `
    },
    {
        slug: 'wav-to-flac',
        title: 'WAV to FLAC Converter - Free Online Audio Converter',
        h1: 'Convert WAV to FLAC',
        description: 'Convert WAV files to FLAC format for free. Reduce file size with lossless compression.',
        inputFormat: 'wav',
        outputFormat: 'flac',
        uniqueContent: `
            <div class="educational-content">
                <h2>Why Convert WAV to FLAC?</h2>
                <p>Converting WAV to FLAC reduces file sizes by 40-60% while maintaining absolutely perfect audio quality—not a single bit of audio data is lost. FLAC (Free Lossless Audio Codec) uses intelligent compression algorithms similar to ZIP files, making it ideal for archiving large music collections, storing high-resolution audio, or backing up valuable recordings without sacrificing storage space unnecessarily.</p>
                <p>Audiophiles and music collectors prefer FLAC for archival purposes because it combines perfect quality with reasonable file sizes. A CD ripped to WAV might consume 700MB, while the same CD in FLAC format only requires 350-400MB—saving substantial disk space across large collections while ensuring you can always recreate the exact original WAV file when needed for editing or burning new CDs.</p>
                <p><strong>Common use cases:</strong> Music library archival, high-resolution audio storage, CD ripping and backup, professional audio archiving, reducing storage costs for lossless collections, cloud backup optimization, and maintaining perfect-quality masters with efficient compression.</p>
            </div>
        `
    },
    {
        slug: 'ogg-to-wav',
        title: 'OGG to WAV Converter - High Quality Audio Conversion',
        h1: 'Convert OGG to WAV',
        description: 'Convert OGG files to WAV format for free. High-fidelity audio conversion without losing quality.',
        inputFormat: 'ogg',
        outputFormat: 'wav',
        uniqueContent: `
            <div class="educational-content">
                <h2>Why Convert OGG to WAV?</h2>
                <p>Converting OGG to WAV is essential when you need to edit audio in professional software, as most digital audio workstations (DAWs) and video editing programs prefer uncompressed formats like WAV for maximum compatibility and processing reliability. While OGG files are compressed, WAV provides a clean, universal format that works seamlessly with Pro Tools, Adobe Premiere, Final Cut Pro, and virtually every audio editing tool.</p>
                <p>If you've extracted game audio, downloaded voice recordings, or obtained sound effects in OGG format, converting to WAV ensures these files import correctly into your projects without transcoding issues or compatibility warnings. WAV is also necessary for burning audio CDs, creating professional video soundtracks, and archiving audio in a format that will remain accessible decades from now without relying on specific codec support.</p>
                <p><strong>Common use cases:</strong> Audio editing projects, video production soundtracks, game audio editing, CD burning, professional archival, podcast editing, voiceover production, and ensuring maximum compatibility with industry-standard audio software.</p>
            </div>
        `
    },
    {
        slug: 'aac-to-wav',
        title: 'AAC to WAV Converter - Convert Apple Audio to WAV',
        h1: 'Convert AAC to WAV',
        description: 'Convert AAC to WAV online for free. Get uncompressed audio quality from your AAC files.',
        inputFormat: 'aac',
        outputFormat: 'wav',
        uniqueContent: `
            <div class="educational-content">
                <h2>Why Convert AAC to WAV?</h2>
                <p>Converting AAC to WAV is necessary when you need uncompressed audio for editing, mastering, or burning CDs. While AAC provides excellent compression and quality, professional audio work requires lossless formats to avoid introducing additional compression artifacts during processing. WAV files give you the complete audio data, ensuring your edits, effects, and mastering processes maintain maximum fidelity.</p>
                <p>Many audio editing applications, video production tools, and CD burning software work best with WAV files. If you've downloaded AAC audio from Apple Music, recorded audio on iOS devices, or received AAC files for a project, converting to WAV ensures seamless integration with professional workflows. WAV is also the standard format for audio CD creation—you cannot burn AAC files directly to CDs without conversion.</p>
                <p><strong>Common use cases:</strong> Audio editing and mastering, video soundtrack production, CD burning, podcast post-production, professional archival, voiceover editing, music production projects, and ensuring compatibility with industry-standard audio tools.</p>
            </div>
        `
    },
    {
        slug: 'm4a-to-wav',
        title: 'M4A to WAV Converter - Convert M4A to Uncompressed WAV',
        h1: 'Convert M4A to WAV',
        description: 'Convert M4A files to WAV format for free. Simple, fast, and secure audio conversion.',
        inputFormat: 'm4a',
        outputFormat: 'wav',
        uniqueContent: `
            <div class="educational-content">
                <h2>Why Convert M4A to WAV?</h2>
                <p>Converting M4A to WAV unlocks the complete audio data for professional editing, removes Apple-specific container limitations, and ensures universal compatibility with all audio software and hardware. While M4A (MPEG-4 Audio) offers good compression, WAV provides the uncompressed, raw audio data that professional audio workstations require for precise editing, effects processing, and mastering without quality loss from re-encoding.</p>
                <p>If you've purchased music from iTunes, recorded audio on an iPhone or iPad, or received M4A files from Apple-ecosystem users, converting to WAV prepares these files for serious audio work. Many Windows-based DAWs, video editing programs, and CD burning applications have limited or problematic M4A support, while WAV guarantees seamless compatibility. WAV is also required for creating standard audio CDs that play in traditional CD players.</p>
                <p><strong>Common use cases:</strong> Professional audio editing, music production and mastering, podcast editing and publishing, video production soundtracks, CD burning and replication, archival in universal format, voice recording editing, and ensuring long-term accessibility of important audio content.</p>
            </div>
        `
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
    .replace(/\{\{DEFAULT_OUTPUT\}\}/g, 'mp3')
    .replace(/\{\{UNIQUE_CONTENT\}\}/g, ''); // Homepage has no unique content

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
        .replace(/\{\{DEFAULT_OUTPUT\}\}/g, converter.outputFormat)
        .replace(/\{\{UNIQUE_CONTENT\}\}/g, converter.uniqueContent || ''); // Inject unique SEO content

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

// 2. COPY ASSETS (NEW FUNCTIONALITY)
// This ensures css/ and js/ are always copied from assets/ to public/
copyAssets();

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

function copyAssets() {
    const assetsDir = path.join(__dirname, 'assets');
    
    // Define source and dest for CSS and JS
    const mappings = [
        { src: path.join(assetsDir, 'css'), dest: path.join(publicDir, 'css') },
        { src: path.join(assetsDir, 'js'), dest: path.join(publicDir, 'js') }
    ];

    mappings.forEach(map => {
        // If source exists (e.g., assets/css), copy it
        if (fs.existsSync(map.src)) {
            // Create destination folder (public/css)
            if (!fs.existsSync(map.dest)) {
                fs.mkdirSync(map.dest, { recursive: true });
            }

            // Copy all files
            const files = fs.readdirSync(map.src);
            files.forEach(file => {
                const srcFile = path.join(map.src, file);
                const destFile = path.join(map.dest, file);
                fs.copyFileSync(srcFile, destFile);
            });
            console.log(`✓ Copied assets from ${path.basename(map.src)} to public/${path.basename(map.dest)}`);
        } else {
            console.warn(`⚠️ Warning: Source asset directory not found: ${map.src}. MAKE SURE YOU CREATED THE "assets" FOLDER!`);
        }
    });
}

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
        .replace(/\{\{DEFAULT_OUTPUT\}\}/g, 'mp3')
        .replace(/\{\{UNIQUE_CONTENT\}\}/g, '');

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