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
        if (!modal) return;
        modal.classList.remove('active');
        if (modalImg) resetZoom(modalImg);
    }

    function showZoomInstructions() {
        const instructions = document.querySelector('.zoom-instructions');
        if (!instructions) return;
        instructions.classList.remove('hide');
        clearTimeout(instructionsTimeout);
        instructionsTimeout = setTimeout(() => {
            instructions.classList.add('hide');
        }, 2000);
    }

    function updateTranslations() {
        if (typeof translations === 'undefined') return;
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const keys = key.split('.');
            let value = translations[currentLanguage];
            for (const k of keys) {
                if (value) value = value[k];
            }
            if (value) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = value;
                } else if (key.includes('mobileDesc')) {
                    // Use innerHTML for browser icon elements
                    element.innerHTML = value;
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    // Modal Event Listeners
    if (modalImg) {
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
            if (panning && scale > 1) {
                e.preventDefault();
                pointX = e.clientX - start.x;
                pointY = e.clientY - start.y;
                setTransform(modalImg);
            }
        });

        document.addEventListener('mouseup', function() {
            panning = false;
            if (modalImg) {
                modalImg.style.cursor = scale > 1 ? 'move' : 'zoom-in';
            }
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
    }

    if (closeBtn) closeBtn.onclick = closeModal;
    if (modal) {
        modal.onclick = function(event) {
            if (event.target === modal) {
                closeModal();
            }
        };
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Image click handlers for Lightbox
    document.querySelectorAll('.demo-images img, .installation-guide img').forEach(img => {
        img.onclick = function() {
            if (!modal || !modalImg) return;
            modal.classList.add('active');
            modalImg.src = '';
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
        };
    });

    // Language toggle functionality
    window.toggleLanguage = function() {
        const htmlElement = document.documentElement;
        const currentLang = htmlElement.getAttribute('lang') || 'en';
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        const newDir = newLang === 'ar' ? 'rtl' : 'ltr';
        
        htmlElement.setAttribute('lang', newLang);
        htmlElement.setAttribute('dir', newDir);
        
        // Store the preference
        localStorage.setItem('preferredLanguage', newLang);
        localStorage.setItem('preferredDirection', newDir);

        // Update translations
        currentLanguage = newLang;
        updateTranslations();
        
        // Update the title
        const title = document.querySelector("h1[data-translate='title']");
        if (title && typeof translations !== 'undefined' && translations[newLang]) {
            title.textContent = translations[newLang].title;
        }
    };

    // Initialize language preference and translations
    const storedLang = localStorage.getItem('preferredLanguage');
    const storedDir = localStorage.getItem('preferredDirection');
    
    if (storedLang && storedDir) {
        document.documentElement.setAttribute('lang', storedLang);
        document.documentElement.setAttribute('dir', storedDir);
        currentLanguage = storedLang;
        
        const title = document.querySelector("h1[data-translate='title']");
        if (title && typeof translations !== 'undefined' && translations[storedLang]) {
            title.textContent = translations[storedLang].title;
        }
    }

    // Initialize translations
    updateTranslations();

    // Back to Top functionality
    let backToTopButton = document.getElementById('backToTop');
    
    if (!backToTopButton) {
        backToTopButton = document.createElement('button');
        backToTopButton.id = 'backToTop';
        backToTopButton.className = 'back-to-top';
        backToTopButton.setAttribute('aria-label', 'Back to top');
        backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(backToTopButton);
    }
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }, { passive: true });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
