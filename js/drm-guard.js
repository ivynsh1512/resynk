/**
 * resynk — High-Security DRM & Studio-Grade Responsive Video Player Controller
 * 
 * Features:
 * 1. Mobile-Responsive Custom Player:
 *    - Fluid 16:9 widescreen presentation (Zero letterboxing)
 *    - Tap-to-wake & auto-hiding controls (3s inactivity)
 *    - Mobile-optimized controls row (Play, Jump 10s, Volume, Time, Speed, Fullscreen)
 *    - Container-level & mobile orientation fullscreen support
 * 2. High-Security DRM & Forensic Protections:
 *    - Transparent interaction shield barrier (Prevents direct video tag access, context menu, drag-to-download)
 *    - Streamlined, non-intrusive dynamic moving forensic watermark (User Email + Clock + Session Hash)
 *    - Corner forensic micro-stamps to defeat cropped screen recordings
 *    - Window blur & tab switch auto-blackout shield (OBS, Snipping Tool, Task Switch)
 *    - Keyboard piracy interception (PrintScreen, F12, Ctrl+S, Ctrl+U, Ctrl+Shift+I)
 *    - Screen Capture API interception (getDisplayMedia guard)
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
    this.videoElement.setAttribute("webkit-playsinline", "true");
    this.videoElement.setAttribute("draggable", "false");
    this.videoElement.oncontextmenu = (e) => {
      e.preventDefault();
      this.showToast("Right-click is disabled on the video player.");
      return false;
    };
  }

  /* ==========================================================
     CUSTOM PLAYER CONTROLS & MOBILE TOUCH INTERACTION
     ========================================================== */
  setupCustomControls() {
    if (!this.containerElement || !this.videoElement) return;

    // Elements
    const barrier = this.containerElement.querySelector("#video-shield-barrier");
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

    // Click / Tap on Shield Barrier (Direct screen interaction)
    if (barrier) {
      barrier.addEventListener("click", () => {
        const isHidden = this.containerElement.classList.contains("controls-hidden");
        if (isHidden) {
          // If controls were hidden, wake them up
          this.resetInactivityTimer(false);
        } else {
          // If controls are visible, toggle playback
          togglePlay();
        }
      });

      // Mobile touch interaction
      barrier.addEventListener("touchstart", (e) => {
        // Prevent default touch callout
        this.resetInactivityTimer(false);
      }, { passive: true });
    }

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
        this.resetInactivityTimer(true);
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

      if (bufferedBar && duration > 0 && this.videoElement.buffered.length > 0) {
        try {
          const bufferedEnd = this.videoElement.buffered.end(this.videoElement.buffered.length - 1);
          const buffPct = Math.min(100, (bufferedEnd / duration) * 100);
          bufferedBar.style.width = `${buffPct}%`;
        } catch (e) {}
      }
    };

    this.videoElement.addEventListener("timeupdate", updateTimeAndScrubber);
    this.videoElement.addEventListener("loadedmetadata", updateTimeAndScrubber);
    this.videoElement.addEventListener("progress", updateTimeAndScrubber);

    // Scrubber click & drag interaction
    if (timelineWrapper) {
      const seekFromPosition = (e) => {
        const rect = timelineWrapper.getBoundingClientRect();
        const clientX = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX) || 0;
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

      // Mobile Touch Scrubbing
      timelineWrapper.addEventListener("touchstart", (e) => {
        this.isScrubbing = true;
        this.resetInactivityTimer(true);
        seekFromPosition(e);
      }, { passive: true });

      timelineWrapper.addEventListener("touchmove", (e) => {
        if (this.isScrubbing) {
          seekFromPosition(e);
        }
      }, { passive: true });

      timelineWrapper.addEventListener("touchend", () => {
        this.isScrubbing = false;
        this.resetInactivityTimer(false);
      });
    }

    // Rewind / Forward 10s
    if (rewindBtn) {
      rewindBtn.addEventListener("click", () => {
        this.videoElement.currentTime = Math.max(0, this.videoElement.currentTime - 10);
        this.resetInactivityTimer(false);
      });
    }

    if (forwardBtn) {
      forwardBtn.addEventListener("click", () => {
        const dur = this.videoElement.duration || 0;
        this.videoElement.currentTime = Math.min(dur, this.videoElement.currentTime + 10);
        this.resetInactivityTimer(false);
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
        this.resetInactivityTimer(false);
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
        this.resetInactivityTimer(true);
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
          this.resetInactivityTimer(false);
        });
      });

      document.addEventListener("click", () => {
        speedDropdown.classList.remove("open");
      });
    }

    // Fullscreen via Container-Level API (Mobile & Desktop Resilient)
    if (fullscreenBtn) {
      const toggleFullscreen = () => {
        const isFS = document.fullscreenElement || document.webkitFullscreenElement;
        if (!isFS) {
          if (this.containerElement.requestFullscreen) {
            this.containerElement.requestFullscreen().catch(() => {
              if (this.videoElement.webkitEnterFullscreen) this.videoElement.webkitEnterFullscreen();
            });
          } else if (this.containerElement.webkitRequestFullscreen) {
            this.containerElement.webkitRequestFullscreen();
          } else if (this.videoElement.webkitEnterFullscreen) {
            this.videoElement.webkitEnterFullscreen();
          }

          // Mobile orientation auto-rotate if allowed
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock("landscape").catch(() => {});
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
        }
        this.resetInactivityTimer(false);
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
    const wakeControls = () => {
      this.resetInactivityTimer(false);
    };

    this.containerElement.addEventListener("mousemove", wakeControls);
    this.containerElement.addEventListener("touchstart", wakeControls, { passive: true });

    this.containerElement.addEventListener("mouseleave", () => {
      if (!this.videoElement.paused && !this.videoElement.ended) {
        this.containerElement.classList.add("controls-hidden");
      }
    });

    // Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) {
        return;
      }
      if (!this.containerElement) return;

      const key = e.key.toLowerCase();

      if (e.code === "Space" || key === "k") {
        e.preventDefault();
        togglePlay();
        return;
      }

      if (e.code === "ArrowLeft" || key === "j") {
        e.preventDefault();
        this.videoElement.currentTime = Math.max(0, this.videoElement.currentTime - 10);
        return;
      }

      if (e.code === "ArrowRight" || key === "l") {
        e.preventDefault();
        const dur = this.videoElement.duration || 0;
        this.videoElement.currentTime = Math.min(dur, this.videoElement.currentTime + 10);
        return;
      }

      if (e.code === "ArrowUp") {
        e.preventDefault();
        this.videoElement.volume = Math.min(1, this.videoElement.volume + 0.1);
        this.videoElement.muted = false;
        updateVolumeUI();
        return;
      }

      if (e.code === "ArrowDown") {
        e.preventDefault();
        this.videoElement.volume = Math.max(0, this.videoElement.volume - 0.1);
        updateVolumeUI();
        return;
      }

      if (key === "m") {
        e.preventDefault();
        this.videoElement.muted = !this.videoElement.muted;
        updateVolumeUI();
        return;
      }

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
     DRM WATERMARKS & COMFORTABLE FORENSIC STAMPS
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
        <div class="watermark-header">
          <span class="watermark-brand">ReSynk</span>
          <span class="watermark-clock">00:00:00</span>
        </div>
        <div class="watermark-body">
          <span class="watermark-user">${this.getUserIdentifier()}</span>
          <span class="watermark-meta">#${this.sessionId}</span>
        </div>
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
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
        <h3>Playback Paused</h3>
        <p>Return to this window to resume streaming your lesson.</p>
        <button type="button" class="btn-resume-playback">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
      stampBr.textContent = `UID: #${this.sessionId}`;
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
    
    // Shift position unpredictably every 6 to 9 seconds to safe perimeter zones
    const move = () => {
      if (!this.watermarkElement || !this.containerElement) return;
      const bounds = this.containerElement.getBoundingClientRect();
      const watermarkBounds = this.watermarkElement.getBoundingClientRect();

      const maxX = Math.max(10, bounds.width - watermarkBounds.width - 20);
      const maxY = Math.max(10, bounds.height - watermarkBounds.height - 55);

      // Random corner / margin bias so it doesn't block center focus
      const safeQuadrants = [
        { x: Math.floor(Math.random() * (maxX * 0.4)) + 10, y: Math.floor(Math.random() * (maxY * 0.35)) + 10 },
        { x: Math.floor(Math.random() * (maxX * 0.4) + (maxX * 0.55)), y: Math.floor(Math.random() * (maxY * 0.35)) + 10 },
        { x: Math.floor(Math.random() * (maxX * 0.4)) + 10, y: Math.floor(Math.random() * (maxY * 0.35) + (maxY * 0.55)) },
        { x: Math.floor(Math.random() * (maxX * 0.4) + (maxX * 0.55)), y: Math.floor(Math.random() * (maxY * 0.35) + (maxY * 0.55)) }
      ];

      const chosen = safeQuadrants[Math.floor(Math.random() * safeQuadrants.length)];
      const randomOpacity = (Math.random() * 0.16 + 0.26).toFixed(2); // 0.26 to 0.42 translucent

      this.watermarkElement.style.transform = `translate(${chosen.x}px, ${chosen.y}px)`;
      this.watermarkElement.style.opacity = randomOpacity;
    };

    move();
    this.watermarkInterval = setInterval(move, 7000);
  }

  bindPlayerEvents() {
    // Detect visibility changes (tab switch, desktop switch, notification drawer)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.videoElement && !this.videoElement.paused) {
        this.triggerSecurityShield("Application window hidden or minimized");
      }
    });

    // Detect window blur (OBS / Snipping Tool / external recording window focus)
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
        this.showToast("Right-click is disabled on the video player.");
        return false;
      }
    });

    // 2. Intercept keyboard piracy / inspect shortcuts
    window.addEventListener("keydown", (e) => {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // PrintScreen detection & clipboard scrub
      if (key === "PrintScreen") {
        e.preventDefault();
        this.triggerSecurityShield("PrintScreen capture shortcut intercepted");
        this.showToast("Screen capture is disabled.");
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("");
          }
        } catch (err) {}
        return false;
      }

      // F12 (DevTools)
      if (key === "F12") {
        e.preventDefault();
        this.showToast("Inspection tools are disabled.");
        return false;
      }

      // Ctrl + Shift + I / J / C (Inspect / Console)
      if (ctrl && shift && ["I", "i", "J", "j", "C", "c"].includes(key)) {
        e.preventDefault();
        this.showToast("Inspection tools are disabled.");
        return false;
      }

      // Ctrl + U (View Source)
      if (ctrl && (key === "u" || key === "U")) {
        e.preventDefault();
        this.showToast("Action unavailable.");
        return false;
      }

      // Ctrl + S (Save Page / Save Video)
      if (ctrl && (key === "s" || key === "S")) {
        e.preventDefault();
        this.showToast("Streaming access only.");
        return false;
      }

      // Ctrl + P (Print Page)
      if (ctrl && (key === "p" || key === "P")) {
        e.preventDefault();
        this.showToast("Action unavailable.");
        return false;
      }
    }, true);

    // 3. Intercept Screen Capture API if called by browser extensions
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = (...args) => {
        this.triggerSecurityShield("Screen capture API attempt detected");
        this.showToast("Screen recording is not supported.");
        return Promise.reject(new Error("ReSynk: Video playback error."));
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    }, 3200);
  }

  destroy() {
    if (this.watermarkInterval) clearInterval(this.watermarkInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.hideControlsTimeout) clearTimeout(this.hideControlsTimeout);
    if (this.watermarkElement) this.watermarkElement.remove();
    if (this.securityShieldElement) this.securityShieldElement.remove();
  }
}
