/**
 * Willful IT - i18n (Internationalization)
 * Language switching functionality for Portuguese/English
 */

(function() {
    'use strict';

    // Constants
    const DEFAULT_LANG = 'pt';
    const STORAGE_KEY = 'willful-lang';

    // State
    let currentLang = DEFAULT_LANG;

    /**
     * Get current language from HTML lang attribute
     */
    function getCurrentLanguage() {
        return document.documentElement.lang || DEFAULT_LANG;
    }

    /**
     * Update HTML lang attribute
     */
    function updateHtmlLang(lang) {
        document.documentElement.lang = lang;
    }

    /**
     * Save language preference to localStorage
     */
    function saveLangPreference(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            console.warn('Could not save language preference:', e);
        }
    }

    /**
     * Load language preference from localStorage
     */
    function loadLangPreference() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Could not load language preference:', e);
            return null;
        }
    }

    /**
     * Get nested translation from translations object
     * e.g., getTranslation('hero.tagline', 'en') -> translations.hero.tagline.en
     */
    function getTranslation(key, lang) {
        const keys = key.split('.');
        let value = window.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return null;
            }
        }

        if (value && typeof value === 'object' && lang in value) {
            return value[lang];
        }

        console.warn(`Translation not found for key: ${key}, lang: ${lang}`);
        return null;
    }

    /**
     * Translate all elements with data-i18n attribute
     */
    function translatePage(lang) {
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getTranslation(key, lang);

            if (translation) {
                // Use innerHTML to preserve HTML tags (like <span class="highlight">)
                element.innerHTML = translation;
            }
        });

        // Update HTML lang attribute
        updateHtmlLang(lang);
        currentLang = lang;
    }

    /**
     * Update language switcher UI to reflect current language
     */
    function updateSwitcherUI(lang) {
        const toggle = document.querySelector('.lang-toggle');
        const menuItems = document.querySelectorAll('.lang-menu a');

        if (!toggle) return;

        // Update toggle button
        const flag = toggle.querySelector('.lang-flag');
        const code = toggle.querySelector('.lang-code');
        const label = toggle.getAttribute('aria-label');

        if (lang === 'pt') {
            if (flag) flag.textContent = '🇵🇹';
            if (code) code.textContent = 'PT';
            toggle.setAttribute('aria-label', 'Mudar idioma');
        } else {
            if (flag) flag.textContent = '🇬🇧';
            if (code) code.textContent = 'EN';
            toggle.setAttribute('aria-label', 'Change language');
        }

        // Update active state in menu
        menuItems.forEach(item => {
            const itemLang = item.getAttribute('data-lang');
            if (itemLang === lang) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Set language and update page
     */
    function setLanguage(lang) {
        if (lang !== 'pt' && lang !== 'en') {
            console.warn(`Invalid language: ${lang}, using default: ${DEFAULT_LANG}`);
            lang = DEFAULT_LANG;
        }

        translatePage(lang);
        updateSwitcherUI(lang);
        saveLangPreference(lang);
    }

    /**
     * Toggle language dropdown menu
     */
    function toggleDropdown() {
        const toggle = document.querySelector('.lang-toggle');
        const menu = document.querySelector('.lang-menu');

        if (!toggle || !menu) return;

        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            // Close dropdown
            toggle.setAttribute('aria-expanded', 'false');
            menu.setAttribute('hidden', '');
        } else {
            // Open dropdown
            toggle.setAttribute('aria-expanded', 'true');
            menu.removeAttribute('hidden');
        }
    }

    /**
     * Close dropdown menu
     */
    function closeDropdown() {
        const toggle = document.querySelector('.lang-toggle');
        const menu = document.querySelector('.lang-menu');

        if (!toggle || !menu) return;

        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('hidden', '');
    }

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        const toggle = document.querySelector('.lang-toggle');
        const menuItems = document.querySelectorAll('.lang-menu a');

        if (!toggle) {
            console.warn('Language toggle not found');
            return;
        }

        // Toggle dropdown on button click
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDropdown();
        });

        // Switch language on menu item click
        menuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                setLanguage(lang);
                closeDropdown();
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            const switcher = document.querySelector('.language-switcher');
            if (switcher && !switcher.contains(e.target)) {
                closeDropdown();
            }
        });

        // Keyboard navigation
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDropdown();
            }
        });
    }

    /**
     * Initialize i18n on page load
     */
    function init() {
        // Check if translations are loaded
        if (!window.translations) {
            console.error('Translations not loaded');
            return;
        }

        // Determine initial language
        const savedLang = loadLangPreference();
        const initialLang = savedLang || DEFAULT_LANG;

        // Set initial language
        currentLang = initialLang;

        // Only translate if not using default language (which is already in HTML)
        if (initialLang !== 'pt') {
            translatePage(initialLang);
        }

        updateSwitcherUI(initialLang);

        // Initialize event listeners
        initEventListeners();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
