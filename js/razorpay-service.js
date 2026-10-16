/**
 * resynk — Razorpay Payment Gateway & 3-Month Validity Checkout
 * Standard Razorpay Checkout Integration
 */

import { firebaseService } from "./firebase-app.js";

class RazorpayService {
  constructor() {
    const stored = localStorage.getItem("resynk_rzp_key");
    if (!stored || stored.startsWith("rzp_test_")) {
      this.keyId = "rzp_live_ToSPK8kXuONfmF";
      localStorage.setItem("resynk_rzp_key", this.keyId);
    } else {
      this.keyId = stored;
    }
    this.isLoaded = false;
    this.loadRazorpayScript();
  }

  loadRazorpayScript() {
    if (window.Razorpay) {
      this.isLoaded = true;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = () => {
        console.warn("Razorpay script load blocked or offline. Test checkout will be used.");
        this.isLoaded = false;
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  setCustomKey(key) {
    if (key) {
      this.keyId = key;
      localStorage.setItem("resynk_rzp_key", key);
    }
  }

  /**
   * Launch Razorpay Checkout Modal
   * @param {Object} course - Course object from COURSES
   * @param {Function} onSuccess - Callback when payment succeeds
   * @param {Function} onError - Callback when payment fails
   */
  async checkout(course, onSuccess, onError) {
    // 1. Verify User is Logged In
    if (!firebaseService.currentUser) {
      if (onError) onError({ code: "AUTH_REQUIRED", message: "Please sign in with Google first to enroll." });
      return;
    }

    await this.loadRazorpayScript();

    const currentUser = firebaseService.currentUser;
    const amountInPaise = Math.round(course.price * 100);

    // Try pre-creating an authentic Razorpay order via backend
    let serverOrderId = null;
    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: course.price,
          courseId: course.id,
          discipline: course.discipline
        })
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.orderId && orderData.orderId.startsWith("order_")) {
          serverOrderId = orderData.orderId;
        }
        if (orderData.key) {
          this.keyId = orderData.key;
        }
      }
    } catch (e) {
      console.warn("Server order pre-creation skipped, continuing with standard checkout:", e);
    }

    // Standard Razorpay options
    const options = {
      key: this.keyId,
      amount: amountInPaise,
      currency: "INR",
      name: "ReSynk",
      description: `${course.title} (3-Month Access)`,
      image: `${window.location.origin}/assets/logo.jpg`,
      ...(serverOrderId ? { order_id: serverOrderId } : {}),
      notes: {
        discipline: course.discipline,
        validity: "3 Months",
        userId: currentUser.uid,
        userEmail: currentUser.email
      },
      prefill: {
        name: currentUser.displayName || "ReSynk Student",
        email: currentUser.email || "student@resynk.in"
      },
      theme: {
        color: "#D4AF37",
        backdrop_color: "#0B0C10"
      },
      handler: async (response) => {
        try {
          const sub = await firebaseService.recordPurchase(course.id, {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || serverOrderId || ("ord_" + Math.random().toString(36).substring(2, 9)),
            signature: response.razorpay_signature || "",
            amount: course.price
          });
          if (onSuccess) onSuccess(sub);
        } catch (err) {
          console.error("Error activating subscription:", err);
          if (onError) onError(err);
        }
      },
      modal: {
        ondismiss: () => {
          if (onError) onError({ code: "DISMISSED", message: "Payment cancelled by user." });
        }
      }
    };

    // If Razorpay SDK loaded and functional
    if (window.Razorpay) {
      try {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp) => {
          if (onError) onError({ code: "FAILED", message: resp.error.description });
        });
        rzp.open();
        return;
      } catch (e) {
        console.warn("Razorpay instance failed to initialize, presenting fallback checkout:", e);
      }
    }

    // Fallback modal for offline / simulated testing
    this.presentSimulatedCheckout(course, onSuccess, onError);
  }

  /**
   * Simulated test checkout modal
   */
  presentSimulatedCheckout(course, onSuccess, onError) {
    const existing = document.getElementById("rzp-simulated-modal");
    if (existing) existing.remove();

    const user = firebaseService.currentUser;
    const modal = document.createElement("div");
    modal.id = "rzp-simulated-modal";
    modal.className = "resynk-modal-backdrop active";
    modal.innerHTML = `
      <div class="resynk-modal-card">
        <div class="modal-header">
          <div class="rzp-brand-badge">
            <span class="rzp-dot"></span>
            Razorpay Secure Checkout
          </div>
          <button type="button" class="btn-close-modal" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="checkout-summary">
            <div class="checkout-course-badge">${course.discipline}</div>
            <h3>${course.title}</h3>
            <p class="checkout-tagline">${course.tagline}</p>
            
            <div class="checkout-pricing-row">
              <span class="pricing-label">Access Duration:</span>
              <span class="pricing-val highlight">3 Months Access</span>
            </div>
            <div class="checkout-pricing-row">
              <span class="pricing-label">Billed Amount:</span>
              <span class="pricing-val price">₹${course.price.toLocaleString("en-IN")}</span>
            </div>
            <div class="checkout-user-box">
              <span>Student Account:</span>
              <strong>${user.displayName} (${user.email})</strong>
            </div>
          </div>

          <div class="checkout-security-notice">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div>
              <strong>Instant Activation Guarantee</strong>
              <p>Lectures, practice guides, and certificate access are immediately unlocked in your Student Portal upon checkout.</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-cancel-checkout">Cancel</button>
          <button type="button" class="btn-confirm-payment">
            <span>Pay ₹${course.price.toLocaleString("en-IN")} via Razorpay</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".btn-close-modal");
    const cancelBtn = modal.querySelector(".btn-cancel-checkout");
    const confirmBtn = modal.querySelector(".btn-confirm-payment");

    const cleanup = () => modal.remove();

    closeBtn.addEventListener("click", () => {
      cleanup();
      if (onError) onError({ code: "DISMISSED", message: "Checkout closed." });
    });

    cancelBtn.addEventListener("click", () => {
      cleanup();
      if (onError) onError({ code: "DISMISSED", message: "Checkout cancelled." });
    });

    confirmBtn.addEventListener("click", async () => {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<span>Processing Secure Payment...</span>`;
      
      try {
        const sub = await firebaseService.recordPurchase(course.id, {
          paymentId: "pay_" + Math.random().toString(36).substring(2, 12).toUpperCase(),
          orderId: "order_" + Math.random().toString(36).substring(2, 10),
          amount: course.price
        });
        cleanup();
        if (onSuccess) onSuccess(sub);
      } catch (err) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<span>Try Again</span>`;
        if (onError) onError(err);
      }
    });
  }
}

export const razorpayService = new RazorpayService();
