// This is the FRONTEND JavaScript
// We'll connect it to a real backend in the next step

// DOM Elements
const reelUrlInput = document.getElementById('reelUrl');
const downloadBtn = document.getElementById('downloadBtn');
const resultContainer = document.getElementById('resultContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorContainer = document.getElementById('errorContainer');
const downloadLink = document.getElementById('downloadLink');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');

// Pipedream Backend URL (WE WILL CREATE THIS IN NEXT STEP)
// For now, this is a placeholder - we'll replace it with real URL
let BACKEND_URL = 'YOUR_PIPEDREAM_URL_WILL_GO_HERE';

// Sample Instagram Reel URLs for testing (will be removed later)
const sampleUrls = [
    'https://www.instagram.com/reel/Cxample123/',
    'https://www.instagram.com/reel/Cxample456/',
    'https://www.instagram.com/reel/Cxample789/'
];

// Set a random sample URL as placeholder (optional)
function setRandomPlaceholder() {
    const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    reelUrlInput.placeholder = `e.g., ${randomUrl}`;
}

// Validate Instagram URL
function isValidInstagramUrl(url) {
    const instagramRegex = /https?:\/\/(www\.)?instagram\.com\/(reel|p)\/([a-zA-Z0-9_-]+)\/?/;
    return instagramRegex.test(url);
}

// Extract shortcode from URL
function extractShortcode(url) {
    const match = url.match(/\/(reel|p)\/([a-zA-Z0-9_-]+)\/?/);
    return match ? match[2] : null;
}

// Show loading state
function showLoading() {
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    downloadBtn.disabled = true;
    downloadBtn.style.opacity = '0.7';
    loadingSpinner.style.display = 'block';
    resultContainer.style.display = 'none';
    errorContainer.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    downloadBtn.disabled = false;
    downloadBtn.style.opacity = '1';
    loadingSpinner.style.display = 'none';
}

// Show result
function showResult(videoUrl, filename) {
    downloadLink.href = videoUrl;
    downloadLink.download = filename || 'instagram_reel.mp4';
    resultContainer.style.display = 'block';
    errorContainer.style.display = 'none';
}

// Show error
function showError(title, message) {
    document.getElementById('errorTitle').textContent = title;
    document.getElementById('errorMessage').textContent = message;
    errorContainer.style.display = 'block';
    resultContainer.style.display = 'none';
}

// Reset tool
function resetTool() {
    reelUrlInput.value = '';
    resultContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    reelUrlInput.focus();
}

// Share tool
function shareTool() {
    if (navigator.share) {
        navigator.share({
            title: 'InstaReel Downloader',
            text: 'Download Instagram Reels for free!',
            url: window.location.href
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard! Share it with friends.');
        });
    }
}

// Process Reel - MAIN FUNCTION
async function processReel() {
    const url = reelUrlInput.value.trim();
    
    // Validation
    if (!url) {
        showError('Empty URL', 'Please paste an Instagram Reel URL');
        return;
    }
    
    if (!isValidInstagramUrl(url)) {
        showError('Invalid URL', 'Please enter a valid Instagram Reel URL');
        return;
    }
    
    // Show loading
    showLoading();
    
    try {
        // TEMPORARY: Simulate API call (we'll replace with real backend)
        // For now, this will simulate a successful download
        await simulateBackendCall(url);
        
    } catch (error) {
        hideLoading();
        showError('Download Failed', 'Unable to fetch Reel. Please check the URL and try again.');
        console.error('Error:', error);
    }
}

// Simulate backend call (TEMPORARY - will be replaced)
async function simulateBackendCall(url) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For now, create a fake video URL
    // In next step, we'll replace this with real Pipedream backend
    const shortcode = extractShortcode(url);
    const fakeVideoUrl = `https://example.com/video_${shortcode || 'demo'}.mp4`;
    const filename = `instagram_reel_${shortcode || Date.now()}.mp4`;
    
    hideLoading();
    showResult(fakeVideoUrl, filename);
    
    // Log for debugging
    console.log('Simulated download for:', url);
    console.log('Shortcode:', shortcode);
}

// Auto-suggest URL format on focus
reelUrlInput.addEventListener('focus', function() {
    if (!this.value) {
        setRandomPlaceholder();
    }
});

// Allow Enter key to trigger download
reelUrlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        processReel();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setRandomPlaceholder();
    
    // Add some interactive effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Update visitor count (simulated)
    const statNumber = document.querySelector('.stat-number');
    if (statNumber) {
        // Random number between 10K and 50K
        const randomCount = Math.floor(Math.random() * 40000) + 10000;
        statNumber.textContent = randomCount.toLocaleString() + '+';
    }
    
    // Console welcome message
    console.log('InstaReel Downloader loaded successfully!');
    console.log('Backend integration coming in next step...');
});
