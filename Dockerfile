# Use a stable Node.js image based on Debian (Bullseye) which makes installing FFmpeg easy
FROM node:18-bullseye

# 1. Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

# 2. Set working directory
WORKDIR /app

# 3. Install Dependencies
COPY package*.json ./
RUN npm install

# 4. Copy Source Code
COPY . .

# 5. Build the Static Pages (Sitemap, HTML, etc.)
RUN node build.js

# 6. Start the Server
EXPOSE 3000
CMD ["node", "server.js"]
