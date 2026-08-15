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

  // ===== Gallery carousels =====
  document.querySelectorAll('.gallery-track').forEach((track) => {
    const slides = track.querySelectorAll('.gallery-slide');
    const dotsWrap = document.querySelector(`.gallery-dots[data-dots-for="${track.id}"]`);

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

  // Prev/Next arrow buttons
  document.querySelectorAll('.gallery-prev, .gallery-next').forEach((btn) => {
    btn.addEventListener('click', () => {
      const track = document.getElementById(btn.dataset.target);
      if (!track) return;
      const slide = track.querySelector('.gallery-slide');
      const step = slide ? slide.clientWidth + 16 : track.clientWidth;
      track.scrollBy({
        left: btn.classList.contains('gallery-next') ? step : -step,
        behavior: 'smooth',
      });
    });
  });

  // ===== Footer year =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Contact form -> Google Sheet only (NO WhatsApp) =====
  // TODO: ganti dengan Web App URL dari Google Apps Script kamu sendiri.
  const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyXe1TzDDonex39xKdj9YV9LDDKuJyXakJpTRUpbO-wc5wlINLhENk7FohpeUN3pRZ_WA/exec';

  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback'); // element untuk pesan sukses/gagal

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Kirim';

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();
      const layananInputs = contactForm.querySelectorAll('input[name="layanan"]:checked');
      const layanan = Array.from(layananInputs).map((el) => el.value).join(', ');
      const therapistInput = contactForm.querySelector('input[name="therapist"]:checked');
      const therapist = therapistInput ? therapistInput.value : '';

      if (!name || !email || !message) {
        showFeedback('Nama, email, dan pesan wajib diisi.', 'error');
        return;
      }

      const sheetData = new FormData();
      sheetData.append('nama', name);
      sheetData.append('email', email);
      sheetData.append('layanan', layanan);
      sheetData.append('terapis', therapist);
      sheetData.append('pesan', message);

      // Loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim...';
      }

 const SHEET_ENDPOINT = 'https://script.google.com/macros/s/XXXX/exec'; // URL /exec, bukan /dev

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fb = document.getElementById('form-feedback');

  const body = new URLSearchParams({
    nama:    contactForm.name?.value.trim()      || '',
    email:   contactForm.email?.value.trim()     || '',
    layanan: contactForm.service?.value          || '',
    terapis: contactForm.therapist?.value        || '',
    pesan:   contactForm.message?.value.trim()   || '',
  });

  try {
    await fetch(SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',                 // Apps Script tidak kirim header CORS
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
    });
    fb.hidden = false;
    fb.className = 'form-feedback is-success';
    fb.textContent = 'Terima kasih! Booking kamu sudah kami terima.';
    contactForm.reset();
  } catch (err) {
    fb.hidden = false;
    fb.className = 'form-feedback is-error';
    fb.textContent = 'Gagal mengirim. Coba lagi ya.';
  }
});

