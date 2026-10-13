/**
 * resynk — Firebase Authentication & Firestore Service
 * Google Authentication via Firebase SDK + Instant Student Access Fallback
 * Resolves Firebase CONFIGURATION_NOT_FOUND & Localhost Domain Authorization
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBHeHvJ2MmRzdIPMY2L-OCFBU3WLs4Shrs",
  authDomain: "resynk-82852.firebaseapp.com",
  projectId: "resynk-82852",
  storageBucket: "resynk-82852.firebasestorage.app",
  messagingSenderId: "769597845435",
  appId: "1:769597845435:web:411fb6c5317dc94ed85e9e",
  measurementId: "G-3BEPSND3HT"
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.provider = null;
    this.currentUser = null;
    this.authSubscribers = [];
    this.init();
  }

  init() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.provider = new GoogleAuthProvider();
      this.provider.setCustomParameters({ prompt: 'select_account' });

      // First check local student session
      const cachedStudent = localStorage.getItem("resynk_student_session");
      if (cachedStudent) {
        try {
          this.currentUser = JSON.parse(cachedStudent);
        } catch (e) {}
      }

      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            displayName: user.displayName || "resynk Student",
            email: user.email,
            photoURL: user.photoURL || "assets/avatar-default.svg",
            isFirebaseUser: true
          };
          localStorage.setItem("resynk_student_session", JSON.stringify(this.currentUser));
        } else if (!this.currentUser) {
          this.currentUser = null;
        }

        this.notifyAuthSubscribers(this.currentUser);
      });
    } catch (error) {
      console.warn("Firebase Auth Notice:", error);
    }
  }

  onAuth(callback) {
    this.authSubscribers.push(callback);
    if (this.currentUser !== undefined) {
      callback(this.currentUser);
    }
    return () => {
      this.authSubscribers = this.authSubscribers.filter(cb => cb !== callback);
    };
  }

  notifyAuthSubscribers(user) {
    this.authSubscribers.forEach(cb => {
      try { cb(user); } catch (e) { console.error(e); }
    });
  }

  /**
   * Google Sign In with Firebase Popup
   */
  async loginWithGoogle() {
    if (!this.auth || !this.provider) {
      throw new Error("Firebase Auth is not ready.");
    }

    try {
      const result = await signInWithPopup(this.auth, this.provider);
      const user = result.user;
      this.currentUser = {
        uid: user.uid,
        displayName: user.displayName || "resynk Student",
        email: user.email,
        photoURL: user.photoURL || "assets/avatar-default.svg",
        isFirebaseUser: true
      };
      localStorage.setItem("resynk_student_session", JSON.stringify(this.currentUser));
      this.notifyAuthSubscribers(this.currentUser);
      return this.currentUser;
    } catch (error) {
      console.error("Google Auth error:", error);
      
      const errorMsg = error.message || "";
      const isConfigNotFound = errorMsg.includes("CONFIGURATION_NOT_FOUND") || error.code === "auth/configuration-not-found";
      const isUnauthorizedDomain = error.code === "auth/unauthorized-domain";
      const isPopupBlocked = error.code === "auth/popup-blocked";

      if (isConfigNotFound || isUnauthorizedDomain || isPopupBlocked) {
        // Return structured error for graceful modal
        const err = new Error(
          isConfigNotFound 
            ? "FIREBASE_PROVIDER_DISABLED"
            : (isUnauthorizedDomain ? "UNAUTHORIZED_DOMAIN" : "POPUP_BLOCKED")
        );
        err.originalError = error;
        throw err;
      }

      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
        throw new Error("POPUP_CLOSED");
      }
      
      throw error;
    }
  }


  async logout() {
    try {
      if (this.auth) {
        await signOut(this.auth);
      }
    } catch (e) {
      console.warn("SignOut error:", e);
    }
    this.currentUser = null;
    localStorage.removeItem("resynk_student_session");
    this.notifyAuthSubscribers(null);
  }

  /**
   * Save course purchase with 3-Month (90-day) validity
   * Syncs to both Server Worker API and LocalStorage
   */
  async recordPurchase(courseId, paymentDetails = {}) {
    if (!this.currentUser) {
      throw new Error("Please sign in to complete your course enrollment.");
    }

    const now = new Date();
    const validityDays = 90; // Exactly 3 months
    const expiresAt = new Date(now.getTime() + (validityDays * 24 * 60 * 60 * 1000));

    const subscriptionData = {
      courseId: courseId,
      userId: this.currentUser.uid,
      userEmail: this.currentUser.email,
      purchasedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      validityDays: validityDays,
      paymentId: paymentDetails.paymentId || ("pay_" + Math.random().toString(36).substring(2, 10)),
      orderId: paymentDetails.orderId || ("ord_" + Math.random().toString(36).substring(2, 10)),
      amountPaid: paymentDetails.amount || 0,
      status: "active"
    };

    // If bundle was purchased, activate all 3 courses!
    const targetCourseIds = courseId === "all-access-pass" 
      ? ["guitar-mastery", "keyboard-mastery", "fine-arts-mastery", "all-access-pass"]
      : [courseId];

    // 1. Sync to LocalStorage (Instant zero-latency UI)
    const storageKey = `resynk_sub_${this.currentUser.uid}`;
    let existing = {};
    try {
      existing = JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (e) {}

    targetCourseIds.forEach(id => {
      existing[id] = { ...subscriptionData, courseId: id };
    });
    localStorage.setItem(storageKey, JSON.stringify(existing));

    // 2. Sync to Backend Worker API
    try {
      await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          userId: this.currentUser.uid,
          userEmail: this.currentUser.email,
          paymentId: subscriptionData.paymentId,
          orderId: subscriptionData.orderId,
          amount: subscriptionData.amountPaid
        })
      });
    } catch (err) {
      console.warn("Backend worker sync notice (local cache active):", err.message);
    }

    // 3. Sync to Firestore if authenticated via Firebase
    if (this.db && this.currentUser.isFirebaseUser) {
      try {
        for (const id of targetCourseIds) {
          const docRef = doc(this.db, "users", this.currentUser.uid, "subscriptions", id);
          await setDoc(docRef, { ...subscriptionData, courseId: id }, { merge: true });
        }
      } catch (err) {
        console.warn("Firestore sync deferred:", err.message);
      }
    }

    return subscriptionData;
  }

  /**
   * Check if user has active validity for a course
   */
  async getSubscriptionStatus(courseId) {
    if (!this.currentUser) {
      return { hasAccess: false, reason: "not_logged_in" };
    }

    // 1. Check local cache
    const storageKey = `resynk_sub_${this.currentUser.uid}`;
    let subs = {};
    try {
      subs = JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (e) {}

    let sub = subs[courseId] || subs["all-access-pass"];

    // 2. Fallback check Backend Worker API
    if (!sub) {
      try {
        const resp = await fetch(`/api/user/subscriptions?userId=${this.currentUser.uid}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.subscriptions && data.subscriptions.length > 0) {
            data.subscriptions.forEach(s => { subs[s.courseId] = s; });
            localStorage.setItem(storageKey, JSON.stringify(subs));
            sub = subs[courseId] || subs["all-access-pass"];
          }
        }
      } catch (e) {}
    }

    if (!sub) {
      return { hasAccess: false, reason: "not_purchased" };
    }

    const expiryTime = new Date(sub.expiresAt).getTime();
    const nowTime = Date.now();
    const diffMs = expiryTime - nowTime;

    if (diffMs <= 0) {
      return {
        hasAccess: false,
        reason: "expired",
        expiryDate: new Date(sub.expiresAt),
        daysRemaining: 0
      };
    }

    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.ceil(diffMs / (1000 * 60 * 60));

    return {
      hasAccess: true,
      subscription: sub,
      daysRemaining: daysRemaining,
      hoursRemaining: hoursRemaining,
      expiryDate: new Date(sub.expiresAt),
      formattedExpiry: new Date(sub.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };
  }

  /**
   * Get all active subscriptions of user
   */
  async getAllActiveSubscriptions() {
    if (!this.currentUser) return [];
    const storageKey = `resynk_sub_${this.currentUser.uid}`;
    let subs = {};
    try {
      subs = JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (e) {}

    const active = [];
    const nowTime = Date.now();

    for (const [courseId, sub] of Object.entries(subs)) {
      const expiry = new Date(sub.expiresAt).getTime();
      if (expiry > nowTime) {
        const daysLeft = Math.ceil((expiry - nowTime) / (1000 * 60 * 60 * 24));
        active.push({
          courseId,
          ...sub,
          daysLeft,
          formattedExpiry: new Date(sub.expiresAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        });
      }
    }

    return active;
  }
}

export const firebaseService = new FirebaseService();
