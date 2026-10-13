/**
 * resynk — High-Security DRM & Studio-Grade Video Player Controller
 * 
 * Features:
 * 1. Bespoke Custom Player Controls:
 *    - Custom Play/Pause & Center Ripple Overlay
 *    - Interactive Scrubber Timeline with Buffer Bar & Timestamp Hover Tooltip
 *    - Quick Scrub (-10s / +10s)
 *    - Volume Slider & Mute Toggle
 *    - Playback Speed Cycler (0.75x – 2x)
 *    - Container-Level Fullscreen (Preserves DRM watermarks & overlays in fullscreen)
 *    - Auto-hiding controls during playback with instant mouse/touch wake
 *    - Full Keyboard Accessibility (Space, K, Arrows, M, F)
 * 2. High-Security DRM & Forensic Protections:
 *    - Dynamic Moving Forensic Watermark (User identity + Session ID + Live Clock)
 *    - Anti-Cropping Forensic Micro-Stamps in Corners
 *    - Window Blur & Tab Switch Auto-Blackout Shield
 *    - Hotkey Interception (PrintScreen, F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P)
 *    - Context Menu & Video Direct-Save Blocking (pointer-events guard)
 *    - Screen Capture API Interception (getDisplayMedia guard)
 *    - DevTools Anomaly Detection
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
    this.hideControlsTimeout = null;
    this.isActive = false;
    this.isBlackedOut = false;
    this.isScrubbing = false;
    this.sessionId = Math.random().toString(36).substring(2, 9).toUpperCase();

    this.initGlobalProtections();
  }

  setCurrentUser(user) {
    this.currentUser = user;
    this.updateWatermarkText();
    this.updateForensicStamps();
  }

  attachToPlayer(container, video) {
    this.containerElement = container;
    this.videoElement = video;

    this.setupVideoAttributes();
    this.createWatermark();
    this.createSecurityShield();
    this.updateForensicStamps();
    this.setupCustomControls();
    this.bindPlayerEvents();
    this.startDynamicWatermark();
    this.isActive = true;
  }

  setupVideoAttributes() {
    if (!this.videoElement) return;
    this.videoElement.removeAttribute("controls");
    this.videoElement.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
    this.videoElement.setAttribute("disablePictureInPicture", "true");
    this.videoElement.setAttribute("playsinline", "true");
    this.videoElement.oncontextmenu = (e) => {
      e.preventDefault();
      this.showToast("Right-click context menu is disabled for protected content.");
      return false;
    };
  }

  /* ==========================================================
     CUSTOM PLAYER CONTROLS IMPLEMENTATION
     ========================================================== */
  setupCustomControls() {
    if (!this.containerElement || !this.videoElement) return;

    // Elements
    const centerPlayBtn = this.containerElement.querySelector("#btn-player-center-play");
    const playPauseBtn = this.containerElement.querySelector("#ctrl-play-pause");
    const rewindBtn = this.containerElement.querySelector("#ctrl-rewind-10");
    const forwardBtn = this.containerElement.querySelector("#ctrl-forward-10");
    const volumeBtn = this.containerElement.querySelector("#ctrl-volume-btn");
    const volumeSlider = this.containerElement.querySelector("#ctrl-volume-slider");
    const currentTimeSpan = this.containerElement.querySelector("#ctrl-current-time");
    const durationSpan = this.containerElement.querySelector("#ctrl-duration");
    const speedBtn = this.containerElement.querySelector("#ctrl-speed-btn");
    const speedDropdown = this.containerElement.querySelector("#ctrl-speed-dropdown");
    const currentSpeedSpan = this.containerElement.querySelector("#ctrl-current-speed");
    const fullscreenBtn = this.containerElement.querySelector("#ctrl-fullscreen-btn");
    const timelineWrapper = this.containerElement.querySelector("#player-timeline-wrapper");
    const playedBar = this.containerElement.querySelector("#timeline-played");
    const bufferedBar = this.containerElement.querySelector("#timeline-buffered");
    const tooltip = this.containerElement.querySelector("#timeline-tooltip");

    const formatTime = (seconds) => {
      if (isNaN(seconds) || seconds < 0) return "00:00";
      const s = Math.floor(seconds);
      const mins = Math.floor(s / 60);
      const secs = s % 60;
      if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        return `${hrs}:${remMins < 10 ? "0" : ""}${remMins}:${secs < 10 ? "0" : ""}${secs}`;
      }
      return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    // Toggle Play / Pause
    const togglePlay = () => {
      if (this.videoElement.paused || this.videoElement.ended) {
        this.videoElement.play().catch(() => {});
      } else {
        this.videoElement.pause();
      }
    };

    if (centerPlayBtn) centerPlayBtn.addEventListener("click", togglePlay);
    if (playPauseBtn) playPauseBtn.addEventListener("click", togglePlay);

    // Sync Play/Pause Icons & Center Button State
    const updatePlayState = () => {
      const isPaused = this.videoElement.paused || this.videoElement.ended;
      
      if (centerPlayBtn) {
        centerPlayBtn.classList.toggle("playing", !isPaused);
        const playIcon = centerPlayBtn.querySelector(".icon-play");
        const pauseIcon = centerPlayBtn.querySelector(".icon-pause");
        if (playIcon) playIcon.style.display = isPaused ? "block" : "none";
        if (pauseIcon) pauseIcon.style.display = isPaused ? "none" : "block";
      }

      if (playPauseBtn) {
        const playIcon = playPauseBtn.querySelector(".ctrl-icon-play");
        const pauseIcon = playPauseBtn.querySelector(".ctrl-icon-pause");
        if (playIcon) playIcon.style.display = isPaused ? "block" : "none";
        if (pauseIcon) pauseIcon.style.display = isPaused ? "none" : "block";
      }

      if (isPaused) {
        this.resetInactivityTimer(true); // Keep controls visible when paused
      } else {
        this.resetInactivityTimer(false);
      }
    };

    this.videoElement.addEventListener("play", updatePlayState);
    this.videoElement.addEventListener("pause", updatePlayState);
    this.videoElement.addEventListener("ended", updatePlayState);

    // Timeline & Scrubber
    const updateTimeAndScrubber = () => {
      const current = this.videoElement.currentTime;
      const duration = this.videoElement.duration || 0;

      if (currentTimeSpan) currentTimeSpan.textContent = formatTime(current);
      if (durationSpan && duration > 0) durationSpan.textContent = formatTime(duration);

      if (playedBar && duration > 0 && !this.isScrubbing) {
        const pct = (current / duration) * 100;
        playedBar.style.width = `${pct}%`;
      }

      // Update buffer
      if (bufferedBar && duration > 0 && this.videoElement.buffered.length > 0) {
        const bufferedEnd = this.videoElement.buffered.end(this.videoElement.buffered.length - 1);
        const buffPct = Math.min(100, (bufferedEnd / duration) * 100);
        bufferedBar.style.width = `${buffPct}%`;
      }
    };

    this.videoElement.addEventListener("timeupdate", updateTimeAndScrubber);
    this.videoElement.addEventListener("loadedmetadata", updateTimeAndScrubber);
    this.videoElement.addEventListener("progress", updateTimeAndScrubber);

    // Scrubber click & drag interaction
    if (timelineWrapper) {
      const seekFromPosition = (e) => {
        const rect = timelineWrapper.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const duration = this.videoElement.duration || 0;
        if (duration > 0) {
          this.videoElement.currentTime = pos * duration;
          if (playedBar) playedBar.style.width = `${pos * 100}%`;
        }
      };

      timelineWrapper.addEventListener("mousedown", (e) => {
        this.isScrubbing = true;
        timelineWrapper.classList.add("scrubbing");
        seekFromPosition(e);
      });

      timelineWrapper.addEventListener("mousemove", (e) => {
        const rect = timelineWrapper.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const duration = this.videoElement.duration || 0;
        if (tooltip && duration > 0) {
          tooltip.textContent = formatTime(pos * duration);
          tooltip.style.left = `${pos * 100}%`;
        }
        if (this.isScrubbing) {
          seekFromPosition(e);
        }
      });

      window.addEventListener("mousemove", (e) => {
        if (this.isScrubbing) {
          seekFromPosition(e);
        }
      });

      window.addEventListener("mouseup", () => {
        if (this.isScrubbing) {
          this.isScrubbing = false;
          timelineWrapper.classList.remove("scrubbing");
        }
      });

      // Touch scrubber support
      timelineWrapper.addEventListener("touchstart", (e) => {
        this.isScrubbing = true;
        seekFromPosition(e);
      }, { passive: true });

      timelineWrapper.addEventListener("touchmove", (e) => {
        if (this.isScrubbing) {
          seekFromPosition(e);
        }
      }, { passive: true });

      timelineWrapper.addEventListener("touchend", () => {
        this.isScrubbing = false;
      });
    }

    // Rewind / Forward 10s
    if (rewindBtn) {
      rewindBtn.addEventListener("click", () => {
        this.videoElement.currentTime = Math.max(0, this.videoElement.currentTime - 10);
      });
    }

    if (forwardBtn) {
      forwardBtn.addEventListener("click", () => {
        const dur = this.videoElement.duration || 0;
        this.videoElement.currentTime = Math.min(dur, this.videoElement.currentTime + 10);
      });
    }

    // Volume & Mute
    let lastVolume = 1;
    const updateVolumeUI = () => {
      const isMuted = this.videoElement.muted || this.videoElement.volume === 0;
      if (volumeBtn) {
        const highIcon = volumeBtn.querySelector(".vol-icon-high");
        const mutedIcon = volumeBtn.querySelector(".vol-icon-muted");
        if (highIcon) highIcon.style.display = isMuted ? "none" : "block";
        if (mutedIcon) mutedIcon.style.display = isMuted ? "block" : "none";
      }
      if (volumeSlider) {
        volumeSlider.value = isMuted ? 0 : this.videoElement.volume;
      }
    };

    if (volumeBtn) {
      volumeBtn.addEventListener("click", () => {
        if (this.videoElement.muted || this.videoElement.volume === 0) {
          this.videoElement.muted = false;
          this.videoElement.volume = lastVolume > 0 ? lastVolume : 1;
        } else {
          lastVolume = this.videoElement.volume;
          this.videoElement.muted = true;
        }
        updateVolumeUI();
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        this.videoElement.volume = val;
        this.videoElement.muted = val === 0;
        lastVolume = val > 0 ? val : lastVolume;
        updateVolumeUI();
      });
    }

    // Playback Speed
    if (speedBtn && speedDropdown) {
      speedBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        speedDropdown.classList.toggle("open");
      });

      speedDropdown.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const speed = parseFloat(btn.dataset.speed);
          this.videoElement.playbackRate = speed;
          if (currentSpeedSpan) currentSpeedSpan.textContent = `${speed}x`;
          speedDropdown.querySelectorAll("button").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          speedDropdown.classList.remove("open");
        });
      });

      document.addEventListener("click", () => {
        speedDropdown.classList.remove("open");
      });
    }

    // Fullscreen via Container-Level API (Protects Watermark & Overlays)
    if (fullscreenBtn) {
      const toggleFullscreen = () => {
        const isFS = document.fullscreenElement || document.webkitFullscreenElement;
        if (!isFS) {
          if (this.containerElement.requestFullscreen) {
            this.containerElement.requestFullscreen();
          } else if (this.containerElement.webkitRequestFullscreen) {
            this.containerElement.webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      };

      fullscreenBtn.addEventListener("click", toggleFullscreen);

      const updateFullscreenUI = () => {
        const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
        this.containerElement.classList.toggle("is-fullscreen", isFS);

        const enterIcon = fullscreenBtn.querySelector(".fs-icon-enter");
        const exitIcon = fullscreenBtn.querySelector(".fs-icon-exit");
        if (enterIcon) enterIcon.style.display = isFS ? "none" : "block";
        if (exitIcon) exitIcon.style.display = isFS ? "block" : "none";
      };

      document.addEventListener("fullscreenchange", updateFullscreenUI);
      document.addEventListener("webkitfullscreenchange", updateFullscreenUI);
    }

    // Inactivity Auto-Hide Logic
    this.containerElement.addEventListener("mousemove", () => {
      this.resetInactivityTimer(false);
    });

    this.containerElement.addEventListener("mouseleave", () => {
      if (!this.videoElement.paused && !this.videoElement.ended) {
        this.containerElement.classList.add("controls-hidden");
      }
    });

    // Keyboard Shortcuts (Space, Left/Right, Up/Down, M, F)
    window.addEventListener("keydown", (e) => {
      // Ignore if user is currently typing in an input or textarea
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) {
        return;
      }

      // Check if container is in viewport or user is on portal
      if (!this.containerElement) return;

      const key = e.key.toLowerCase();

      // Space or 'k' = Play/Pause
      if (e.code === "Space" || key === "k") {
        e.preventDefault();
        togglePlay();
        return;
      }

      // ArrowLeft or 'j' = Rewind 10s
      if (e.code === "ArrowLeft" || key === "j") {
        e.preventDefault();
        this.videoElement.currentTime = Math.max(0, this.videoElement.currentTime - 10);
        return;
      }

      // ArrowRight or 'l' = Forward 10s
      if (e.code === "ArrowRight" || key === "l") {
        e.preventDefault();
        const dur = this.videoElement.duration || 0;
        this.videoElement.currentTime = Math.min(dur, this.videoElement.currentTime + 10);
        return;
      }

      // ArrowUp = Volume Up
      if (e.code === "ArrowUp") {
        e.preventDefault();
        this.videoElement.volume = Math.min(1, this.videoElement.volume + 0.1);
        this.videoElement.muted = false;
        updateVolumeUI();
        return;
      }

      // ArrowDown = Volume Down
      if (e.code === "ArrowDown") {
        e.preventDefault();
        this.videoElement.volume = Math.max(0, this.videoElement.volume - 0.1);
        updateVolumeUI();
        return;
      }

      // 'm' = Mute / Unmute
      if (key === "m") {
        e.preventDefault();
        this.videoElement.muted = !this.videoElement.muted;
        updateVolumeUI();
        return;
      }

      // 'f' = Fullscreen Toggle
      if (key === "f") {
        e.preventDefault();
        if (fullscreenBtn) fullscreenBtn.click();
        return;
      }
    });
  }

  resetInactivityTimer(forceVisible = false) {
    if (!this.containerElement) return;

    this.containerElement.classList.remove("controls-hidden");
    if (this.hideControlsTimeout) clearTimeout(this.hideControlsTimeout);

    if (forceVisible || (this.videoElement && (this.videoElement.paused || this.videoElement.ended))) {
      return;
    }

    this.hideControlsTimeout = setTimeout(() => {
      if (this.videoElement && !this.videoElement.paused && !this.isScrubbing) {
        this.containerElement.classList.add("controls-hidden");
      }
    }, 2800);
  }

  /* ==========================================================
     DRM WATERMARKS & SECURITY OVERLAYS
     ========================================================== */
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
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h3>Playback Suspended for Security</h3>
        <p>Window focus was lost or screen capture / recording activity was detected. Return to this tab to resume playback.</p>
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

  updateForensicStamps() {
    if (!this.containerElement) return;
    const stampBr = this.containerElement.querySelector("#forensic-stamp-br");
    if (stampBr) {
      stampBr.textContent = `UID: ${this.getUserIdentifier()} • #${this.sessionId}`;
    }
  }

  getUserIdentifier() {
    if (this.currentUser && this.currentUser.email) {
      return this.currentUser.email;
    }
    return "student@resynk.in";
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
      const maxY = Math.max(20, bounds.height - watermarkBounds.height - 70);

      const randomX = Math.floor(Math.random() * maxX) + 20;
      const randomY = Math.floor(Math.random() * maxY) + 20;
      const randomOpacity = (Math.random() * 0.22 + 0.38).toFixed(2); // 0.38 to 0.60

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

    // Detect window blur (user clicking into OBS, Snipping tool, or secondary window)
    window.addEventListener("blur", () => {
      if (this.videoElement && !this.videoElement.paused) {
        this.triggerSecurityShield("Application window lost focus");
      }
    });

    window.addEventListener("focus", () => {
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
    // 1. Intercept context menu everywhere on the page for video player
    document.addEventListener("contextmenu", (e) => {
      const target = e.target;
      if (target.closest(".resynk-player-frame") || target.closest("video") || target.closest(".resynk-classroom")) {
        e.preventDefault();
        this.showToast("Right-click context menu is protected on resynk.");
        return false;
      }
    });

    // 2. Intercept keyboard piracy / inspect shortcuts
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
    if (this.hideControlsTimeout) clearTimeout(this.hideControlsTimeout);
    if (this.watermarkElement) this.watermarkElement.remove();
    if (this.securityShieldElement) this.securityShieldElement.remove();
  }
}
