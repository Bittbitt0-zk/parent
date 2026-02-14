/* ==================================================
   Valentine Website (Pure JS)
   - Smooth reveal-on-scroll
   - Mobile nav toggle
   - Music play/pause
   - Floating hearts background
   - Click anywhere -> heart burst
   - Surprise modal popup
   ================================================== */

(() => {
  "use strict";

  /* ---------------------------
     Helpers
  --------------------------- */
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  /* ---------------------------
     Reveal on scroll (IntersectionObserver)
  --------------------------- */
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------------------------
     Smooth scroll (extra safe)
  --------------------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (ev) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      ev.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // close mobile nav after click
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------------------
     Mobile nav toggle
  --------------------------- */
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    // close if tapping outside (mobile)
    document.addEventListener("click", (e) => {
      const isClickInside = navLinks.contains(e.target) || navToggle.contains(e.target);
      if (!isClickInside) {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------------------
     Background romantic music
     NOTE: Browsers block autoplay until user interacts.
  --------------------------- */
  const musicToggle = $("#musicToggle");
  const musicLabel = $("#musicLabel");

  // Use your own file: create /assets/music.mp3 and set the src below.
  // If you don't have a file yet, it won't crash; button will show an alert.
  const audio = new Audio();
  audio.src = "assets/music4.mp3"; // <-- put your romantic music here
  audio.loop = true;
  audio.preload = "auto";

  let musicReady = false;
  audio.addEventListener("canplaythrough", () => (musicReady = true));

  function setMusicUI(isPlaying) {
    if (!musicToggle) return;
    musicToggle.setAttribute("aria-pressed", String(isPlaying));
    if (musicLabel) musicLabel.textContent = isPlaying ? "Pause music" : "Play music";
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", async () => {
      if (!audio.src) return;

      if (!musicReady) {
        // If no file exists, user will know.
        // (In production, you'd detect 404 via fetch; we keep it simple + safe.)
        // Try to play anyway; if it fails, show message.
      }

      if (audio.paused) {
        try {
          await audio.play();
          setMusicUI(true);
        } catch {
          alert("เบราว์เซอร์บล็อกการเล่นอัตโนมัติ หรือยังไม่มีไฟล์เพลงครับ 😅\nใส่ไฟล์เพลงที่ assets/music.mp3 แล้วลองกดอีกครั้ง");
          setMusicUI(false);
        }
      } else {
        audio.pause();
        setMusicUI(false);
      }
    });
  }

  /* ---------------------------
     Floating hearts background
  --------------------------- */
  const bgHearts = $("#bgHearts");

  function spawnBgHeart() {
    if (!bgHearts) return;

    const el = document.createElement("div");
    el.className = "floating-heart";

    // random styling
    const left = Math.random() * 100; // vw
    const size = 10 + Math.random() * 22; // px
    const dur = 10 + Math.random() * 10; // s
    const drift = (Math.random() * 2 - 1) * 50; // px
    const scale = 0.85 + Math.random() * 0.9;

    el.style.left = `${left}%`;
    el.style.animationDuration = `${dur}s`;
    el.style.setProperty("--drift", `${drift}px`);
    el.style.setProperty("--scale", `${scale}`);
    el.style.fontSize = `${size}px`;

    bgHearts.appendChild(el);

    // cleanup after animation
    window.setTimeout(() => el.remove(), (dur + 1) * 1000);
  }

  // Start a gentle stream of hearts
  const heartInterval = window.setInterval(spawnBgHeart, 650);
  // Also spawn a few at load for instant vibe
  for (let i = 0; i < 10; i++) spawnBgHeart();

  /* ---------------------------
     Click anywhere -> floating heart
  --------------------------- */
  function spawnClickHeart(x, y) {
    const h = document.createElement("div");
    h.className = "click-heart";
    h.style.left = `${x}px`;
    h.style.top = `${y}px`;
    document.body.appendChild(h);

    // remove after animation
    window.setTimeout(() => h.remove(), 1100);
  }

  // avoid spamming too hard
  let lastHeartAt = 0;
  document.addEventListener("click", (e) => {
    const now = Date.now();
    if (now - lastHeartAt < 80) return;
    lastHeartAt = now;

    // don’t spawn on modal close click spam
    if (e.target.closest(".modal__panel")) return;

    spawnClickHeart(e.clientX, e.clientY);
  });

  /* ---------------------------
     Surprise Modal
  --------------------------- */
  const surpriseBtn = $("#surpriseBtn");

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Surprise message");

  modal.innerHTML = `
    <div class="modal__backdrop" data-close="true"></div>
    <div class="modal__panel">
      <div class="modal__top">
        <h3 class="modal__title">Surprise for Mom & Dad ✨</h3>
        <button class="modal__close" type="button" aria-label="Close" data-close="true">✕</button>
      </div>
      <div class="modal__body">
        <p>
          ความรักที่ดู “ธรรมดา” ในทุกวันของพ่อกับแม่…
          จริง ๆ มันคือความรักที่โคตรพิเศษ — เพราะมันสม่ำเสมอ อบอุ่น และไม่เคยทิ้งกันไว้ข้างหลัง
        </p>
        <p>
          ขอบคุณที่ทำให้บ้านเป็นที่ที่เรากลับมาแล้วรู้สึกปลอดภัยเสมอ ❤️
        </p>
        <p class="signature">Happy Valentine’s Day, with all our love.</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  function openModal() {
    modal.classList.add("is-open");
    // accessibility: focus close button
    const closeBtn = modal.querySelector(".modal__close");
    closeBtn?.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    surpriseBtn?.focus();
  }

  if (surpriseBtn) {
    surpriseBtn.addEventListener("click", openModal);
  }

  modal.addEventListener("click", (e) => {
    const close = e.target?.getAttribute?.("data-close") === "true";
    if (close) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  /* ---------------------------
     Footer injection (simple + semantic)
  --------------------------- */
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="container footer__row">
      <small>Made with ❤️ for Mom & Dad</small>
      <small>${new Date().getFullYear()}</small>
    </div>
  `;
  document.body.appendChild(footer);

  /* ---------------------------
     Clean up interval when leaving page
  --------------------------- */
  window.addEventListener("beforeunload", () => {
    clearInterval(heartInterval);
    audio.pause();
  });

})();
