// Global variables
let currentLanguage = 'en';
let scale = 1;
let panning = false;
let pointX = 0;
let pointY = 0;
let start = { x: 0, y: 0 };
let lastTouchDistance = 0;
let initialScale = 1;
let instructionsTimeout;

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.modal-close');

    // Ensure installation methods are visible in RTL
    function ensureRTLVisibility() {
        if (document.dir === 'rtl') {
            const methods = document.querySelector('.installation-methods');
            if (methods) {
                methods.style.display = 'flex';
                methods.style.visibility = 'visible';
                methods.style.overflow = 'visible';
                
                const allMethods = methods.querySelectorAll('.method');
                allMethods.forEach(method => {
                    method.style.display = 'block';
                    method.style.visibility = 'visible';
                    method.style.overflow = 'visible';
                });
                
                const separator = methods.querySelector('.method-separator');
                if (separator) {
                    separator.style.display = 'flex';
                    separator.style.visibility = 'visible';
                    separator.style.overflow = 'visible';
                }
            }
        }
    }

    // Functions
    function setTransform(element) {
        element.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    function resetZoom(element) {
        scale = 1;
        pointX = 0;
        pointY = 0;
        element.style.transform = `translate(0px, 0px) scale(1)`;
        element.classList.remove('zoomed');
    }

    function closeModal() {
        modal.classList.remove('active');
        resetZoom(modalImg);
    }

    function showZoomInstructions() {
        const instructions = document.querySelector('.zoom-instructions');
        instructions.classList.remove('hide');
        clearTimeout(instructionsTimeout);
        instructionsTimeout = setTimeout(() => {
            instructions.classList.add('hide');
        }, 2000);
    }

    function updateTranslations() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const keys = key.split('.');
            let value = translations[currentLanguage];
            for (const k of keys) {
                value = value[k];
            }
            if (value) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = value;
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    // Event Listeners
    modalImg.addEventListener('dblclick', function(e) {
        e.preventDefault();
        if (scale === 1) {
            scale = 2;
            pointX = (window.innerWidth / 2 - e.clientX) * 2;
            pointY = (window.innerHeight / 2 - e.clientY) * 2;
            this.classList.add('zoomed');
        } else {
            resetZoom(this);
        }
        setTransform(this);
    });

    modalImg.addEventListener('mousedown', function(e) {
        e.preventDefault();
        if (scale > 1) {
            panning = true;
            start = { x: e.clientX - pointX, y: e.clientY - pointY };
            this.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', function(e) {
        e.preventDefault();
        if (panning && scale > 1) {
            pointX = e.clientX - start.x;
            pointY = e.clientY - start.y;
            setTransform(modalImg);
        }
    });

    document.addEventListener('mouseup', function(e) {
        panning = false;
        modalImg.style.cursor = scale > 1 ? 'move' : 'zoom-in';
    });

    modalImg.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            lastTouchDistance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            initialScale = scale;
        } else if (scale > 1) {
            const touch = e.touches[0];
            start = { x: touch.clientX - pointX, y: touch.clientY - pointY };
        }
    });

    modalImg.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const distance = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            scale = Math.min(Math.max(initialScale * (distance / lastTouchDistance), 1), 4);
            this.classList.toggle('zoomed', scale > 1);
            setTransform(this);
        } else if (scale > 1) {
            const touch = e.touches[0];
            pointX = touch.clientX - start.x;
            pointY = touch.clientY - start.y;
            setTransform(this);
        }
    });

    closeBtn.onclick = closeModal;
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Image click handlers
    document.querySelectorAll('.demo-images img, .installation-guide img').forEach(img => {
        img.onclick = function() {
            modal.classList.add('active');
            modalImg.src = '';  // Clear the source first
            if (this.parentElement.tagName.toLowerCase() === 'picture') {
                const sources = this.parentElement.getElementsByTagName('source');
                for (const source of sources) {
                    if (source.srcset) {
                        modalImg.src = source.srcset;
                        break;
                    }
                }
                if (!modalImg.src) {
                    modalImg.src = this.src;
                }
            } else {
                modalImg.src = this.src;
            }
            showZoomInstructions();
        }
    });

    // Language toggle functionality
    window.toggleLanguage = function() {
        const htmlElement = document.documentElement;
        const currentLang = htmlElement.getAttribute('lang');
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        const newDir = currentLang === 'en' ? 'rtl' : 'ltr';
        
        htmlElement.setAttribute('lang', newLang);
        htmlElement.setAttribute('dir', newDir);
        
        // Store the preference
        localStorage.setItem('preferredLanguage', newLang);
        localStorage.setItem('preferredDirection', newDir);

        // Update translations
        currentLanguage = newLang;
        updateTranslations();
        
        // Ensure RTL visibility after language toggle
        setTimeout(ensureRTLVisibility, 0);
    }

    // Initialize language preference and translations
    const storedLang = localStorage.getItem('preferredLanguage');
    const storedDir = localStorage.getItem('preferredDirection');
    
    if (storedLang && storedDir) {
        document.documentElement.setAttribute('lang', storedLang);
        document.documentElement.setAttribute('dir', storedDir);
        currentLanguage = storedLang;
        // Ensure RTL visibility after initialization
        setTimeout(ensureRTLVisibility, 0);
    }

    // Initialize translations
    updateTranslations();
    
    // Ensure RTL visibility on load
    ensureRTLVisibility();

    // Update version badge
    const versionBadge = document.getElementById('version-badge');
    versionBadge.src = `https://img.shields.io/badge/version-${window.IU_VERSION}-blue.svg`;

    // Back to Top functionality
    const backToTopButton = document.getElementById('backToTop');
    
    // Show button after scrolling down 300px
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Smooth scroll to top
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}); 