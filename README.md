# Free Audio Converter

A high-performance, SEO-optimized audio conversion website with server-side processing.

## Features

✅ **Server-Side Conversion** - Node.js + FFmpeg for reliable, fast conversions
✅ **SEO Optimized** - Multiple physical pages for maximum search visibility
✅ **Secure** - 50MB hard limit, immediate file cleanup, type validation
✅ **GDPR Compliant** - Cookie consent modal required before ads
✅ **Responsive** - Works on desktop, tablet, and mobile
✅ **Ad-Ready** - Multiple ad zones with layout stability (CLS prevention)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate SEO landing pages
npm run build

# 3. Start the server
npm start
```

Then open: http://localhost:3000

## Requirements

- Node.js v14+
- FFmpeg installed on your system

## Documentation

- **INSTALLATION.md** - Complete setup guide
- **TECHNICAL_DOCUMENTATION.md** - Full architecture explanation
- **IMPLEMENTATION_GUIDE.md** - FFmpeg integration details

## Supported Formats

MP3 • WAV • FLAC • AAC • M4A • OGG • WMA

## Live Converter Pages

- `/` - Homepage
- `/mp3-to-wav/` - MP3 to WAV Converter
- `/wav-to-mp3/` - WAV to MP3 Converter
- `/flac-to-mp3/` - FLAC to MP3 Converter
- And 5 more converters...

## Security

- Hard 50MB file size limit
- Audio file type validation
- Immediate file deletion after download
- Startup cleanup for orphaned files

## License

ISC