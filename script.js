document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.querySelector('#main-menu');

    // --- Responsive Menu Toggle & Close on Link Click ---
    if (menuToggle && mainMenu) {
        // Toggle menu with button
        menuToggle.addEventListener('click', () => {
            const isActive = mainMenu.classList.toggle('is-active');
            menuToggle.classList.toggle('is-active');
            menuToggle.setAttribute('aria-expanded', isActive);
            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        mainMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainMenu.classList.contains('is-active')) {
                    menuToggle.classList.remove('is-active');
                    mainMenu.classList.remove('is-active');
                    document.body.style.overflow = '';
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // --- Other existing scripts ---
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const bar = document.querySelector('.progress');
    if (bar) {
        const setProgress = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            const ratio = max > 0 ? h.scrollTop / max : 0;
            bar.style.transform = 'scaleX(' + ratio + ')';
        };
        document.addEventListener('scroll', setProgress, { passive: true });
        setProgress();
    }

    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in-view');
                [...e.target.parentElement.children].forEach((s, i) => {
                    s.style.transitionDelay = (i * 60) + 'ms';
                });
                io.unobserve(e.target);
            }
        })
    }, { threshold: .15 });
    revealEls.forEach(el => io.observe(el));

    const nums = document.querySelectorAll('[data-count-to]');
    const countIo = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target; const to = +el.dataset.countTo;
                const dur = prefersReduced ? 0 : 900;
                const start = performance.now();
                const from = 0;
                const step = (t) => {
                    const p = Math.min(1, (t - start) / dur);
                    const v = Math.round(from + (to - from) * p);
                    el.textContent = v.toLocaleString();
                    if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                countIo.unobserve(el);
            }
        })
    }, { threshold: .35 });
    nums.forEach(n => countIo.observe(n));

    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const wrap = btn.querySelector('.ripple');
            if (!wrap) return;
            const s = document.createElement('span');
            const rect = btn.getBoundingClientRect();
            s.style.left = (e.clientX - rect.left) + 'px';
            s.style.top = (e.clientY - rect.top) + 'px';
            wrap.appendChild(s);
            setTimeout(() => s.remove(), 600);
        });
    });

    const lerp = (a, b, n) => a + (b - a) * n;
    document.querySelectorAll('[data-magnetic]').forEach(el => {
        let tx = 0, ty = 0, rx = 0, ry = 0;
        const inner = el.querySelector('span');
        if (!inner || prefersReduced) return;
        const follow = () => {
            inner.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
            requestAnimationFrame(follow);
        };
        follow();
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const dx = (e.clientX - cx) / (r.width / 2);
            const dy = (e.clientY - cy) / (r.height / 2);
            rx = dx * 6; ry = dy * 6;
            tx = lerp(tx, rx, .25);
            ty = lerp(ty, ry, .25);
        });
        el.addEventListener('mouseleave', () => {
            rx = ry = 0;
            const reset = () => {
                tx = lerp(tx, 0, .2);
                ty = lerp(ty, 0, .2);
                if (Math.abs(tx) > 0.5 || Math.abs(ty) > 0.5) requestAnimationFrame(reset);
                else { tx = ty = 0; inner.style.transform = 'translate(0,0)'; }
            };
            reset();
        });
    });

    // --- Hero Parallax for Mouse and Touch ---
    const hv = document.getElementById('heroVisual');
    if (hv && !prefersReduced) {
        let px = 0, py = 0, tx = 0, ty = 0;
        const animateHero = () => {
            tx = lerp(tx, px, .1); ty = lerp(ty, py, .1);
            hv.style.transform = 'perspective(900px) rotateX(' + (-ty * 2) + 'deg) rotateY(' + (tx * 2) + 'deg)';
            requestAnimationFrame(animateHero);
        };
        animateHero();

        const updatePosition = (e) => {
            const r = hv.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;

            // Use touch coordinates if available, otherwise use pointer coordinates
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            px = (clientX - cx) / (r.width / 2);
            py = (clientY - cy) / (r.height / 2);
        }

        window.addEventListener('pointermove', updatePosition, { passive: true });
        window.addEventListener('touchmove', updatePosition, { passive: true });
    }
});