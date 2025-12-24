const initLettersUI = () => {
  const modal = document.getElementById("letterModal");
  const letterContent = document.getElementById("letterContent");
  if (!modal || !letterContent) return;

  const closeModal = () => {
    modal.setAttribute("aria-hidden", "true");
    letterContent.innerHTML = "";
    document.body.style.overflow = "";
  };

  const openModal = (templateId) => {
    const tpl = document.getElementById(templateId);
    if (!tpl) return;
    letterContent.innerHTML = "";
    letterContent.appendChild(tpl.content.cloneNode(true));
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const parseUnlockDate = (value) => {
    if (!value) return null;
    const m = /^\d{4}-\d{2}-\d{2}$/.exec(value);
    if (!m) return null;
    const [y, mo, d] = value.split("-").map((n) => Number(n));
    return new Date(y, mo - 1, d, 0, 0, 0, 0);
  };

  const formatCountdown = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const updateLockedEnvelopes = () => {
    const now = new Date();
    document.querySelectorAll(".envelope[data-unlock-date]").forEach((btn) => {
      const unlockAt = parseUnlockDate(btn.getAttribute("data-unlock-date"));
      const meta = btn.querySelector("[data-countdown]");
      if (!unlockAt) return;

      if (now >= unlockAt) {
        btn.classList.remove("envelope--locked");
        btn.removeAttribute("disabled");
        btn.setAttribute("aria-disabled", "false");
        if (meta) meta.textContent = "Unlocked";
      } else {
        btn.classList.add("envelope--locked");
        btn.setAttribute("disabled", "true");
        btn.setAttribute("aria-disabled", "true");
        if (meta) meta.textContent = `Unlocks in ${formatCountdown(unlockAt - now)}`;
      }
    });
  };

  updateLockedEnvelopes();
  const countdownTimer = setInterval(updateLockedEnvelopes, 1000);

  document.addEventListener("click", (e) => {
    const envelope = e.target.closest?.(".envelope[data-letter-template]");
    if (envelope) {
      if (envelope.disabled || envelope.getAttribute("aria-disabled") === "true") return;
      openModal(envelope.getAttribute("data-letter-template"));
      return;
    }

    const closeEl = e.target.closest?.("[data-close='true']");
    if (closeEl) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });

  window.addEventListener("beforeunload", () => {
    clearInterval(countdownTimer);
  });
};

const initMusicUI = () => {
  const audio = document.getElementById("bgMusic");
  const toggle = document.getElementById("musicToggle");
  if (!audio || !toggle) return;

  audio.volume = 0.35;

  const syncToggle = () => {
    const isPlaying = !audio.paused;
    toggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    toggle.textContent = isPlaying ? "Pause music" : "Play music";
  };

  const tryPlay = () => {
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(syncToggle).catch(syncToggle);
    } else {
      syncToggle();
    }
  };

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      tryPlay();
    } else {
      audio.pause();
      syncToggle();
    }
  });

  audio.addEventListener("play", syncToggle);
  audio.addEventListener("pause", syncToggle);

  syncToggle();

  const onFirstGesture = () => {
    if (audio.paused) tryPlay();
  };

  window.addEventListener("pointerdown", onFirstGesture, { once: true });
  window.addEventListener("keydown", onFirstGesture, { once: true });

  tryPlay();
};

const initFullscreenUI = () => {
  const toggle = document.getElementById("fullscreenToggle");
  if (!toggle) return;

  const doc = document;
  const root = doc.documentElement;

  const getFullscreenElement = () => doc.fullscreenElement || doc.webkitFullscreenElement;
  const canFullscreen =
    typeof (root.requestFullscreen || root.webkitRequestFullscreen) === "function" &&
    (doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled ?? true);

  const syncToggle = () => {
    const isFullscreen = Boolean(getFullscreenElement());
    toggle.setAttribute("aria-pressed", isFullscreen ? "true" : "false");
    toggle.textContent = isFullscreen ? "Exit fullscreen" : "Fullscreen";
  };

  if (!canFullscreen) {
    toggle.setAttribute("disabled", "true");
    toggle.setAttribute("aria-pressed", "false");
    toggle.textContent = "Fullscreen not supported";
    return;
  }

  const enterFullscreen = () => {
    const req = root.requestFullscreen || root.webkitRequestFullscreen;
    if (typeof req === "function") req.call(root);
  };

  const exitFullscreen = () => {
    const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
    if (typeof exit === "function") exit.call(doc);
  };

  toggle.addEventListener("click", () => {
    if (getFullscreenElement()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  });

  doc.addEventListener("fullscreenchange", syncToggle);
  doc.addEventListener("webkitfullscreenchange", syncToggle);
  syncToggle();
};

const initApp = () => {
  initLettersUI();
  initMusicUI();
  initFullscreenUI();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

window.addEventListener("load", () => {
  setTimeout(() => {
    document.body.classList.remove("not-loaded");
    document.body.classList.add("loaded");

    const onScroll = () => {
      if (window.scrollY > 20) {
        document.body.classList.add("scrolled");
      } else {
        document.body.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }, 1000);
});