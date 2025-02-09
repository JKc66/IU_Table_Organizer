// Central version number for IU Table Organizer
const VERSION = '4.0';

// Set version immediately to ensure it's available
window.IU_VERSION = VERSION;

// Function to set version badge
window.setVersionBadge = function() {
    const versionBadge = document.getElementById('version-badge');
    if (!versionBadge) return;

    // Set alt text immediately
    versionBadge.alt = `Version ${VERSION}`;
    
    // Create and set the badge
    const badgeUrl = `https://img.shields.io/badge/version-${VERSION}-blue.svg`;
    
    // Create a new image to test loading
    const tempImg = new Image();
    tempImg.onload = function() {
        versionBadge.src = badgeUrl;
    };
    tempImg.onerror = function() {
        // Fallback: create a text node with version
        const span = document.createElement('span');
        span.className = 'version-text';
        span.textContent = `Version ${VERSION}`;
        versionBadge.parentNode.replaceChild(span, versionBadge);
    };
    tempImg.src = badgeUrl;
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VERSION;
} else {
    window.IU_VERSION = VERSION;
} 