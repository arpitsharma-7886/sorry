(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  const toggleTheme = $("#toggleTheme");
  const modal = $("#modal");
  const closeModalBtn = $("#closeModalBtn");
  const openMsgBtn = $("#openMsgBtn");
  const forgiveBtn = $("#forgiveBtn");
  const messageBox = $("#messageBox");
  const copyBtn = $("#copyBtn");
  const shareBtn = $("#shareBtn");
  const toast = $("#toast");
  const confettiCanvas = $("#confetti");

  const typeEl = $(".type");
  const fullText = typeEl ? typeEl.textContent.trim() : "";

  const defaultMessage =
    "Anushka,\n" +
    "Mujhe sach me afsos hai. Gusse aur frustration me maine thoda tez bol diya.\n" +
    "Main jaanta/jaanti hoon ki mere words tumhe hurt kar sakte the, and that’s on me.\n\n" +
    "Please ek chance do. Main apni tone aur patience dono better karunga/karungi.\n" +
    "Tum mere liye important ho.\n\n" +
    "— Arpit";

  function setTheme(next) {
    document.documentElement.dataset.theme = next;
    const isSoft = next === "soft";
    const text = toggleTheme.querySelector(".pill__text");
    if (text) text.textContent = isSoft ? "Night mode" : "Soft mode";
    try {
      localStorage.setItem("theme", next);
    } catch (_) {}
  }

  function getTheme() {
    try {
      return localStorage.getItem("theme");
    } catch (_) {
      return null;
    }
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => messageBox.focus(), 0);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    toast.textContent = "";
  }

  function showToast(msg) {
    toast.textContent = msg;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toast.textContent = "";
    }, 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
      } catch (_) {
        return false;
      }
    }
  }

  // Typewriter
  function typewriter(el, text, speedMs) {
    if (!el) return;
    el.textContent = "";
    el.classList.add("is-typing");
    let i = 0;
    const tick = () => {
      i++;
      el.textContent = text.slice(0, i);
      if (i < text.length) {
        window.setTimeout(tick, speedMs);
      } else {
        el.classList.remove("is-typing");
      }
    };
    window.setTimeout(tick, 250);
  }

  // Confetti (simple canvas particles)
  function confettiBurst(durationMs = 2600) {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const resize = () => {
      confettiCanvas.width = Math.floor(window.innerWidth * DPR);
      confettiCanvas.height = Math.floor(window.innerHeight * DPR);
      confettiCanvas.style.width = window.innerWidth + "px";
      confettiCanvas.style.height = window.innerHeight + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    const colors = ["#ff4d8d", "#7c4dff", "#54ffb0", "#ffd166", "#4cc9f0"];
    const pieces = [];
    const count = Math.round(Math.min(180, 120 + window.innerWidth / 10));

    for (let i = 0; i < count; i++) {
      pieces.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * window.innerHeight * 0.3,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 10,
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 5,
        r: Math.random() * Math.PI,
        vr: (-0.2 + Math.random() * 0.4) * 0.8,
        c: colors[(Math.random() * colors.length) | 0],
        a: 0.9,
      });
    }

    confettiCanvas.classList.add("is-on");
    let start = performance.now();

    const step = (now) => {
      const t = now - start;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.vy += 0.03; // gravity
        if (t > durationMs * 0.6) p.a *= 0.98;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.a));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (t < durationMs) {
        requestAnimationFrame(step);
      } else {
        confettiCanvas.classList.remove("is-on");
      }
    };

    const onResize = () => resize();
    window.addEventListener("resize", onResize, { passive: true });
    requestAnimationFrame(step);
    window.setTimeout(() => {
      window.removeEventListener("resize", onResize);
    }, durationMs + 50);
  }

  // Events
  toggleTheme?.addEventListener("click", (e) => {
    e.preventDefault();
    const current = document.documentElement.dataset.theme || "dark";
    setTheme(current === "soft" ? "dark" : "soft");
  });

  openMsgBtn?.addEventListener("click", () => openModal());

  closeModalBtn?.addEventListener("click", () => closeModal());

  modal?.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.close === "true") closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  copyBtn?.addEventListener("click", async () => {
    const ok = await copyText(messageBox.value);
    showToast(ok ? "Copied. Now send it to Anushka." : "Copy failed. Select and copy manually.");
  });

  shareBtn?.addEventListener("click", async () => {
    const text = messageBox.value;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Sorry, Anushka", text });
        showToast("Shared.");
        return;
      } catch (_) {
        // user cancelled or failed
      }
    }
    const ok = await copyText(text);
    showToast(ok ? "Sharing not available — copied instead." : "Sharing not available.");
  });

  forgiveBtn?.addEventListener("click", () => {
    confettiBurst();
    showToast("Thank you. I’ll do better.");
    openModal();
  });

  // Init
  const saved = getTheme();
  if (saved === "soft" || saved === "dark") setTheme(saved);
  else setTheme("soft");

  if (typeEl) {
    const speed = Number(typeEl.getAttribute("data-type-speed") || "26");
    typewriter(typeEl, fullText, Math.max(12, Math.min(40, speed)));
  }

  if (messageBox) messageBox.value = defaultMessage;
})();


