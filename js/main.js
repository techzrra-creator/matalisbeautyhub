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

  // ===== Contact form -> Google Sheet + WhatsApp =====
  // The form both logs a row to a Google Sheet (via Apps Script web app)
  // AND builds a pre-filled WhatsApp message so bookings still go
  // straight to the studio's phone. See google-apps-script.gs for setup.
  const WHATSAPP_NUMBER = '6282118311020'; // 0821-1831-1020 in international format

  // TODO: ganti dengan Web App URL dari Google Apps Script kamu sendiri
  // (lihat panduan di file google-apps-script.gs). Contoh:
  // 'https://script.google.com/macros/s/AKfycb.../exec'
  const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyXe1TzDDonex39xKdj9YV9LDDKuJyXakJpTRUpbO-wc5wlINLhENk7FohpeUN3pRZ_WA/exec';

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();
      const layananInputs = contactForm.querySelectorAll('input[name="layanan"]:checked');
      const layanan = Array.from(layananInputs).map((el) => el.value).join(', ');
      const therapistInput = contactForm.querySelector('input[name="therapist"]:checked');
      const therapist = therapistInput ? therapistInput.value : '';

      // 1) Kirim ke Google Sheet (diam-diam di background, tidak menghalangi WA).
      //    Pakai FormData supaya field-nya kebaca sebagai e.parameter di Apps
      //    Script (nama, email, layanan, terapis, pesan — HARUS sama persis
      //    dengan yang dibaca di doPost() pada Code.gs).
      if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'https://script.google.com/macros/s/AKfycbyXe1TzDDonex39xKdj9YV9LDDKuJyXakJpTRUpbO-wc5wlINLhENk7FohpeUN3pRZ_WA/exec') {
        const sheetData = new FormData();
        sheetData.append('nama', name);
        sheetData.append('email', email);
        sheetData.append('layanan', layanan);
        sheetData.append('terapis', therapist);
        sheetData.append('pesan', message);

        fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: sheetData,
        }).catch((err) => console.error('Gagal kirim ke Google Sheet:', err));
      }

      // 2) Susun pesan WhatsApp seperti sebelumnya.
      let text =
        `Halo Matalis Beauty Hub, saya mau booking:%0A` +
        `Nama: ${encodeURIComponent(name)}%0A` +
        `Email: ${encodeURIComponent(email)}%0A`;

      if (layanan) {
        text += `Layanan: ${encodeURIComponent(layanan)}%0A`;
      }

      if (therapist) {
        text += `Terapis pilihan: ${encodeURIComponent(therapist)}%0A`;
      }

      text += `Pesan: ${encodeURIComponent(message)}`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
      window.open(waUrl, '_blank', 'noopener');

      contactForm.reset();
    });
  }
});
