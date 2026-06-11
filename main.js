// ── Loading Screen ───────────────────────────────────────────────────────────
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen-index') || document.getElementById('loadingScreen-projects');
    if (loadingScreen) {
        setTimeout(() => loadingScreen.classList.add('hidden'), 800);
    }
});

// ── Everything else after DOM is ready ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // ── Mobile Menu ──────────────────────────────────────────────────────────
    const menuBtn  = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    let menuOpen   = false;

    // FIX: Track overflow locks independently so menu and lightbox don't conflict
    let overflowLocks = 0;
    function lockScroll()   { overflowLocks++; document.body.style.overflow = 'hidden'; }
    function unlockScroll() { overflowLocks = Math.max(0, overflowLocks - 1); if (overflowLocks === 0) document.body.style.overflow = ''; }

    function setMenu(open) {
        menuOpen = open;
        navLinks.classList.toggle('active', open);
        // FIX: aria-expanded must be a string "true"/"false", not a boolean
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.classList.toggle('is-open', open);
        open ? lockScroll() : unlockScroll();
    }

    if (menuBtn && navLinks) {
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-controls', 'navLinks');
        menuBtn.setAttribute('aria-label', 'Toggle navigation menu');

        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenu(!menuOpen);
        });

        navLinks.querySelectorAll('.nav-link, .btn-contact').forEach(link => {
            link.addEventListener('click', () => setMenu(false));
        });

        document.addEventListener('click', (e) => {
            if (menuOpen && !menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                setMenu(false);
            }
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth >= 768 && menuOpen) setMenu(false);
            }, 250);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuOpen) setMenu(false);
        });
    }

    // ── Accordion ────────────────────────────────────────────────────────────
    const mainCards = document.querySelectorAll('.main-card');
    mainCards.forEach(card => {
        const header = card.querySelector('.main-card-header');
        if (!header) return;
        header.addEventListener('click', () => {
            const isActive = card.classList.contains('active');
            mainCards.forEach(c => c.classList.remove('active'));
            if (!isActive) card.classList.add('active');
        });
    });

    // ── Lightbox ─────────────────────────────────────────────────────────────
    const lightbox  = document.getElementById('lightbox');
    const lbImg     = document.getElementById('lb-img');
    const lbCounter = document.getElementById('lb-counter');
    const lbClose   = document.getElementById('lb-close');
    const lbPrev    = document.getElementById('lb-prev');
    const lbNext    = document.getElementById('lb-next');
    const lbOverlay = lightbox ? lightbox.querySelector('.lightbox-overlay') : null;

    // Only initialize lightbox if elements exist
    if (lightbox && lbImg) {
        let gallery = [];
        let current = 0;

        function lbShow(index) {
            current = index;
            lbImg.src = gallery[index].src;
            lbImg.alt = gallery[index].alt || '';
            lbCounter.textContent = (index + 1) + ' / ' + gallery.length;
            lbPrev.disabled = index === 0;
            lbNext.disabled = index === gallery.length - 1;
        }

        function lbOpen(imgs, startIndex) {
            gallery = imgs;
            lbShow(startIndex);
            lightbox.classList.add('open');
            lockScroll(); // FIX: use shared lock instead of direct body.style.overflow
        }

        function lbCloseFn() {
            lightbox.classList.remove('open');
            unlockScroll(); // FIX: use shared lock
        }

        // FIX: Guard against img not being inside a .image wrapper
        document.querySelectorAll('.image img').forEach(img => {
            img.addEventListener('click', () => {
                const group = img.closest('.image');
                if (!group) return;
                const allImgs = Array.from(group.querySelectorAll('img'));
                lbOpen(allImgs, allImgs.indexOf(img));
            });
        });

        lbClose.addEventListener('click', lbCloseFn);
        if (lbOverlay) lbOverlay.addEventListener('click', lbCloseFn);

        lbPrev.addEventListener('click', () => { if (current > 0) lbShow(current - 1); });
        lbNext.addEventListener('click', () => { if (current < gallery.length - 1) lbShow(current + 1); });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape')     lbCloseFn();
            if (e.key === 'ArrowLeft')  { if (current > 0) lbShow(current - 1); }
            if (e.key === 'ArrowRight') { if (current < gallery.length - 1) lbShow(current + 1); }
        });
    }
});