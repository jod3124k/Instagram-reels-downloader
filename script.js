// Instagram Reels Downloader - Professional Version
// Connected to Supabase Edge Function

// Configuration
const CONFIG = {
    SUPABASE_URL: 'https://xqceszeyztyujlntubez.supabase.co/functions/v1/super-task',
    MAX_RETRIES: 2,
    TIMEOUT: 30000, // 30 seconds
    VERSION: '1.0.0'
};

// State management
const State = {
    isLoading: false,
    downloadCount: Math.floor(Math.random() * 40000) + 10000
};

// DOM Elements cache
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

// Utility Functions
const Utils = {
    isValidInstagramUrl(url) {
        if (!url) return false;
        const patterns = [
            /https?:\/\/(www\.)?instagram\.com\/reel\/[a-zA-Z0-9_-]+\/?/,
            /https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?/,
            /https?:\/\/(www\.)?instagram\.com\/tv\/[a-zA-Z0-9_-]+\/?/
        ];
        return patterns.some(pattern => pattern.test(url.trim()));
    },

    extractShortcode(url) {
        const match = url.match(/\/(reel|p|tv)\/([a-zA-Z0-9_-]+)\/?/);
        return match ? match[2] : `reel_${Date.now()}`;
    },

    generateFilename(url) {
        const shortcode = this.extractShortcode(url);
        return `instagram_reel_${shortcode}_${Date.now()}.mp4`;
    },

    formatNumber(num) {
        return num.toLocaleString() + '+';
    },

    setPlaceholder() {
        const examples = [
            'https://www.instagram.com/reel/C5P9ZgqM4Hd/',
            'https://www.instagram.com/reel/C4xYz123AbC/',
            'https://www.instagram.com/reel/C3zXy789DeF/'
        ];
        DOM.reelUrlInput.placeholder = `e.g., ${examples[Math.floor(Math.random() * examples.length)]}`;
    }
};

// UI Controller
const UI = {
    showLoading() {
        State.isLoading = true;
        DOM.btnText.style.display = 'none';
        DOM.btnLoading.style.display = 'inline';
        DOM.downloadBtn.disabled = true;
        DOM.downloadBtn.style.opacity = '0.7';
        DOM.loadingSpinner.style.display = 'block';
        DOM.resultContainer.style.display = 'none';
        DOM.errorContainer.style.display = 'none';
    },

    hideLoading() {
        State.isLoading = false;
        DOM.btnText.style.display = 'inline';
        DOM.btnLoading.style.display = 'none';
        DOM.downloadBtn.disabled = false;
        DOM.downloadBtn.style.opacity = '1';
        DOM.loadingSpinner.style.display = 'none';
    },

    showResult(videoUrl, filename) {
        DOM.downloadLink.href = videoUrl;
        DOM.downloadLink.download = filename;
        DOM.resultContainer.style.display = 'block';
        DOM.errorContainer.style.display = 'none';
        
        // Update download count
        State.downloadCount++;
        if (DOM.statNumber) {
            DOM.statNumber.textContent = Utils.formatNumber(State.downloadCount);
        }
        
        // Analytics event (simulated)
        this.trackEvent('download_success');
    },

    showError(title, message, isFatal = false) {
        DOM.errorTitle.textContent = title;
        DOM.errorMessage.textContent = message;
        DOM.errorContainer.style.display = 'block';
        DOM.resultContainer.style.display = 'none';
        
        if (isFatal) {
            DOM.downloadBtn.style.display = 'none';
        }
        
        this.trackEvent('download_error', { title, message });
    },

    resetUI() {
        DOM.reelUrlInput.value = '';
        DOM.resultContainer.style.display = 'none';
        DOM.errorContainer.style.display = 'none';
        DOM.downloadBtn.style.display = 'block';
        DOM.reelUrlInput.focus();
        Utils.setPlaceholder();
    },

    trackEvent(eventName, data = {}) {
        // Simulated analytics
        console.log(`[Analytics] ${eventName}:`, { ...data, timestamp: new Date().toISOString() });
    }
};

