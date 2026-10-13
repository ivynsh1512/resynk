/**
 * resynk — Core Multipage Application Controller
 * Manages Firebase Google Auth, Razorpay 3-Month Subscriptions,
 * DRM-Protected Student Portal Classroom, and Founder Portfolio
 */

import { COURSES, FOUNDER_PORTFOLIO } from "./courses-data.js";
import { firebaseService } from "./firebase-app.js";
import { razorpayService } from "./razorpay-service.js";
import { DRMGuard } from "./drm-guard.js";

class ResynkApp {
  constructor() {
    this.drmGuard = new DRMGuard();
    this.activeCategory = "all";
    this.currentCourseId = "guitar-mastery";
    this.currentLesson = null;
    this.userSubscriptions = {};
    
    // Page Elements
    this.authContainer = document.getElementById("nav-auth-container");
    this.coursesGrid = document.getElementById("courses-grid");
    this.courseFilterButtons = document.querySelectorAll(".filter-btn");
    
    // Portal Specific DOM
    this.portalAuthGate = document.getElementById("portal-auth-gate");
    this.portalAuthArea = document.getElementById("portal-authenticated-area");
    this.portalWelcomeHeading = document.getElementById("portal-welcome-heading");
    this.btnPortalGoogleLogin = document.getElementById("btn-portal-google-login");

    // Classroom Player DOM
    this.playerContainer = document.getElementById("classroom-player-wrapper");
    this.playerVideo = document.getElementById("classroom-video");
    this.playerLockedOverlay = document.getElementById("classroom-locked-overlay");
    this.playlistContainer = document.getElementById("sidebar-playlist");
    this.courseSelector = document.getElementById("course-selector");
    this.lessonTitleDisplay = document.getElementById("lesson-title-display");
    this.lessonNotesDisplay = document.getElementById("lesson-notes-display");
    this.lessonTagDisplay = document.getElementById("lesson-tag-display");
    this.validityTimerDisplay = document.getElementById("validity-timer-display");
    
    // Portfolio Tabs
    this.portfolioTabButtons = document.querySelectorAll(".portfolio-tab-btn");
    this.portfolioPanels = document.querySelectorAll(".portfolio-content-panel");

    // Contact Form
    this.contactForm = document.getElementById("contact-inquiry-form");
    this.contactFeedback = document.getElementById("contact-form-feedback");

    this.init();
  }

  async init() {
    this.checkProtocolEnvironment();
    this.setupAuthListener();
    this.setupMobileMenu();
    this.renderCourses(this.activeCategory);
    this.setupCourseFilters();
    this.setupPortfolioTabs();
    this.setupContactForm();
    this.setupPortalAuthGate();

    // Setup Student Portal if on portal.html
    if (this.playerContainer && this.playerVideo) {
      this.drmGuard.attachToPlayer(this.playerContainer, this.playerVideo);
      this.setupClassroom();
    }
  }

