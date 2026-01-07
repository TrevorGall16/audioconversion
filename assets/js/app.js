/**
 * ConvertAudioFast - Main Application JavaScript
 * Free Audio Converter - Fast, Private, Browser-Based Audio Conversion
 *
 * Features:
 * - GDPR cookie consent management
 * - File upload (drag & drop + click)
 * - Audio format conversion via server-side FFmpeg
 * - Progress tracking and download
 */

// ===== COOKIE CONSENT LOGIC =====
document.addEventListener("DOMContentLoaded", function() {
    const banner = document.getElementById('cookieBanner');
    const consent = localStorage.getItem('cookie_consent');

    if (consent === 'accepted') {
        enableAds(); // Load ads immediately
    } else if (consent === 'declined') {
        // Do nothing (ads remain blocked)
    } else {
        // Show banner if no choice made
        banner.style.display = 'flex';
    }

    document.getElementById('acceptCookies').addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'accepted');
        banner.style.display = 'none';
        enableAds();
    });

    document.getElementById('declineCookies').addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'declined');
        banner.style.display = 'none';
        // Ads remain blocked
    });
});

function enableAds() {
    // Find all ad scripts blocked by type="text/plain"
    const blockedScripts = document.querySelectorAll('.adsterra-script');

    blockedScripts.forEach(script => {
        const newScript = document.createElement('script');
        // Copy attributes
        newScript.src = script.src;
        newScript.async = script.async;
        newScript.dataset.cfasync = script.dataset.cfasync;
        // Important: Insert new script next to old one so it works with document.write placement
        script.parentNode.insertBefore(newScript, script);
        // Remove old placeholder
        script.remove();
    });
    console.log("✅ Ads enabled due to user consent.");
}

// ===== CONVERSION LOGIC (Vanilla JS) =====
let selectedFile = null;
let convertedFileUrl = null;

const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const convertBtn = document.getElementById('convertBtn');
const errorMessage = document.getElementById('errorMessage');

// Click handler for upload area
uploadArea.addEventListener('click', () => fileInput.click());

// Drag & Drop handlers
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});
uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

// File input handler
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        errorMessage.textContent = '❌ File too large! Maximum size is 50MB.';
        errorMessage.classList.add('active');
        return;
    }

    selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').classList.add('active');
    convertBtn.disabled = false;
    errorMessage.classList.remove('active');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// SIMPLE CONVERSION
convertBtn.addEventListener('click', async function startConversion() {
    if (!selectedFile) return;

    // UI Update
    convertBtn.disabled = true;
    convertBtn.textContent = "Converting...";
    document.getElementById('progressContainer').classList.add('active');
    document.getElementById('resultSection').classList.remove('active');
    errorMessage.classList.remove('active');

    // Show 10% immediately
    updateProgress(10);

    const formData = new FormData();
    formData.append('audioFile', selectedFile);
    formData.append('format', document.getElementById('outputFormat').value);

    try {
        // THE ACTUAL REQUEST
        const response = await fetch('/convert', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            let msg = 'Conversion failed';
            try {
                const data = await response.json();
                msg = data.message || msg;
            } catch(e) {}
            throw new Error(msg);
        }

        // Success!
        updateProgress(100);
        const blob = await response.blob();
        convertedFileUrl = URL.createObjectURL(blob);

        // Show result
        document.getElementById('progressContainer').classList.remove('active');
        document.getElementById('resultSection').classList.add('active');

    } catch (error) {
        console.error('Conversion error:', error);
        errorMessage.textContent = "❌ " + error.message;
        errorMessage.classList.add('active');
        document.getElementById('progressContainer').classList.remove('active');
        convertBtn.disabled = false;
        convertBtn.textContent = "Convert Now";
        updateProgress(0);
    }
});

function updateProgress(percent) {
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = percent + '%';
    progressFill.textContent = Math.round(percent) + '%';
}

function downloadFile() {
    if (!convertedFileUrl) return;

    const outputFormat = document.getElementById('outputFormat').value;
    const originalName = selectedFile.name;
    const lastDotIndex = originalName.lastIndexOf('.');
    const nameWithoutExt = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
    const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();

    const a = document.createElement('a');
    a.href = convertedFileUrl;
    a.download = `${sanitized}_converted.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
