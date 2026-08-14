/* =========================================================
   INCLUDES.JS
   Loads each section from /sections/*.html into the page,
   so index.html and the sections stay as separate files.

   NOTE: fetch() only works when the site is served over
   http(s) — e.g. via VS Code "Live Server", `python -m http.server`,
   or after uploading to real hosting. Opening index.html directly
   as a file:// path will NOT load the sections (browser security).
   ========================================================= */

async function loadSections() {
  const targets = document.querySelectorAll('[data-include]');

  await Promise.all(
    Array.from(targets).map(async (el) => {
      const file = el.getAttribute('data-include');
      try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        const html = await res.text();
        el.outerHTML = html;
      } catch (err) {
        el.innerHTML = `<p style="padding:24px;color:#B76E79;">Gagal memuat ${file}. Jalankan lewat local server, bukan dibuka langsung sebagai file.</p>`;
        console.error(err);
      }
    })
  );

  // Tell the rest of the app that sections are now in the DOM
  document.dispatchEvent(new CustomEvent('sections:loaded'));
}

loadSections();
