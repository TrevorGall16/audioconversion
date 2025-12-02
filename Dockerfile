# Multi-stage build for smaller image size
FROM node:18-bullseye-slim AS builder

# Install FFmpeg and dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application files
COPY . .

# Generate SEO landing pages
RUN npm run build

# Production stage
FROM node:18-bullseye-slim

# Install FFmpeg in production image
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN useradd -m -u 1001 appuser

# Set working directory
WORKDIR /app

# Copy from builder
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/public ./public
COPY --chown=appuser:appuser server.js ./
COPY --chown=appuser:appuser package.json ./

# Create directories for uploads/outputs with correct permissions
RUN mkdir -p uploads outputs && \
    chown -R appuser:appuser uploads outputs

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