// API Service
const APIService = {
    async downloadReel(url, retryCount = 0) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

            const response = await fetch(CONFIG.SUPABASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-Version': CONFIG.VERSION
                },
                body: JSON.stringify({ url }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Unknown error from backend');
            }

            return {
                videoUrl: data.video_url,
                filename: data.filename || Utils.generateFilename(url),
                metadata: data
            };

        } catch (error) {
            // Retry logic
            if (retryCount < CONFIG.MAX_RETRIES && !error.message.includes('abort')) {
                console.log(`Retrying... (${retryCount + 1}/${CONFIG.MAX_RETRIES})`);
                return this.downloadReel(url, retryCount + 1);
            }
            throw error;
        }
    },

    getErrorDetails(error) {
        if (error.name === 'AbortError') {
            return { title: 'Timeout Error', message: 'Request took too long. Please try again.' };
        }
        
        if (error.message.includes('404') || error.message.includes('not found')) {
            return { title: 'Reel Not Found', message: 'The Reel might be private, deleted, or the URL is incorrect.' };
        }
        
        if (error.message.includes('rate limit') || error.message.includes('429')) {
            return { title: 'Rate Limited', message: 'Too many requests. Please wait a minute and try again.' };
        }
        
        if (error.message.includes('Invalid URL') || error.message.includes('400')) {
            return { title: 'Invalid URL', message: 'Please check the URL format and try again.' };
        }
        
        return { 
            title: 'Download Failed', 
            message: 'Unable to fetch Reel. Please check your connection and try again.' 
        };
    }
};

// Main Controller
const AppController = {
    async processReel() {
        const url = DOM.reelUrlInput.value.trim();
        
        // Validation
        if (!url) {
            UI.showError('Empty URL', 'Please paste an Instagram Reel URL');
            return;
        }
        
        if (!Utils.isValidInstagramUrl(url)) {
            UI.showError('Invalid URL', 'Please enter a valid Instagram Reel URL (should contain instagram.com/reel/)');
            return;
        }
        
        // Show loading state
        UI.showLoading();
        UI.trackEvent('download_started', { url: url.substring(0, 50) });
        
        try {
            // Call API
            const result = await APIService.downloadReel(url);
            
            // Show success
            UI.hideLoading();
            UI.showResult(result.videoUrl, result.filename);
            
            // Auto-download after short delay
            setTimeout(() => {
                if (DOM.downloadLink.href) {
                    DOM.downloadLink.click();
                }
            }, 800);
            
        } catch (error) {
            console.error('Download error:', error);
            UI.hideLoading();
            
            const errorDetails = APIService.getErrorDetails(error);
            UI.showError(errorDetails.title, errorDetails.message);
        }
    },

    resetTool() {
        UI.resetUI();
        UI.trackEvent('tool_reset');
    },

    shareTool() {
        if (navigator.share) {
            navigator.share({
                title: 'InstaReel Downloader',
                text: 'Download Instagram Reels for free!',
                url: window.location.href
            }).then(() => {
                UI.trackEvent('share_success');
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Link copied to clipboard! Share it with friends.');
                UI.trackEvent('share_clipboard');
            });
        }
    }
};

// Event Handlers
const EventHandlers = {
    init() {
        // Enter key support
        DOM.reelUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !State.isLoading) {
                AppController.processReel();
            }
        });
        
        // Input validation feedback
        DOM.reelUrlInput.addEventListener('input', (e) => {
            const isValid = Utils.isValidInstagramUrl(e.target.value);
            DOM.downloadBtn.style.backgroundColor = isValid 
                ? 'linear-gradient(90deg, #E1306C, #833AB4)'
                : 'linear-gradient(90deg, #999, #666)';
        });
        
        // Initialize UI
        Utils.setPlaceholder();
        
        // Set initial download count
        if (DOM.statNumber) {
            DOM.statNumber.textContent = Utils.formatNumber(State.downloadCount);
        }
        
        // Add animation to features
        this.animateFeatures();
        
        // Log initialization
        console.log(`InstaReel Downloader v${CONFIG.VERSION} initialized`);
        console.log('Backend:', CONFIG.SUPABASE_URL);
    },
    
    animateFeatures() {
        const features = document.querySelectorAll('.feature-card');
        features.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-feature');
        });
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    EventHandlers.init();
    
    // Make functions available globally
    window.processReel = () => AppController.processReel();
    window.resetTool = () => AppController.resetTool();
    window.shareTool = () => AppController.shareTool();
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-feature {
            animation: fadeInUp 0.5s ease forwards;
            opacity: 0;
        }
        .download-btn:hover {
            transform: scale(1.05);
            transition: transform 0.2s ease;
        }
    `;
    document.head.appendChild(style);
});
