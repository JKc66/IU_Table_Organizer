// Central version number for IU Table Organizer
const VERSION = '3.0.1';

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VERSION;
} else {
    window.IU_VERSION = VERSION;
} 