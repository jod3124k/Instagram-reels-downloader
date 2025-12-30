// Instagram Reels Downloader - Professional Version
// Uses Public API (No Supabase, No Authentication Issues)

const PUBLIC_API = 'https://api.rivalhub.xyz/instagram';

// DOM Elements
const DOM = {
    reelUrlInput: document.getElementById('reelUrl'),
    downloadBtn: document.getElementById('downloadBtn'),
    resultContainer: document.getElementById('resultContainer'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    errorContainer: document.getElementById('errorContainer'),
    downloadLink: document.getElementById('downloadLink'),
    btnText: document.querySelector('.btn-text'),
    btnLoading: document.querySelector('.btn-loading'),
    errorTitle: document.getElementById('errorTitle'),
    errorMessage: document.getElementById('errorMessage'),
    statNumber: document.querySelector('.stat-number')
};

// State
let downloadCount = Math.floor(Math.random() * 40000) + 10000;

// Validation
function isValidInstagramUrl(url) {
    if (!url) return false;
    const trimmed = url.trim();
    return trimmed.includes('instagram.com/reel/') || trimmed.includes('instagram.com/p/');
}

// UI Functions
function showLoading() {
    DOM.btnText.style.display = 'none';
    DOM.btnLoading.style.display = 'inline';
    DOM.downloadBtn.disabled = true;
    DOM.downloadBtn.style.opacity = '0.7';
    DOM.loadingSpinner.style.display = 'block';
    DOM.resultContainer.style.display = 'none';
    DOM.errorContainer.style.display = 'none';
}

function hideLoading() {
    DOM.btnText.style.display = 'inline';
    DOM.btnLoading.style.display = 'none';
    DOM.downloadBtn.disabled = false;
    DOM.downloadBtn.style.opacity = '1';
    DOM.loadingSpinner.style.display = 'none';
}

function showResult(videoUrl, filename) {
    DOM.downloadLink.href = videoUrl;
    DOM.downloadLink.download = filename;
    DOM.resultContainer.style.display = 'block';
    DOM.errorContainer.style.display = 'none';
    
    // Update download count
    downloadCount++;
    if (DOM.statNumber) {
        DOM.statNumber.textContent = downloadCount.toLocaleString() + '+';
    }
    
    // Auto-download after 1 second
    setTimeout(() => {
        DOM.downloadLink.click();
    }, 1000);
}

function showError(title, message) {
    DOM.errorTitle.textContent = title;
    DOM.errorMessage.textContent = message;
    DOM.errorContainer.style.display = 'block';
    DOM.resultContainer.style.display = 'none';
}

function resetTool() {
    DOM.reelUrlInput.value = '';
    DOM.resultContainer.style.display = 'none';
    DOM.errorContainer.style.display = 'none';
    DOM.reelUrlInput.focus();
    setRandomPlaceholder();
}

function setRandomPlaceholder() {
    const examples = [
        'https://www.instagram.com/reel/C5P9ZgqM4Hd/',
        'https://www.instagram.com/reel/C4xYz123AbC/',
        'https://www.instagram.com/reel/C3zXy789DeF/'
    ];
    DOM.reelUrlInput.placeholder = `e.g., ${examples[Math.floor(Math.random() * examples.length)]}`;
}

// API Call
async function downloadReel(url) {
    try {
        const apiUrl = `${PUBLIC_API}?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.videoUrl) {
            return {
                videoUrl: data.videoUrl,
                filename: `instagram_reel_${Date.now()}.mp4`
            };
        } else {
            throw new Error('No video URL found');
        }
        
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}

// Main Function
async function processReel() {
    const url = DOM.reelUrlInput.value.trim();
    
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
        // Download reel
        const result = await downloadReel(url);
        
        // Show success
        hideLoading();
        showResult(result.videoUrl, result.filename);
        
    } catch (error) {
        hideLoading();
        
        // User-friendly error messages
        if (error.message.includes('429') || error.message.includes('rate limit')) {
            showError('Too Many Requests', 'Please wait a minute and try again.');
        } else if (error.message.includes('404') || error.message.includes('not found')) {
            showError('Reel Not Found', 'The Reel might be private, deleted, or the URL is incorrect.');
        } else if (error.message.includes('No video')) {
            showError('No Video Found', 'Could not extract video from this Reel.');
        } else {
            showError('Download Failed', 'Please check your connection and try again.');
        }
    }
}

// Share function
function shareTool() {
    if (navigator.share) {
        navigator.share({
            title: 'InstaReel Downloader',
            text: 'Download Instagram Reels for free!',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard! Share it with friends.');
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set placeholder
    setRandomPlaceholder();
    
    // Set initial download count
    if (DOM.statNumber) {
        DOM.statNumber.textContent = downloadCount.toLocaleString() + '+';
    }
    
    // Enter key support
    DOM.reelUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            processReel();
        }
    });
    
    // Log
    console.log('InstaReel Downloader ready! Using public API.');
});

// Make functions globally available
window.processReel = processReel;
window.resetTool = resetTool;
window.shareTool = shareTool;
