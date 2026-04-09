(function () {
    if (!document.body) {
        return;
    }

    var root = document.documentElement;
    var themeStorageKey = 'workshop-theme';

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        Array.prototype.forEach.call(document.querySelectorAll('[data-theme-toggle]'), function (button) {
            button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
            var label = button.querySelector('.theme-toggle__label');
            if (label) {
                label.textContent = theme === 'dark' ? 'Theme: Dark' : 'Theme: Light';
            }
        });
    }

    function detectInitialTheme() {
        var savedTheme = null;
        try {
            savedTheme = localStorage.getItem(themeStorageKey);
        } catch (err) {
            savedTheme = null;
        }

        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    setTheme(detectInitialTheme());

    Array.prototype.forEach.call(document.querySelectorAll('[data-theme-toggle]'), function (button) {
        button.addEventListener('click', function () {
            var currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            var nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(nextTheme);
            try {
                localStorage.setItem(themeStorageKey, nextTheme);
            } catch (err) {
                // Ignore storage write failures and keep runtime theme only.
            }
        });
    });

    document.body.classList.add('js-animations-enabled');

    if ('requestAnimationFrame' in window) {
        requestAnimationFrame(function () {
            document.body.classList.add('is-page-ready');
        });
    } else {
        document.body.classList.add('is-page-ready');
    }

    var selectorList = [
        '.base-content > *',
        '.base-content .card',
        '.base-content .alert',
        '.base-content .table-responsive',
        '.base-content .table',
        '.base-content form',
        '.base-content .list-group',
        '.base-content .list-group-item',
        '.base-content .jumbotron',
        '.base-content .row > [class*="col-"]',
        '.base-content section',
        '.base-content article'
    ];

    var seen = [];
    var targets = [];

    function pushUnique(element) {
        if (seen.indexOf(element) === -1) {
            seen.push(element);
            targets.push(element);
        }
    }

    selectorList.forEach(function (selector) {
        Array.prototype.forEach.call(document.querySelectorAll(selector), function (element) {
            pushUnique(element);
        });
    });

    targets.forEach(function (element, index) {
        element.classList.add('reveal-on-scroll');
        element.style.setProperty('--reveal-delay', (Math.min(index, 10) * 85) + 'ms');
    });

    var navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse && window.jQuery) {
        var navLinks = navbarCollapse.querySelectorAll('.nav-link, .dropdown-item');
        Array.prototype.forEach.call(navLinks, function (link) {
            link.addEventListener('click', function () {
                if (window.matchMedia('(max-width: 991.98px)').matches && window.jQuery(navbarCollapse).hasClass('show')) {
                    window.jQuery(navbarCollapse).collapse('hide');
                }
            });
        });
    }

    function updateScrollProgress() {
        var doc = document.documentElement;
        var scrollTop = window.pageYOffset || doc.scrollTop || 0;
        var maxScrollable = (doc.scrollHeight || 1) - window.innerHeight;
        var progress = 0;
        if (maxScrollable > 0) {
            progress = Math.min(100, Math.max(0, (scrollTop / maxScrollable) * 100));
        }
        doc.style.setProperty('--scroll-progress', progress.toFixed(2));
    }

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);

    if (!('IntersectionObserver' in window)) {
        targets.forEach(function (element) {
            element.classList.add('is-visible');
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        Array.prototype.forEach.call(entries, function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -5% 0px'
    });

    targets.forEach(function (element) {
        observer.observe(element);
    });
})();