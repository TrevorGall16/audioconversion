# Deployment Guide

This application requires **Node.js** and **FFmpeg** to run. The included `Dockerfile` handles both automatically.

---

## Recommended Platforms

### ✅ Railway (Easiest)
### ✅ Render (Free tier available)
### ✅ Fly.io (Good performance)
### ⚠️ Heroku (Requires buildpack)
### ❌ Netlify/Vercel (Static only, won't work)

---

## Option 1: Railway (Recommended)

**Railway** automatically detects Docker and includes FFmpeg support.

### Steps:

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Go to Railway**
   - Visit: https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Railway auto-detects**
   - Sees `Dockerfile`
   - Builds automatically
   - Deploys!

4. **Configure (Optional)**
   - Add custom domain
   - Set environment variables (if needed)

5. **Done!**
   - Your app is live at: `https://your-app.railway.app`

**Cost**: ~$5/month for small traffic

---

## Option 2: Render (Free Tier Available)

**Render** has FFmpeg pre-installed and supports Docker.

### Steps:

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Go to Render**
   - Visit: https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Build**
   - **Environment**: Docker
   - **Build Command**: (Auto-detected from Dockerfile)
   - **Start Command**: (Auto-detected from Dockerfile)
   - **Plan**: Free (or Starter for better performance)

4. **Environment Variables** (Optional)
   ```
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait ~5 minutes for build

6. **Done!**
   - Your app is live at: `https://your-app.onrender.com`

**Cost**: FREE (with limitations) or $7/month for paid tier

---

## Option 3: Fly.io

**Fly.io** offers great performance and supports Docker.

### Steps:

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Launch App**
   ```bash
   fly launch
   ```

   Fly will:
   - Detect your Dockerfile
   - Ask for app name
   - Ask for region
   - Generate `fly.toml`

4. **Deploy**
   ```bash
   fly deploy
   ```

5. **Open App**
   ```bash
   fly open
   ```

**Cost**: ~$3-5/month depending on usage

---

## Option 4: Heroku (Requires Buildpack)

**Heroku** needs a buildpack for FFmpeg.

### Steps:

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create your-app-name
   ```

4. **Add FFmpeg Buildpack**
   ```bash
   heroku buildpacks:clear
   heroku buildpacks:add --index 1 https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
   heroku buildpacks:add --index 2 heroku/nodejs
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open**
   ```bash
   heroku open
   ```

**Cost**: $7/month minimum (no free tier anymore)

---

## Local Docker Testing

### Test with Docker Compose

```bash
# Build and start
docker-compose up --build

# Open browser
open http://localhost:3000

# Stop
docker-compose down
```

### Test with Docker directly

```bash
# Build image
docker build -t audio-converter .

# Run container
docker run -p 3000:3000 audio-converter

# Open browser
open http://localhost:3000

# Stop (Ctrl+C)
```

---

## VPS Deployment (DigitalOcean, AWS, etc.)

If you prefer a traditional VPS:

### Steps:

1. **SSH into server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/audioconversion.git
   cd audioconversion
   ```

4. **Build and run**
   ```bash
   docker-compose up -d
   ```

5. **Setup Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Setup SSL with Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Environment Variables

You can set these in your deployment platform:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `MAX_FILE_SIZE` | `52428800` | Max upload size (50MB) |

---

## Post-Deployment Checklist

- [ ] App is accessible at your URL
- [ ] Upload a small MP3 file
- [ ] Convert to WAV
- [ ] Download works
- [ ] File actually plays (VERIFY THIS!)
- [ ] Check logs - no errors
- [ ] Test with 51MB file - should reject
- [ ] Test consent modal - appears on first visit
- [ ] Update `build.js` with your domain (line 113)
- [ ] Rebuild: `npm run build`
- [ ] Redeploy
- [ ] Submit sitemap to Google Search Console

---

## Updating Your Deployment

### Railway/Render (Auto-deploy)
```bash
git add .
git commit -m "Update"
git push origin main
# Auto-deploys!
```

### Fly.io
```bash
fly deploy
```

### Heroku
```bash
git push heroku main
```

### Docker (Manual)
```bash
git pull
docker-compose down
docker-compose up -d --build
```

---

## Monitoring

### Check Logs

**Railway**: Dashboard → Deployments → Logs

**Render**: Dashboard → Logs tab

**Fly.io**:
```bash
fly logs
```

**Heroku**:
```bash
heroku logs --tail
```

**Docker**:
```bash
docker-compose logs -f
```

### Health Check

All platforms will use the `/health` endpoint:

```bash
curl https://your-app.com/health
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 12345.67,
  "timestamp": "2025-11-30T10:00:00.000Z"
}
```

---

## Troubleshooting

### "FFmpeg not found"

**Solution**: Use the Dockerfile (FFmpeg is included)

### "Port already in use"

**Railway/Render**: Automatically handled
**Local**: Change port in docker-compose.yml

### "Build failed"

Check:
- Dockerfile syntax
- Node version compatibility
- FFmpeg installation logs

### "Conversion fails"

Check server logs:
```bash
# Railway/Render: Check dashboard logs
# Fly.io: fly logs
# Docker: docker-compose logs
```

Common issues:
- Input file corrupted
- Unsupported codec
- File too large

---

## Scaling

### Railway
- Auto-scales based on traffic
- Can add replicas in settings

### Render
- Upgrade to paid plan for auto-scaling
- Add more instances manually

### Fly.io
- Scale regions: `fly scale count 3`
- Scale VM size: `fly scale vm shared-cpu-1x`

---

## Cost Estimation

| Platform | Free Tier | Paid Tier | Notes |
|----------|-----------|-----------|-------|
| **Railway** | ❌ | $5-20/mo | Pay for usage |
| **Render** | ✅ (limited) | $7/mo | Free tier spins down |
| **Fly.io** | ✅ (limited) | $3-10/mo | Good free allowance |
| **Heroku** | ❌ | $7/mo | No free tier |

**Recommendation**: Start with **Render** (free tier) or **Railway** (if you can afford $5/mo)

---

## Support

For deployment issues:
- Railway: https://railway.app/help
- Render: https://render.com/docs
- Fly.io: https://fly.io/docs
- Heroku: https://devcenter.heroku.com

For application issues:
- Check `INSTALLATION.md`
- Check `TECHNICAL_DOCUMENTATION.md`
- Review server logs
