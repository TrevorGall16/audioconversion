# Audio Converter - Installation Guide

## Overview

This is a **server-side audio converter** with SEO-optimized landing pages. It uses:
- **Backend**: Node.js + Express + Fluent-FFmpeg
- **Frontend**: Static HTML pages (generated via build script)
- **Architecture**: Multiple physical pages for SEO (/mp3-to-wav/, /wav-to-mp3/, etc.)
- **Cleanup**: Immediate file deletion after download (no setTimeout)

---

## Prerequisites

Before installation, you need:

1. **Node.js** (v14 or higher)
   ```bash
   node --version  # Should show v14.0.0 or higher
   ```

2. **FFmpeg** installed on your system:
   - **Mac**: `brew install ffmpeg`
   - **Ubuntu/Debian**: `sudo apt-get install ffmpeg`
   - **Windows**: Download from https://ffmpeg.org/download.html

3. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

---

## Installation Steps

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server
- `multer` - File upload handling with size limits
- `fluent-ffmpeg` - FFmpeg wrapper for audio conversion
- `cors` - Cross-origin resource sharing

### Step 2: Generate SEO Landing Pages

```bash
npm run build
```

This runs the `build.js` script which:
- Reads `template.html`
- Generates 9 unique landing pages in `/public`
- Creates `sitemap.xml` and `robots.txt`

**Generated pages:**
- `/` (homepage)
- `/mp3-to-wav/`
- `/wav-to-mp3/`
- `/flac-to-mp3/`
- `/mp3-to-flac/`
- `/aac-to-mp3/`
- `/ogg-to-mp3/`
- `/m4a-to-mp3/`
- `/wav-to-flac/`

Each page has:
- Unique `<title>` tag
- Unique `<meta description>`
- Unique `<h1>` tag
- Canonical URL
- Pre-selected output format

### Step 3: Verify FFmpeg Installation

```bash
ffmpeg -version
```

You should see FFmpeg version information. If not, install FFmpeg first.

### Step 4: Start the Server

```bash
npm start
```

Output should show:
```
🚀 Audio Converter Server
   Running on: http://localhost:3000
   Environment: development
   Max file size: 50MB

   Ready to convert audio files!
```

### Step 5: Test the Application

Open your browser and go to:
- Homepage: http://localhost:3000
- MP3 to WAV: http://localhost:3000/mp3-to-wav/
- WAV to MP3: http://localhost:3000/wav-to-mp3/

---

## Project Structure

```
/audioconversion/
├── server.js                    # Express server with FFmpeg
├── build.js                     # Generates SEO landing pages
├── template.html                # HTML template with placeholders
├── package.json                 # Dependencies
├── uploads/                     # Temporary upload folder (auto-created)
├── outputs/                     # Temporary output folder (auto-created)
├── public/                      # Generated static files
│   ├── index.html              # Homepage
│   ├── sitemap.xml             # SEO sitemap
│   ├── robots.txt              # Search engine directives
│   ├── mp3-to-wav/
│   │   └── index.html          # MP3 to WAV converter page
│   ├── wav-to-mp3/
│   │   └── index.html          # WAV to MP3 converter page
│   └── ... (other converters)
├── docs/                        # Original requirements
├── TECHNICAL_DOCUMENTATION.md   # Full technical docs
└── IMPLEMENTATION_GUIDE.md      # Implementation options
```

---

## How It Works

### 1. User Uploads File
- Frontend: User drags/drops or browses for audio file
- Validation: Size < 50MB, type = audio
- FormData sent to `/convert` endpoint

### 2. Server Processes File
- Multer receives upload with hard 50MB limit
- File saved to `/uploads` directory
- FFmpeg converts to selected format
- Output saved to `/outputs` directory

### 3. Download & Cleanup
- Server sends converted file to user
- **IMMEDIATE CLEANUP**: Files deleted in download callback
- No setTimeout - guaranteed cleanup even if server restarts

### 4. Cleanup on Startup
- Server clears `/uploads` and `/outputs` on boot
- Handles any leftover files from crashes

---

## Security Features

✅ **50MB Hard Limit** - Enforced by Multer configuration
✅ **File Type Validation** - Both MIME type and extension checked
✅ **Immediate Cleanup** - Files deleted after download, not on timer
✅ **Startup Cleanup** - Clears old files on server restart
✅ **CORS Enabled** - Configurable cross-origin policy
✅ **Error Handling** - Graceful failure with file cleanup

---

## Configuration

