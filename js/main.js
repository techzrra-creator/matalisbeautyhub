/* =========================================================
   MAIN.JS
   Runs once includes.js has injected every section into the DOM
   (listens for the 'sections:loaded' event).
   ========================================================= */

document.addEventListener('sections:loaded', () => {

  // ===== Mobile Nav Toggle =====
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile menu after tapping a link
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== Back to top button =====
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 480);
    });
  }

  // ===== Gallery carousels (swipe via CSS, buttons/dots via JS) =====
  document.querySelectorAll('.gallery-track').forEach((track) => {
    const slides = track.querySelectorAll('.gallery-slide');
    const dotsWrap = document.querySelector(`.gallery-dots[data-dots-for="${track.id}"]`);

    // Build dots
    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Foto ${i + 1}`);
        dot.addEventListener('click', () => {
          slides[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
        dotsWrap.appendChild(dot);
      });
    }

    // Keep dots in sync while swiping/scrolling
    const syncDots = () => {
      if (!dotsWrap) return;
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      slides.forEach((slide, i) => {
        const dist = Math.abs((slide.offsetLeft + slide.clientWidth / 2) - trackCenter);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      dotsWrap.querySelectorAll('.gallery-dot').forEach((d, i) => {
        d.classList.toggle('is-active', i === closest);
      });
    };
    track.addEventListener('scroll', () => {
      window.requestAnimationFrame(syncDots);
    }, { passive: true });
  });

  // Prev/Next arrow buttons — move one slide's width per click
  document.querySelectorAll('.gallery-prev, .gallery-next').forEach((btn) => {
    btn.addEventListener('click', () => {
      const track = document.getElementById(btn.dataset.target);
      if (!track) return;
      const slide = track.querySelector('.gallery-slide');
      const step = slide ? slide.clientWidth + 16 : track.clientWidth; // +16 = gap
      track.scrollBy({
        left: btn.classList.contains('gallery-next') ? step : -step,
        behavior: 'smooth',
      });
    });
  });

  // ===== Footer year =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Contact form -> WhatsApp =====
  // Instead of sending to a server, the form builds a pre-filled
  // WhatsApp message so bookings go straight to the studio's phone.
  const WHATSAPP_NUMBER = '6282118311020'; // 0821-1831-1020 in international format

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      const text =
        `Halo Matalis Beauty Hub, saya mau booking:%0A` +
        `Nama: ${encodeURIComponent(name)}%0A` +
        `Email: ${encodeURIComponent(email)}%0A` +
        `Pesan: ${encodeURIComponent(message)}`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
      window.open(waUrl, '_blank', 'noopener');

      contactForm.reset();
    });
  }
});
