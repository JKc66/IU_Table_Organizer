// Central version number for IU Table Organizer (fallback version)
const LOCAL_VERSION = '4.1';
const EXTENSION_ID = 'oopkbojbjpdehknlnajbgedjjgafjbec';

// Set initial version
window.IU_VERSION = LOCAL_VERSION;

// Debug mode flag
window.DEBUG_VERSION = false;

// Cache settings
const CACHE_KEY = 'iu_version_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const FORCE_CHECK_KEY = 'iu_last_force_check';
const FORCE_CHECK_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Function to check if we should force a fresh check
function shouldForceCheck() {
    try {
        const lastCheck = parseInt(localStorage.getItem(FORCE_CHECK_KEY) || '0');
        const shouldCheck = (Date.now() - lastCheck) > FORCE_CHECK_INTERVAL;
        if (shouldCheck && window.DEBUG_VERSION) {
            console.log('Weekly force check triggered');
        }
        return shouldCheck;
    } catch (e) {
        return true;
    }
}

// Function to update last force check timestamp
function updateForceCheckTimestamp() {
    try {
        localStorage.setItem(FORCE_CHECK_KEY, Date.now().toString());
    } catch (e) {
        console.warn('Error updating force check timestamp:', e);
    }
}

// Function to check if cached version is valid
function getCachedVersion() {
    try {
        // If it's time for a force check, ignore cache
        if (shouldForceCheck()) {
            return null;
        }

        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        if (cache.timestamp && (Date.now() - cache.timestamp) < CACHE_DURATION) {
            if (window.DEBUG_VERSION) {
                console.log('Using cached version:', cache.version);
            }
            return cache.version;
        }
    } catch (e) {
        console.warn('Error reading cache:', e);
    }
    return null;
}

// Function to cache version
function cacheVersion(version) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            version,
            timestamp: Date.now()
        }));
        updateForceCheckTimestamp();
    } catch (e) {
        console.warn('Error caching version:', e);
    }
}

// Function to fetch with timeout
async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (e) {
        clearTimeout(timeoutId);
        throw e;
    }
}

// Function to fetch Chrome Web Store version
async function fetchChromeStoreVersion() {
    if (window.DEBUG_VERSION) {
        console.log('Fetching version from Chrome Web Store...');
    }

    // Check cache first
    const cachedVersion = getCachedVersion();
    if (cachedVersion) {
        return cachedVersion;
    }
    
    try {
        // Use allorigins.win as CORS proxy
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const targetUrl = encodeURIComponent(`https://chrome.google.com/webstore/detail/${EXTENSION_ID}?hl=en`);
        
        // Try primary proxy
        const response = await fetchWithTimeout(proxyUrl + targetUrl);
        const data = await response.json();
        const text = data.contents;
        
        if (window.DEBUG_VERSION) {
            console.log('Response received, searching for version...');
        }
        
        // Parse version from the response using the correct HTML structure
        const versionMatch = text.match(/<div class="nws2nb">Version<\/div>\s*<div class="N3EXSc">([^<]+)<\/div>/i);
        if (versionMatch && versionMatch[1]) {
            const version = versionMatch[1].trim();
            if (window.DEBUG_VERSION) {
                console.log('Version found:', version);
            }
            // Cache the successfully fetched version
            cacheVersion(version);
            return version;
        }
        throw new Error('Version not found in response');
    } catch (error) {
        console.warn('Failed to fetch Chrome Web Store version:', error);
        return LOCAL_VERSION;
    }
}

// Function to set version badge
window.setVersionBadge = async function() {
    const versionBadge = document.getElementById('version-badge');
    if (!versionBadge) return;

    // Try to get Chrome Web Store version
    const version = await fetchChromeStoreVersion();
    window.IU_VERSION = version;

    // Set alt text
    versionBadge.alt = `Version ${version}`;
    
    // Create and set the badge
    const badgeUrl = `https://img.shields.io/badge/version-${version}-blue.svg`;
    
    // Create a new image to test loading
    const tempImg = new Image();
    tempImg.onload = function() {
        versionBadge.src = badgeUrl;
        if (window.DEBUG_VERSION) {
            console.log('Version badge updated successfully');
        }
    };
    tempImg.onerror = function() {
        // Fallback: create a text node with version
        const span = document.createElement('span');
        span.className = 'version-text';
        span.textContent = `Version ${version}`;
        versionBadge.parentNode.replaceChild(span, versionBadge);
        if (window.DEBUG_VERSION) {
            console.log('Fallback to text version display');
        }
    };
    tempImg.src = badgeUrl;
};

// Test function to manually check version
window.testVersionFetch = async function(bypassCache = false) {
    window.DEBUG_VERSION = true;
    console.log('Starting version test...');
    console.log('Local version:', LOCAL_VERSION);
    
    if (bypassCache) {
        localStorage.removeItem(CACHE_KEY);
        console.log('Cache bypassed for testing');
    }
    
    try {
        const version = await fetchChromeStoreVersion();
        console.log('Fetched version:', version);
        console.log('Test completed successfully');
    } catch (error) {
        console.error('Test failed:', error);
    }
    
    await setVersionBadge();
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LOCAL_VERSION;
} else {
    window.IU_VERSION = LOCAL_VERSION;
}

// Auto-run version check on load
document.addEventListener('DOMContentLoaded', setVersionBadge); 