### Change File Size Limit

Edit `server.js`:
```javascript
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 100 * 1024 * 1024  // Change to 100MB
    }
});
```

Also update `template.html`:
```html
<div>Max file size: 100MB</div>
```

### Change Port

Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000;  // Change 3000 to your port
```

Or set environment variable:
```bash
PORT=8080 npm start
```

### Add More Converters

Edit `build.js` and add to the `converters` array:
```javascript
{
    slug: 'mp3-to-aac',
    title: 'MP3 to AAC Converter - Free Online',
    h1: 'Convert MP3 to AAC',
    description: 'Convert MP3 to AAC format for free.',
    inputFormat: 'mp3',
    outputFormat: 'aac'
}
```

Then run: `npm run build`

---

## Deployment

### Option 1: Railway

1. Create account at https://railway.app
2. Connect GitHub repository
3. Railway auto-detects Node.js
4. Add FFmpeg buildpack or use Nixpacks
5. Deploy!

**Railway Config (`railway.toml`)**:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
```

### Option 2: Render

1. Create account at https://render.com
2. New > Web Service
3. Connect repository
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. FFmpeg is pre-installed on Render

### Option 3: Heroku

1. Create Heroku app
2. Add FFmpeg buildpack:
   ```bash
   heroku buildpacks:add --index 1 https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
   heroku buildpacks:add --index 2 heroku/nodejs
   ```
3. Deploy:
   ```bash
   git push heroku main
   ```

### Option 4: VPS (DigitalOcean, AWS, etc.)

1. SSH into server
2. Install Node.js and FFmpeg
3. Clone repository
4. Run:
   ```bash
   npm install
   npm run build
   npm start
   ```
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name audio-converter
   pm2 save
   pm2 startup
   ```

---

## SEO Configuration

### Update Domain in Sitemap

Edit `build.js`:
```javascript
const baseUrl = 'https://yoursite.com';  // Change this!
```

Then rebuild:
```bash
npm run build
```

### Submit to Google

1. Go to https://search.google.com/search-console
2. Add your property (domain)
3. Verify ownership
4. Submit sitemap: `https://yoursite.com/sitemap.xml`

### Add Google AdSense

Edit `template.html`, find `loadAds()` function:
```javascript
function loadAds() {
    if (!adsConsent) return;

    // Replace with your AdSense code
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXX');
    script.async = true;
    document.head.appendChild(script);
}
```

Then rebuild: `npm run build`

---

## Troubleshooting

### "FFmpeg not found"

**Solution**: Install FFmpeg on your system first.

```bash
# Mac
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Verify
ffmpeg -version
```

### "Cannot find module 'express'"

**Solution**: Install dependencies.

```bash
npm install
```

### "Error: ENOENT: no such file or directory, open 'template.html'"

**Solution**: Make sure you're in the project root directory.

```bash
cd /home/user/audioconversion
npm run build
```

### "LIMIT_FILE_SIZE: File too large"

This is expected! The 50MB limit is working. Use a smaller file.

### Port already in use

**Solution**: Change the port.

```bash
PORT=8080 npm start
```

### Conversion fails with "Invalid codec"

**Solution**: Check FFmpeg installation and supported codecs.

```bash
ffmpeg -codecs | grep mp3
```

---

## Development

### Watch Mode (Auto-restart on changes)

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when you edit `server.js`.

### Rebuild Pages After Template Changes

```bash
npm run build
```

Always rebuild after editing `template.html` or `build.js`.

---

## Environment Variables

Create a `.env` file:

```
PORT=3000
NODE_ENV=production
MAX_FILE_SIZE=52428800
```

Load with:
```javascript
require('dotenv').config();
```

---

## Testing Checklist

- [ ] Upload a small MP3 file (<5MB)
- [ ] Select WAV as output format
- [ ] Click Convert
- [ ] Download the converted file
- [ ] Open in media player - **IT SHOULD WORK**
- [ ] Check uploads/ and outputs/ folders - **SHOULD BE EMPTY**
- [ ] Try with 51MB file - **SHOULD REJECT**
- [ ] Test on mobile device
- [ ] Test all converter pages (/mp3-to-wav/, /wav-to-mp3/, etc.)
- [ ] Verify SEO tags (view source) - unique title/description per page

---

## Support

For issues:
1. Check TECHNICAL_DOCUMENTATION.md for detailed explanations
2. Check IMPLEMENTATION_GUIDE.md for troubleshooting
3. Check server logs for error messages

---

## License

ISC
