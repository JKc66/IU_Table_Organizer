const translations = {
    en: {
        title: "IU Table Organizer",
        subtitle: "Transform your Islamic University schedule into a more readable format with one click.",
        demo: {
            title: "Before & After",
            beforeTitle: "Before Organizing",
            afterTitle: "After Organizing",
            darkMode: "Dark Mode",
            lightMode: "Light Mode"
        },
        installation: {
            title: "Installation",
            intro: "Choose one of the following installation methods:",
            or: "OR",
            recommended: "Recommended",
            preferredNote: "This is the preferred installation method for the best experience",
            chromeExtension: {
                title: "Chrome Extension",
                download: "Install from Chrome Web Store",
                description: "Get the extension directly from the Chrome Web Store for the easiest installation experience",
                features: {
                    official: "Official Chrome Web Store release",
                    automatic: "Automatic updates",
                    secure: "Secure installation"
                },
                mobileNote: "Mobile Compatible!",
                mobileDesc: "Works on mobile and tablet devices using <span class=\"browser-wrapper\"><img src=\"assets/kiwi-browser.svg\" alt=\"Kiwi Browser\" class=\"browser-icon-inline\"><span class=\"browser-name\">Kiwi</span></span> browser",
                button: "Add to Browser",
                compatibleTitle: "Compatible Browsers:",
                compatibleText: "For any browser that supports Chrome Web Store extensions"
            },
            tampermonkey: {
                title: "Tampermonkey",
                description: "Choose this option if your browser doesn't support Chrome Web Store extensions",
                useFor: "Use this method for:",
                note: "Note: Both installation methods provide identical functionality",
                step1: {
                    title: "Install Tampermonkey",
                    description: "Add the Tampermonkey extension to your browser for userscript management",
                    mobileNote: "Mobile Compatible!",
                    mobileDesc: "Works on mobile and tablet devices using <span class=\"browser-wrapper\"><i class=\"browser-icon-inline fab fa-firefox\"></i><span class=\"browser-name\">Firefox</span></span>, <span class=\"browser-wrapper\"><i class=\"browser-icon-inline fab fa-edge\"></i><span class=\"browser-name\">Edge</span></span>, and <span class=\"browser-wrapper\"><img src=\"assets/kiwi-browser.svg\" alt=\"Kiwi Browser\" class=\"browser-icon-inline\"><span class=\"browser-name\">Kiwi</span></span> browsers",
                    button: "Get Tampermonkey"
                },
                step2: {
                    title: "Install Script",
                    description: "Add the IU Table Organizer script from Greasyfork to enhance your schedule",
                    features: {
                        formatting: "Automatic table formatting",
                        darkMode: "Dark mode support",
                        installation: "Easy installation"
                    },
                    button: "Install Script"
                }
            }
        },
        controls: {
            organize: "Organize Table",
            original: "Original Table",
            download: "Download as Image",
            lightTheme: "Light",
            darkTheme: "Dark"
        },
        summary: {
            subjects: "Subjects",
            hours: "Hours",
            studyDays: "Study Days",
            busiestDay: "Busiest Day"
        },
        loading: {
            title: "Loading image...",
            subtitle: "Please wait while we process the table"
        },
        credits: {
            title: "Credits",
            madeWith: "Made with love by",
            using: "Using"
        },
        contribute: {
            title: "Contribute",
            description: "Want to improve IU Table Organizer? We welcome your contributions!",
            button: "Contribute on GitHub",
            text: "Create a pull request or open an issue to help make this project even better."
        }
    },
    ar: {
        title: "منظم جدول الجامعة الإسلامية",
        subtitle: "حول جدول الجامعة الإسلامية إلى تنسيق أكثر وضوحاً بنقرة واحدة",
        demo: {
            title: "قبل وبعد",
            beforeTitle: "قبل التنظيم",
            afterTitle: "بعد التنظيم",
            darkMode: "الوضع الداكن",
            lightMode: "الوضع الفاتح"
        },
        installation: {
            title: "التثبيت",
            intro: "اختر إحدى طرق التثبيت التالية:",
            or: "أو",
            recommended: "موصى به",
            preferredNote: "هذه هي طريقة التثبيت المفضلة للحصول على أفضل تجربة",
            chromeExtension: {
                title: "إضافة المتصفح",
                download: "تثبيت من متجر كروم",
                description: "احصل على الإضافة مباشرة من متجر كروم للحصول على تجربة تثبيت سهلة",
                features: {
                    official: "إصدار رسمي من متجر كروم",
                    automatic: "تحديثات تلقائية",
                    secure: "تثبيت آمن"
                },
                mobileNote: "متوافق مع الجوال!",
                mobileDesc: "يعمل على الأجهزة المحمولة والأجهزة اللوحية باستخدام متصفح <span class=\"browser-wrapper\"><span class=\"browser-name\">Kiwi</span><img src=\"assets/kiwi-browser.svg\" alt=\"Kiwi Browser\" class=\"browser-icon-inline\"></span>",
                button: "إضافة للمتصفح",
                compatibleTitle: "متصفحات متوافقة:",
                compatibleText: "لأي متصفح يدعم متجر المتصفحات الموسعة"
            },
            tampermonkey: {
                title: "Tampermonkey",
                description: "اختر هذا الخيار إذا كان متصفحك لا يدعم متجر chrome",
                useFor: "استخدم هذه الطريقة مع:",
                note: "ملاحظة: كلتا طريقتي التثبيت توفران نفس الوظائف",
                step1: {
                    title: "تثبيت Tampermonkey",
                    description: "أضف إضافة Tampermonkey إلى متصفحك لإدارة السكربتات",
                    mobileNote: "متوافق مع الجوال!",
                    mobileDesc: "يعمل على الأجهزة المحمولة و الأجهزة اللوحية و باستخدام متصفحات <span class=\"browser-wrapper\"> <span class=\"browser-name\">Firefox</span><i class=\"browser-icon-inline fab fa-firefox\"></i></span> و <span class=\"browser-wrapper\"> <span class=\"browser-name\">Edge</span><i class=\"browser-icon-inline fab fa-edge\"></i></span> و <span class=\"browser-wrapper\"> <span class=\"browser-name\">Kiwi</span><img src=\"assets/kiwi-browser.svg\" alt=\"Kiwi Browser\" class=\"browser-icon-inline\"></span>",
                    button: "تثبيت Tampermonkey"
                },
                step2: {
                    title: "تثبيت السكربت",
                    description: "أضف سكربت منظم جدول الجامعة الإسلامية من Greasyfork  لتحسين جدولك",
                    features: {
                        formatting: "تنسيق تلقائي للجدول",
                        darkMode: "دعم الوضع الداكن",
                        installation: "تثبيت سهل"
                    },
                    button: "تثبيت السكربت"
                }
            }
        },
        controls: {
            organize: "نظم الجدول",
            original: "الجدول الأصلي",
            download: "تحميل كصورة",
            lightTheme: "فاتح",
            darkTheme: "داكن"
        },
        summary: {
            subjects: "المواد",
            hours: "الساعات",
            studyDays: "أيام الدراسة",
            busiestDay: "اليوم الأكثر"
        },
        loading: {
            title: "جارٍ تحميل الصورة...",
            subtitle: "يرجى الانتظار بينما نقوم بمعالجة الجدول"
        },
        credits: {
            title: "شكر وتقدير",
            madeWith: "صُنع بحب بواسطة",
            using: "باستخدام"
        },
        contribute: {
            title: "المساهمة",
            description: "هل ترغب في تحسين منظم جدول الجامعة الإسلامية؟ نرحب بمساهماتك!",
            button: "ساهم على GitHub",
            text: "قم بإنشاء طلب سحب أو فتح مشكلة للمساعدة في جعل هذا المشروع أفضل."
        }
    }
}; 