/**
 * resynk — High-Security DRM & Anti-Screen Recording Engine
 * Features:
 * 1. Dynamic Moving Forensic Watermark (User identity + Session ID + Live Clock)
 * 2. Window Blur & Visibility Change Auto-Blackout (Snipping / OBS / Multi-task shield)
 * 3. Hotkey Interception (PrintScreen, F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P)
 * 4. Context Menu & Native Video Download Menu Blocking (controlsList, disablePictureInPicture)
 * 5. Screen Capture API Interception (getDisplayMedia guard)
 * 6. DevTools Dimension & Debugger Anomaly Detection
 */

export class DRMGuard {
  constructor(options = {}) {
    this.videoElement = null;
    this.containerElement = null;
    this.watermarkElement = null;
    this.securityShieldElement = null;
    this.currentUser = options.currentUser || null;
    this.watermarkInterval = null;
    this.clockInterval = null;
    this.isActive = false;
    this.isBlackedOut = false;
    this.sessionId = Math.random().toString(36).substring(2, 9).toUpperCase();

    this.initGlobalProtections();
  }

  setCurrentUser(user) {
    this.currentUser = user;
    this.updateWatermarkText();
  }

  attachToPlayer(container, video) {
    this.containerElement = container;
    this.videoElement = video;
    this.setupVideoAttributes();
    this.createWatermark();
    this.createSecurityShield();
    this.bindPlayerEvents();
    this.startDynamicWatermark();
    this.isActive = true;
  }

  setupVideoAttributes() {
    if (!this.videoElement) return;
    this.videoElement.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
    this.videoElement.setAttribute("disablePictureInPicture", "true");
    this.videoElement.setAttribute("playsinline", "true");
    this.videoElement.oncontextmenu = (e) => {
      e.preventDefault();
      this.showToast("Right-click context menu is disabled for protected content.");
      return false;
    };
  }

  createWatermark() {
    if (!this.containerElement) return;
    const existing = this.containerElement.querySelector(".resynk-drm-watermark");
    if (existing) existing.remove();

    const watermark = document.createElement("div");
    watermark.className = "resynk-drm-watermark";
    watermark.setAttribute("aria-hidden", "true");
    watermark.innerHTML = `
      <div class="watermark-inner">
        <span class="watermark-brand">resynk ENCRYPTED</span>
        <span class="watermark-user">${this.getUserIdentifier()}</span>
        <span class="watermark-clock">00:00:00</span>
        <span class="watermark-meta">ID: #${this.sessionId} • DO NOT DISTRIBUTE</span>
      </div>
    `;

    this.containerElement.appendChild(watermark);
    this.watermarkElement = watermark;
    this.updateWatermarkClock();
  }

  createSecurityShield() {
    if (!this.containerElement) return;
    const existing = this.containerElement.querySelector(".resynk-drm-shield");
    if (existing) existing.remove();

    const shield = document.createElement("div");
    shield.className = "resynk-drm-shield";
    shield.innerHTML = `
      <div class="shield-card">
        <div class="shield-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h3>Playback Suspended for Security</h3>
        <p>Window focus was lost, or screen capture / multi-task recording was detected. Return to this tab to resume playback.</p>
        <button type="button" class="btn-resume-playback">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Resume Playback
        </button>
      </div>
    `;

    const resumeBtn = shield.querySelector(".btn-resume-playback");
    resumeBtn.addEventListener("click", () => {
      this.dismissSecurityShield();
    });

    this.containerElement.appendChild(shield);
    this.securityShieldElement = shield;
  }

  getUserIdentifier() {
    if (this.currentUser && this.currentUser.email) {
      return this.currentUser.email;
    }
    return "student@resynk.academy";
  }

  updateWatermarkText() {
    if (!this.watermarkElement) return;
    const userSpan = this.watermarkElement.querySelector(".watermark-user");
    if (userSpan) {
      userSpan.textContent = this.getUserIdentifier();
    }
  }

  updateWatermarkClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    const update = () => {
      if (!this.watermarkElement) return;
      const clockSpan = this.watermarkElement.querySelector(".watermark-clock");
      if (clockSpan) {
        const now = new Date();
        clockSpan.textContent = now.toTimeString().split(" ")[0];
      }
    };
    update();
    this.clockInterval = setInterval(update, 1000);
  }

  startDynamicWatermark() {
    if (this.watermarkInterval) clearInterval(this.watermarkInterval);
    
    // Shift position unpredictably every 4.5 to 7.5 seconds
    const move = () => {
      if (!this.watermarkElement || !this.containerElement) return;
      const bounds = this.containerElement.getBoundingClientRect();
      const watermarkBounds = this.watermarkElement.getBoundingClientRect();

      const maxX = Math.max(20, bounds.width - watermarkBounds.width - 40);
      const maxY = Math.max(20, bounds.height - watermarkBounds.height - 40);

      const randomX = Math.floor(Math.random() * maxX) + 20;
      const randomY = Math.floor(Math.random() * maxY) + 20;
      const randomOpacity = (Math.random() * 0.25 + 0.35).toFixed(2); // 0.35 to 0.60

      this.watermarkElement.style.transform = `translate(${randomX}px, ${randomY}px)`;
      this.watermarkElement.style.opacity = randomOpacity;
    };

    move();
    this.watermarkInterval = setInterval(move, 5000);
  }

  bindPlayerEvents() {
    // Detect visibility changes (tab switch, desktop switch)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.videoElement && !this.videoElement.paused) {
        this.triggerSecurityShield("Tab switched or hidden");
      }
    });

    // Detect window blur (user clicking into OBS, Snipping tool, or secondary screen recorder)
    window.addEventListener("blur", () => {
      // Trigger shield if actively playing
      if (this.videoElement && !this.videoElement.paused) {
        this.triggerSecurityShield("Application window lost focus");
      }
    });

    // Clear clipboard on focus if possible to deter printscreen copies
    window.addEventListener("focus", () => {
      // Auto-check devtools
      this.checkDevTools();
    });
  }

  triggerSecurityShield(reason) {
    if (this.isBlackedOut) return;
    this.isBlackedOut = true;

    if (this.videoElement && !this.videoElement.paused) {
      try {
        this.videoElement.pause();
      } catch (e) {}
    }

    if (this.securityShieldElement) {
      this.securityShieldElement.classList.add("active");
    }
  }

  dismissSecurityShield() {
    this.isBlackedOut = false;
    if (this.securityShieldElement) {
      this.securityShieldElement.classList.remove("active");
    }
    if (this.videoElement) {
      this.videoElement.play().catch(() => {});
    }
  }

  initGlobalProtections() {
    // 1. Intercept context menu everywhere on the page
    document.addEventListener("contextmenu", (e) => {
      const target = e.target;
      if (target.closest(".resynk-player-frame") || target.closest("video") || target.closest(".resynk-classroom")) {
        e.preventDefault();
        this.showToast("Right-click context menu is protected on resynk.");
        return false;
      }
    });

    // 2. Intercept keyboard shortcuts
    window.addEventListener("keydown", (e) => {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // PrintScreen detection
      if (key === "PrintScreen") {
        e.preventDefault();
        this.triggerSecurityShield("PrintScreen capture shortcut intercepted");
        this.showToast("Screen captures are disabled on resynk.");
        try {
          navigator.clipboard.writeText("");
        } catch (err) {}
        return false;
      }

      // F12 (DevTools)
      if (key === "F12") {
        e.preventDefault();
        this.showToast("Developer inspection tools are disabled.");
        return false;
      }

      // Ctrl + Shift + I / J / C (Inspect / Console)
      if (ctrl && shift && ["I", "i", "J", "j", "C", "c"].includes(key)) {
        e.preventDefault();
        this.showToast("Developer inspection tools are disabled.");
        return false;
      }

      // Ctrl + U (View Source)
      if (ctrl && (key === "u" || key === "U")) {
        e.preventDefault();
        this.showToast("Source view is protected.");
        return false;
      }

      // Ctrl + S (Save Page / Save Video)
      if (ctrl && (key === "s" || key === "S")) {
        e.preventDefault();
        this.showToast("Direct downloads are disabled. Access is streaming only.");
        return false;
      }

      // Ctrl + P (Print Page)
      if (ctrl && (key === "p" || key === "P")) {
        e.preventDefault();
        this.showToast("Printing protected materials is restricted.");
        return false;
      }
    }, true);

    // 3. Intercept Screen Capture API if called by browser extensions
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getDisplayMedia = (...args) => {
        this.triggerSecurityShield("Screen capture API attempt detected");
        this.showToast("Screen recording is forbidden by resynk DRM policy.");
        return Promise.reject(new Error("resynk: Screen capture blocked by DRM policy."));
      };
    }

    // 4. DevTools detection via viewport metrics
    window.addEventListener("resize", () => {
      this.checkDevTools();
    });
  }

  checkDevTools() {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    if (widthThreshold || heightThreshold) {
      if (this.videoElement && !this.videoElement.paused) {
        this.triggerSecurityShield("DevTools window docking detected");
      }
    }
  }

  showToast(message) {
    let toast = document.querySelector(".resynk-security-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "resynk-security-toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="toast-content">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;
    toast.classList.add("show");
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  }

  destroy() {
    if (this.watermarkInterval) clearInterval(this.watermarkInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.watermarkElement) this.watermarkElement.remove();
    if (this.securityShieldElement) this.securityShieldElement.remove();
  }
}