  setupMobileMenu() {
    const navMenu   = document.getElementById('nav-menu');
    const btnOpen   = document.getElementById('btn-hamburger');
    const btnClose  = document.getElementById('btn-close-menu');

    if (!navMenu || !btnOpen) return;

    const openMenu = () => {
      navMenu.classList.add('mobile-open');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      navMenu.classList.remove('mobile-open');
      document.body.style.overflow = '';
    };

    btnOpen.addEventListener('click', openMenu);
    if (btnClose) btnClose.addEventListener('click', closeMenu);

    // Close on nav-link click (page navigation)
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  checkProtocolEnvironment() {
    if (window.location.protocol === 'file:') {
      const banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#B91C1C;color:#FFFFFF;padding:12px;text-align:center;font-weight:700;z-index:99999;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,0.8);';
      banner.innerHTML = `
        ⚠️ You opened this directly via file://. Browser security blocks modern web modules and authentication over file://. 
        Please run <strong>node server.js</strong> in your terminal and open <a href="http://localhost:3000" style="color:#FDE047;text-decoration:underline;">http://localhost:3000</a>.
      `;
      document.body.prepend(banner);
    }
  }

  /* ==========================================================
     AUTHENTICATION & USER STATE
     ========================================================== */
  setupAuthListener() {
    firebaseService.onAuth(async (user) => {
      this.drmGuard.setCurrentUser(user);
      this.renderNavAuth(user);
      await this.refreshUserSubscriptions();
      this.renderCourses(this.activeCategory);

      // Handle Portal Page Gate
      if (this.portalAuthGate && this.portalAuthArea) {
        if (user) {
          this.portalAuthGate.style.display = "none";
          this.portalAuthArea.style.display = "block";
          if (this.portalWelcomeHeading) {
            this.portalWelcomeHeading.textContent = `Welcome back, ${user.displayName.split(" ")[0]}!`;
          }
          this.renderEmailVerificationBanner(user);
          this.refreshClassroomAccess();
        } else {
          this.portalAuthGate.style.display = "block";
          this.portalAuthArea.style.display = "none";
        }
      } else if (this.playerContainer) {
        this.refreshClassroomAccess();
      }
    });
  }

  renderNavAuth(user) {
    if (!this.authContainer) return;

    if (user) {
      const isVerified = user.emailVerified;
      this.authContainer.innerHTML = `
        <div class="user-profile-badge" id="btn-user-profile" title="Signed in as ${user.email}">
          <img class="user-avatar" src="${user.photoURL}" alt="${user.displayName}">
          <div class="user-info">
            <span class="user-name">${user.displayName.split(" ")[0]}</span>
            <span class="user-status">${isVerified ? 'Verified Student' : 'Student (Unverified)'}</span>
          </div>
          <button type="button" class="btn-signout" id="btn-logout" title="Sign Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      `;

      const logoutBtn = document.getElementById("btn-logout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          firebaseService.logout();
        });
      }
    } else {
      this.authContainer.innerHTML = `
        <button type="button" class="btn-signin-nav" id="btn-open-auth-modal" aria-label="Sign In or Register">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Sign In</span>
        </button>
      `;

      const signinBtn = document.getElementById("btn-open-auth-modal");
      if (signinBtn) {
        signinBtn.addEventListener("click", () => this.showAuthModal("signin"));
      }
    }
  }

  renderEmailVerificationBanner(user) {
    const bannerBox = document.getElementById("email-verification-banner-container");
    if (!bannerBox) return;

    if (user && user.emailVerified === false) {
      bannerBox.innerHTML = `
        <div class="email-verification-banner">
          <span>✉️ Your student email (<strong>${user.email}</strong>) is pending verification. Please check your inbox or spam.</span>
          <button type="button" class="btn-resend-verification" id="btn-portal-resend-verif">Resend Verification Email</button>
        </div>
      `;

      const resendBtn = document.getElementById("btn-portal-resend-verif");
      if (resendBtn) {
        resendBtn.addEventListener("click", async () => {
          try {
            resendBtn.disabled = true;
            resendBtn.textContent = "Sending...";
            await firebaseService.resendVerificationEmail();
            resendBtn.textContent = "Sent to Inbox!";
          } catch (err) {
            alert(err.message || "Failed to resend. Please try again later.");
            resendBtn.disabled = false;
            resendBtn.textContent = "Resend Verification Email";
          }
        });
      }
    } else {
      bannerBox.innerHTML = "";
    }
  }

  setupPortalAuthGate() {
    const tabSignin = document.getElementById("tab-portal-signin");
    const tabSignup = document.getElementById("tab-portal-signup");
    const formSignin = document.getElementById("form-portal-signin");
    const formSignup = document.getElementById("form-portal-signup");
    const formReset = document.getElementById("form-portal-reset");
    const feedbackBox = document.getElementById("portal-auth-feedback");
    const linkForgot = document.getElementById("link-portal-forgot");
    const linkBack = document.getElementById("link-portal-back-to-signin");
    const btnGoogle = document.getElementById("btn-portal-google-login");

    if (!tabSignin || !tabSignup || !formSignin) return;

    const showFeedback = (msg, isError = true) => {
      if (!feedbackBox) return;
      feedbackBox.className = `auth-feedback-box ${isError ? 'error' : 'success'}`;
      feedbackBox.textContent = msg;
    };

    const clearFeedback = () => {
      if (feedbackBox) {
        feedbackBox.className = "auth-feedback-box";
        feedbackBox.textContent = "";
      }
    };

    // Tab switching
    tabSignin.addEventListener("click", () => {
      tabSignin.classList.add("active");
      tabSignup.classList.remove("active");
      formSignin.style.display = "block";
      formSignup.style.display = "none";
      if (formReset) formReset.style.display = "none";
      clearFeedback();
    });

    tabSignup.addEventListener("click", () => {
      tabSignup.classList.add("active");
      tabSignin.classList.remove("active");
      formSignup.style.display = "block";
      formSignin.style.display = "none";
      if (formReset) formReset.style.display = "none";
      clearFeedback();
    });

    // Forgot password view
    if (linkForgot) {
      linkForgot.addEventListener("click", (e) => {
        e.preventDefault();
        formSignin.style.display = "none";
        formSignup.style.display = "none";
        if (formReset) formReset.style.display = "block";
        tabSignin.classList.remove("active");
        tabSignup.classList.remove("active");
        clearFeedback();
      });
    }

    if (linkBack) {
      linkBack.addEventListener("click", (e) => {
        e.preventDefault();
        tabSignin.click();
      });
    }

    // Sign In Submit
    formSignin.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFeedback();
      const email = document.getElementById("portal-signin-email").value.trim();
      const pass = document.getElementById("portal-signin-password").value;
      const submitBtn = document.getElementById("btn-portal-submit-signin");

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span>Signing in...</span>";
        await firebaseService.loginWithEmail(email, pass);
      } catch (err) {
        showFeedback(this.formatAuthError(err), true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "<span>Sign In to Classroom</span>";
      }
    });

    // Sign Up Submit
    formSignup.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFeedback();
      const name = document.getElementById("portal-signup-name").value.trim();
      const email = document.getElementById("portal-signup-email").value.trim();
      const pass = document.getElementById("portal-signup-password").value;
      const submitBtn = document.getElementById("btn-portal-submit-signup");

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span>Creating account...</span>";
        const res = await firebaseService.signupWithEmail(name, email, pass);
        if (res.verificationSent) {
          showFeedback(`Account created! A confirmation email has been dispatched to ${email}.`, false);
        }
      } catch (err) {
        showFeedback(this.formatAuthError(err), true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "<span>Create Student Account</span>";
      }
    });

    // Password Reset Submit
    if (formReset) {
      formReset.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearFeedback();
        const email = document.getElementById("portal-reset-email").value.trim();
        const submitBtn = document.getElementById("btn-portal-submit-reset");

        try {
          submitBtn.disabled = true;
          submitBtn.innerHTML = "<span>Sending reset email...</span>";
          await firebaseService.resetPassword(email);
          showFeedback(`Password reset email sent to ${email}! Please check your inbox or spam folder.`, false);
        } catch (err) {
          showFeedback(this.formatAuthError(err), true);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = "<span>Send Password Reset Email</span>";
        }
      });
    }

    // Google Sign-In
    if (btnGoogle) {
      btnGoogle.addEventListener("click", () => this.handleGoogleLogin());
    }
  }

  showAuthModal(initialTab = "signin") {
    const existing = document.getElementById("resynk-auth-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "resynk-auth-modal";
    modal.className = "resynk-modal-backdrop active";
    modal.innerHTML = `
      <div class="auth-modal-card">
        <div class="modal-header">
          <div class="rzp-brand-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Student Authentication
          </div>
          <button type="button" class="btn-close-modal" id="modal-auth-close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="auth-tabs-row">
            <button type="button" class="auth-tab-btn ${initialTab === 'signin' ? 'active' : ''}" id="modal-tab-signin">Sign In</button>
            <button type="button" class="auth-tab-btn ${initialTab === 'signup' ? 'active' : ''}" id="modal-tab-signup">Create Account</button>
          </div>

          <div id="modal-auth-feedback" class="auth-feedback-box"></div>

          <!-- 1. Sign In Form -->
          <form id="modal-form-signin" style="${initialTab === 'signin' ? 'display:block;' : 'display:none;'}">
            <div class="auth-input-group">
              <label for="modal-signin-email">Student Email</label>
              <input type="email" id="modal-signin-email" class="form-control" placeholder="e.g. student@resynk.in" required>
            </div>
            <div class="auth-input-group">
              <label for="modal-signin-password">Password</label>
              <input type="password" id="modal-signin-password" class="form-control" placeholder="••••••••" required>
            </div>
            <div class="auth-actions-row">
              <span></span>
              <a href="#" class="auth-forgot-link" id="modal-link-forgot">Forgot Password?</a>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;" id="btn-modal-signin">
              <span>Sign In</span>
            </button>
          </form>

          <!-- 2. Sign Up Form -->
          <form id="modal-form-signup" style="${initialTab === 'signup' ? 'display:block;' : 'display:none;'}">
            <div class="auth-input-group">
              <label for="modal-signup-name">Full Name</label>
              <input type="text" id="modal-signup-name" class="form-control" placeholder="e.g. Divya Sharma" required>
            </div>
            <div class="auth-input-group">
              <label for="modal-signup-email">Email Address</label>
              <input type="email" id="modal-signup-email" class="form-control" placeholder="e.g. student@gmail.com" required>
            </div>
            <div class="auth-input-group">
              <label for="modal-signup-password">Password (Minimum 6 characters)</label>
              <input type="password" id="modal-signup-password" class="form-control" placeholder="••••••••" minlength="6" required>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 6px;" id="btn-modal-signup">
              <span>Create Account</span>
            </button>
            <span style="display: block; font-size: 0.78rem; color: var(--text-muted); margin-top: 10px; line-height: 1.4; text-align: center;">
              A verification link will be dispatched to your email address.
            </span>
          </form>

          <!-- 3. Password Reset Form -->
          <form id="modal-form-reset" style="display: none;">
            <div class="auth-input-group">
              <label for="modal-reset-email">Registered Email Address</label>
              <input type="email" id="modal-reset-email" class="form-control" placeholder="e.g. student@resynk.in" required>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;" id="btn-modal-reset">
              <span>Send Password Reset Email</span>
            </button>
            <div style="margin-top: 12px; text-align: center;">
              <a href="#" class="auth-forgot-link" id="modal-link-back">Back to Sign In</a>
            </div>
          </form>

          <div class="auth-divider">
            <span>or continue with</span>
          </div>

          <button type="button" class="btn-portal-google" id="btn-modal-google" style="margin-bottom: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector("#modal-auth-close").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

    const feedback = modal.querySelector("#modal-auth-feedback");
    const tabIn = modal.querySelector("#modal-tab-signin");
    const tabUp = modal.querySelector("#modal-tab-signup");
    const formIn = modal.querySelector("#modal-form-signin");
    const formUp = modal.querySelector("#modal-form-signup");
    const formRes = modal.querySelector("#modal-form-reset");
    const linkForgot = modal.querySelector("#modal-link-forgot");
    const linkBack = modal.querySelector("#modal-link-back");
    const googleBtn = modal.querySelector("#btn-modal-google");

    const setMsg = (text, isErr = true) => {
      feedback.className = `auth-feedback-box ${isErr ? 'error' : 'success'}`;
      feedback.textContent = text;
    };

    const clearMsg = () => {
      feedback.className = "auth-feedback-box";
      feedback.textContent = "";
    };

    tabIn.addEventListener("click", () => {
      tabIn.classList.add("active");
      tabUp.classList.remove("active");
      formIn.style.display = "block";
      formUp.style.display = "none";
      formRes.style.display = "none";
      clearMsg();
    });

    tabUp.addEventListener("click", () => {
      tabUp.classList.add("active");
      tabIn.classList.remove("active");
      formUp.style.display = "block";
      formIn.style.display = "none";
      formRes.style.display = "none";
      clearMsg();
    });

    linkForgot.addEventListener("click", (e) => {
      e.preventDefault();
      tabIn.classList.remove("active");
      tabUp.classList.remove("active");
      formIn.style.display = "none";
      formUp.style.display = "none";
      formRes.style.display = "block";
      clearMsg();
    });

    linkBack.addEventListener("click", (e) => {
      e.preventDefault();
      tabIn.click();
    });

    formIn.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMsg();
      const email = modal.querySelector("#modal-signin-email").value.trim();
      const pass = modal.querySelector("#modal-signin-password").value;
      const btn = modal.querySelector("#btn-modal-signin");
      try {
        btn.disabled = true;
        btn.innerHTML = "<span>Signing in...</span>";
        await firebaseService.loginWithEmail(email, pass);
        closeModal();
      } catch (err) {
        setMsg(this.formatAuthError(err), true);
      } finally {
        btn.disabled = false;
        btn.innerHTML = "<span>Sign In</span>";
      }
    });

    formUp.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMsg();
      const name = modal.querySelector("#modal-signup-name").value.trim();
      const email = modal.querySelector("#modal-signup-email").value.trim();
      const pass = modal.querySelector("#modal-signup-password").value;
      const btn = modal.querySelector("#btn-modal-signup");
      try {
        btn.disabled = true;
        btn.innerHTML = "<span>Creating account...</span>";
        const res = await firebaseService.signupWithEmail(name, email, pass);
        if (res.verificationSent) {
          setMsg(`Account created! A confirmation verification link has been sent to ${email}.`, false);
        }
        setTimeout(() => closeModal(), 1800);
      } catch (err) {
        setMsg(this.formatAuthError(err), true);
      } finally {
        btn.disabled = false;
        btn.innerHTML = "<span>Create Account</span>";
      }
    });

    formRes.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMsg();
      const email = modal.querySelector("#modal-reset-email").value.trim();
      const btn = modal.querySelector("#btn-modal-reset");
      try {
        btn.disabled = true;
        btn.innerHTML = "<span>Sending reset link...</span>";
        await firebaseService.resetPassword(email);
        setMsg(`Password reset link dispatched to ${email}! Please check your email inbox.`, false);
      } catch (err) {
        setMsg(this.formatAuthError(err), true);
      } finally {
        btn.disabled = false;
        btn.innerHTML = "<span>Send Password Reset Email</span>";
      }
    });

    googleBtn.addEventListener("click", async () => {
      try {
        await firebaseService.loginWithGoogle();
        closeModal();
      } catch (err) {
        if (err.message === "POPUP_CLOSED") return;
        setMsg(this.formatAuthError(err), true);
      }
    });
  }

  formatAuthError(err) {
    if (!err) return "An unexpected error occurred.";
    const code = err.code || err.message || "";
    if (code.includes("email-already-in-use")) {
      return "This email address is already registered. Please sign in.";
    }
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
      return "Invalid email or password. Please verify your credentials.";
    }
    if (code.includes("weak-password")) {
      return "Password must be at least 6 characters in length.";
    }
    if (code.includes("invalid-email")) {
      return "Please enter a valid student email address.";
    }
    if (code.includes("too-many-requests")) {
      return "Access temporarily locked due to multiple failed attempts. Please try again in a few moments.";
    }
    if (code.includes("network-request-failed")) {
      return "Network connection issue. Please check your internet connection.";
    }
    return err.message || "Authentication failed. Please try again.";
  }

  async handleGoogleLogin() {
    try {
      await firebaseService.loginWithGoogle();
    } catch (err) {
      if (err.message === "POPUP_CLOSED") return;
      alert(this.formatAuthError(err));
    }
  }


  async refreshUserSubscriptions() {
    if (!firebaseService.currentUser) {
      this.userSubscriptions = {};
      return;
    }

    const subs = await firebaseService.getAllActiveSubscriptions();
    this.userSubscriptions = {};
    subs.forEach(s => {
      this.userSubscriptions[s.courseId] = s;
    });
  }

  /* ==========================================================
     COURSE CATALOG & ENROLLMENT (RAZORPAY)
     ========================================================== */
  setupCourseFilters() {
    this.courseFilterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        this.courseFilterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeCategory = btn.dataset.category;
        this.renderCourses(this.activeCategory);
      });
    });
  }

  renderCourses(category = "all") {
    if (!this.coursesGrid) return;

    const filtered = category === "all"
      ? COURSES
      : COURSES.filter(c => c.category === category || (c.category === "bundle" && category === "bundle"));

    this.coursesGrid.innerHTML = filtered.map(course => {
      const isSubscribed = Boolean(this.userSubscriptions[course.id] || this.userSubscriptions["all-access-pass"]);

      return `
        <article class="course-card ${course.category === 'bundle' ? 'featured' : ''}" data-id="${course.id}">
          <div class="course-card-poster">
            <img src="${course.previewVideo.poster}" alt="${course.title}">
            <span class="course-badge-pill">${course.badge}</span>
            <div class="course-validity-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>3 Months Validity</span>
            </div>
          </div>
          <div class="course-card-body">
            <div class="course-meta-top">
              <span class="course-discipline">${course.discipline}</span>
              <div class="course-rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>${course.rating} (${course.reviewsCount})</span>
              </div>
            </div>

            <h3 class="course-title">${course.title}</h3>
            <p class="course-desc">${course.description}</p>

            <ul class="course-highlights-list">
              ${course.highlights.slice(0, 3).map(h => `
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>${h}</span>
                </li>
              `).join('')}
            </ul>

            <div class="course-pricing-row">
              <div class="pricing-block">
                <span class="price-current">₹${course.price.toLocaleString("en-IN")}</span>
                <span class="price-sub">90 Days Full Access Pass</span>
              </div>

              ${isSubscribed ? `
                <a href="/portal" class="btn-enroll-card enrolled">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>Watch in Portal</span>
                </a>
              ` : `
                <button type="button" class="btn-enroll-card" data-action="enroll" data-id="${course.id}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  <span>Enroll via Razorpay</span>
                </button>
              `}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Bind action buttons
    this.coursesGrid.querySelectorAll(".btn-enroll-card").forEach(btn => {
      if (btn.dataset.action === "enroll") {
        btn.addEventListener("click", () => {
          const courseId = btn.dataset.id;
          const course = COURSES.find(c => c.id === courseId);
          this.handleEnrollment(course);
        });
      }
    });
  }

  async handleEnrollment(course) {
    if (!firebaseService.currentUser) {
      this.handleGoogleLogin();
      return;
    }

    razorpayService.checkout(
      course,
      async (subscription) => {
        await this.refreshUserSubscriptions();
        this.renderCourses(this.activeCategory);
        this.showPurchaseSuccessModal(course, subscription);
      },
      (error) => {
        if (error.code !== "DISMISSED") {
          this.drmGuard.showToast(error.message || "Payment attempt failed.");
        }
      }
    );
  }

  showPurchaseSuccessModal(course, subscription) {
    const existing = document.getElementById("success-activation-modal");
    if (existing) existing.remove();

    const formattedDate = new Date(subscription.expiresAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const modal = document.createElement("div");
    modal.id = "success-activation-modal";
    modal.className = "resynk-modal-backdrop active";
    modal.innerHTML = `
      <div class="resynk-modal-card">
        <div class="modal-header">
          <div class="rzp-brand-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Enrollment Confirmed
          </div>
          <button type="button" class="btn-close-modal" id="close-success-modal">&times;</button>
        </div>
        <div class="modal-body" style="text-align: center;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34D399; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 style="font-size: 1.45rem; margin-bottom: 8px;">Welcome to ${course.title}</h3>
          <p style="color: #94A3B8; font-size: 0.92rem; margin-bottom: 24px;">
            Your 3-Month access is officially active. All lectures and practice materials are unlocked with dynamic DRM protection.
          </p>

          <div style="background: var(--bg-elevated); border: 1px solid var(--border-brass); border-radius: 14px; padding: 18px; margin-bottom: 24px; text-align: left;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
              <span style="color: #94A3B8;">Validity Window:</span>
              <strong style="color: var(--brass-light);">90 Days (3 Months)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
              <span style="color: #94A3B8;">Access Valid Until:</span>
              <strong style="color: #FFFFFF;">${formattedDate}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
              <span style="color: #94A3B8;">Transaction ID:</span>
              <code style="color: #A3E635; font-size: 0.78rem;">${subscription.paymentId}</code>
            </div>
          </div>

          <a href="/portal" class="btn-primary" style="width: 100%; justify-content: center; text-decoration: none;">
            <span>Open Student Portal Classroom</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector("#close-success-modal").addEventListener("click", () => modal.remove());
  }

  /* ==========================================================
     CLASSROOM & DRM PROTECTED PLAYER (/portal.html)
     ========================================================== */
  setupClassroom() {
    if (this.courseSelector) {
      this.courseSelector.addEventListener("change", (e) => {
        this.currentCourseId = e.target.value;
        this.renderClassroomCurriculum();
      });
    }

    this.renderClassroomCurriculum();
  }

  async renderClassroomCurriculum() {
    let course = COURSES.find(c => c.id === this.currentCourseId);
    if (!course || course.id === "all-access-pass") {
      course = COURSES[0];
      this.currentCourseId = course.id;
    }

    const subStatus = await firebaseService.getSubscriptionStatus(this.currentCourseId);
    this.updateValidityBanner(subStatus);

    if (!this.playlistContainer) return;

    this.playlistContainer.innerHTML = course.modules.map(mod => `
      <div class="module-group">
        <div class="module-title-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>Module ${mod.moduleNumber}: ${mod.title}</span>
        </div>
        ${mod.lessons.map(lesson => `
          <div class="lesson-playlist-item" data-lesson-id="${lesson.id}">
            <div class="lesson-number-badge">${lesson.number}</div>
            <div class="lesson-meta-content">
              <div class="lesson-item-title">${lesson.title}</div>
              <div class="lesson-item-duration">
                <span>${lesson.duration}</span>
                ${lesson.freePreview ? '<span class="preview-badge-chip">Sample</span>' : ''}
              </div>
            </div>
            ${lesson.freePreview || subStatus.hasAccess ? `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: var(--brass-main); flex-shrink: 0;">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            ` : `
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted); flex-shrink: 0;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            `}
          </div>
        `).join('')}
      </div>
    `).join('');

    const items = this.playlistContainer.querySelectorAll(".lesson-playlist-item");
    items.forEach(item => {
      item.addEventListener("click", () => {
        const lessonId = item.dataset.lessonId;
        this.selectLesson(course, lessonId);
      });
    });

    if (course.modules[0] && course.modules[0].lessons[0]) {
      this.selectLesson(course, course.modules[0].lessons[0].id);
    }
  }

  async selectLesson(course, lessonId) {
    let targetLesson = null;
    for (const mod of course.modules) {
      const found = mod.lessons.find(l => l.id === lessonId);
      if (found) {
        targetLesson = found;
        break;
      }
    }

    if (!targetLesson) return;
    this.currentLesson = targetLesson;

    if (this.playlistContainer) {
      this.playlistContainer.querySelectorAll(".lesson-playlist-item").forEach(item => {
        item.classList.toggle("active", item.dataset.lessonId === lessonId);
      });
    }

    if (this.lessonTitleDisplay) this.lessonTitleDisplay.textContent = targetLesson.title;
    if (this.lessonNotesDisplay) this.lessonNotesDisplay.textContent = targetLesson.summary;
    if (this.lessonTagDisplay) this.lessonTagDisplay.textContent = `${course.discipline} • Lesson ${targetLesson.number}`;

    const subStatus = await firebaseService.getSubscriptionStatus(course.id);
    const hasAccess = targetLesson.freePreview || subStatus.hasAccess;

    if (hasAccess) {
      if (this.playerLockedOverlay) this.playerLockedOverlay.style.display = "none";
      if (this.playerVideo) {
        this.playerVideo.src = targetLesson.videoUrl;
        this.playerVideo.load();
        this.playerVideo.play().catch(() => {});
      }
    } else {
      if (this.playerVideo) this.playerVideo.pause();
      this.renderLockedOverlay(course, targetLesson);
    }
  }

  renderLockedOverlay(course, lesson) {
    if (!this.playerLockedOverlay) return;

    this.playerLockedOverlay.style.display = "flex";
    this.playerLockedOverlay.innerHTML = `
      <div class="locked-card">
        <span class="locked-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Enrollment Required
        </span>
        <h3>Unlock ${course.discipline} Masterclass</h3>
        <p>Enroll via Razorpay to unlock 90 days of unrestricted streaming, comprehensive music theory sheets, and dynamic anti-recording watermark protection.</p>
        
        <div class="locked-meta-row">
          <div class="locked-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>3 Months Validity</span>
          </div>
          <div class="locked-meta-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>DRM Encrypted</span>
          </div>
        </div>

        <div class="locked-price-pill">₹${course.price.toLocaleString("en-IN")}</div>

        <button type="button" class="btn-unlock-lecture" id="btn-locked-overlay-enroll">
          <span>Enroll via Razorpay</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>
    `;

    const enrollBtn = this.playerLockedOverlay.querySelector("#btn-locked-overlay-enroll");
    if (enrollBtn) {
      enrollBtn.addEventListener("click", () => this.handleEnrollment(course));
    }
  }

  updateValidityBanner(subStatus) {
    if (!this.validityTimerDisplay) return;

    if (subStatus.hasAccess) {
      this.validityTimerDisplay.innerHTML = `
        <span class="validity-timer-label">Access Active</span>
        <span class="validity-timer-val">${subStatus.daysRemaining} Days Left (Valid until ${subStatus.formattedExpiry})</span>
      `;
    } else {
      this.validityTimerDisplay.innerHTML = `
        <span class="validity-timer-label">Access Status</span>
        <span class="validity-timer-val" style="color: var(--text-muted);">Enrollment Required (90 Days Access)</span>
      `;
    }
  }

  async refreshClassroomAccess() {
    if (this.currentCourseId) {
      const course = COURSES.find(c => c.id === this.currentCourseId) || COURSES[0];
      const subStatus = await firebaseService.getSubscriptionStatus(course.id);
      this.updateValidityBanner(subStatus);
      if (this.currentLesson) {
        this.selectLesson(course, this.currentLesson.id);
      }
    }
  }

  /* ==========================================================
     PORTFOLIO TABS
     ========================================================== */
  setupPortfolioTabs() {
    this.portfolioTabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;
        this.portfolioTabButtons.forEach(b => b.classList.remove("active"));
        this.portfolioPanels.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const panel = document.getElementById(`panel-${targetTab}`);
        if (panel) panel.classList.add("active");
      });
    });
  }

  /* ==========================================================
     CONTACT FORM
     ========================================================== */
  setupContactForm() {
    if (!this.contactForm) return;

    this.contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = this.contactForm.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;

      const payload = {
        name: document.getElementById("student-name")?.value,
        phone: document.getElementById("student-phone")?.value,
        discipline: document.getElementById("discipline-choice")?.value,
        message: document.getElementById("student-message")?.value
      };

      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      if (this.contactFeedback) this.contactFeedback.style.display = "block";
      this.contactForm.reset();
      if (submitBtn) submitBtn.disabled = false;
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.resynkApp = new ResynkApp();
});
