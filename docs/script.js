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

// Title animation
const letters = {
    en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    // Using isolated forms of Arabic letters for scrambling
    ar: [..."ابتثجحخدذرزسشصضطظعغفقكلمنهوي"] // Convert string to array of individual characters
};
let interval = null;

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.modal-close');

    // Ensure installation methods are visible in RTL
    function ensureRTLVisibility() {
        const methods = document.querySelector('.installation-methods');
        if (!methods) return;
        
        // Make sure the methods are visible
        methods.style.display = 'flex';
        methods.style.visibility = 'visible';
        methods.style.overflow = 'visible';
        
        // For mobile view, always place Chrome Store on top
        if (window.innerWidth <= 768) {
            // Get the preferred method (Chrome Store), separator, and alternative method (Tampermonkey)
            const preferredMethod = methods.querySelector('.preferred-method');
            const separator = methods.querySelector('.method-separator');
            const alternativeMethod = methods.querySelector('.method:not(.preferred-method)');
            
            if (preferredMethod && separator && alternativeMethod) {
                // Make sure Chrome Store is first by checking if it's not already first
                if (methods.firstElementChild !== preferredMethod) {
                    // Remove all elements
                    methods.removeChild(preferredMethod);
                    methods.removeChild(separator);
                    methods.removeChild(alternativeMethod);
                    
                    // Add them back with Chrome Store first (on top)
                    methods.appendChild(preferredMethod);
                    methods.appendChild(separator);
                    methods.appendChild(alternativeMethod);
                }
                
                // Set flex-direction to column
                methods.style.flexDirection = 'column';
            }
        } else {
            // For desktop: use row for LTR, row-reverse for RTL
            if (document.dir === 'rtl') {
                methods.style.flexDirection = 'row-reverse';
            } else {
                methods.style.flexDirection = 'row';
            }
        }
        
        // Make sure all methods are visible
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
                } else if (key.includes('mobileDesc')) {
                    // Use innerHTML for browser icon elements
                    element.innerHTML = value;
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
        if (panning && scale > 1) {
            e.preventDefault();
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
        
        // Update the title's data-value attribute based on language
        const title = document.querySelector("h1");
        if (title) {
            const titleText = newLang === 'ar' ? 'منظم جدول الجامعة الإسلامية' : 'IU Table Organizer';
            title.dataset.value = titleText;
            title.innerText = titleText;
        }
        
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
        
        // Set initial title based on stored language
        const title = document.querySelector("h1");
        if (title) {
            const titleText = storedLang === 'ar' ? 'منظم جدول الجامعة الإسلامية' : 'IU Table Organizer';
            title.dataset.value = titleText;
            title.innerText = titleText;
        }
        
        // Ensure RTL visibility after initialization
        setTimeout(ensureRTLVisibility, 0);
    }

    // Initialize translations
    updateTranslations();
    
    // Ensure RTL visibility on load
    setTimeout(ensureRTLVisibility, 100); // Increased timeout to ensure DOM is fully loaded

    // Update RTL layout on window resize
    window.addEventListener('resize', function() {
        if (document.dir === 'rtl') {
            ensureRTLVisibility();
        }
    });

    // Back to Top functionality
    let backToTopButton = document.getElementById('backToTop');
    
    // Create back-to-top button if it doesn't exist
    if (!backToTopButton) {
        backToTopButton = document.createElement('button');
        backToTopButton.id = 'backToTop';
        backToTopButton.className = 'back-to-top';
        backToTopButton.setAttribute('aria-label', 'Back to top');
        backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(backToTopButton);
    }
    
    // Add event listeners to the back-to-top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Title animation
    document.querySelector("h1").onmouseover = event => {  
        let iteration = 0;
        
        clearInterval(interval);
        
        // Get current language for scrambling
        const currentLang = document.documentElement.getAttribute('lang') || 'en';
        const scrambleLetters = letters[currentLang];
        const originalText = event.target.dataset.value;
        
        // Store original text parts (for Arabic handling)
        const textParts = currentLang === 'ar' ? 
            originalText.split(" ").filter(part => part.trim()) : 
            originalText.split("");
        
        interval = setInterval(() => {
            if (currentLang === 'ar') {
                // Handle Arabic text word by word
                event.target.innerText = textParts
                    .map((word, wordIndex) => {
                        if (wordIndex < iteration / 2) {
                            return word;
                        }
                        // Generate a random word of similar length using Arabic letters
                        return Array.from({length: word.length}, () => 
                            scrambleLetters[Math.floor(Math.random() * scrambleLetters.length)]
                        ).join('');
                    })
                    .join(" ");
                
                // Check if animation is complete
                if (iteration >= textParts.length * 2) {
                    clearInterval(interval);
                    event.target.innerText = originalText; // Ensure original text is restored
                }
            } else {
                // Original English animation
                event.target.innerText = originalText
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return letter;
                        }
                        return scrambleLetters[Math.floor(Math.random() * scrambleLetters.length)];
                    })
                    .join("");
                
                // Check if animation is complete
                if (iteration >= originalText.length) {
                    clearInterval(interval);
                    event.target.innerText = originalText; // Ensure original text is restored
                }
            }
            
            iteration += currentLang === 'ar' ? 0.5 : 1/3;
        }, currentLang === 'ar' ? 100 : 30);
    }

    // Add initial animation on page load
    document.addEventListener('DOMContentLoaded', () => {
        const title = document.querySelector("h1");
        if (title) {
            setTimeout(() => {
                const event = { target: title };
                title.onmouseover(event);
            }, 800);
        }
    });
}); 