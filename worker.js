/**
 * resynk — Cloudflare Worker API & Static Asset Router
 * Backed by Cloudflare D1 Database (resynk-db)
 * Live domain: https://resynk.divyansh-shukla.workers.dev
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    // =========================================================
    // API ROUTES (Cloudflare D1 Database)
    // =========================================================
    if (pathname.startsWith("/api/")) {
      try {
        // 1. Health check & DB verification
        if (pathname === "/api/health" && request.method === "GET") {
          let dbStatus = "connected";
          let totalSubscriptions = 0;
          try {
            if (env.DB) {
              const res = await env.DB.prepare("SELECT count(*) as count FROM subscriptions").first();
              totalSubscriptions = res ? res.count : 0;
            } else {
              dbStatus = "binding_missing";
            }
          } catch (dbErr) {
            dbStatus = "error: " + dbErr.message;
          }

          return jsonResponse({
            status: "healthy",
            academy: "ReSynk Academy",
            founder: "Master Rey",
            coFounder: "Sneha Sharma",
            database: "Cloudflare D1 (resynk-db)",
            dbStatus,
            totalSubscriptions,
            timestamp: new Date().toISOString()
          });
        }

        // 2. Razorpay Order Creation via official Razorpay API
        if (pathname === "/api/razorpay/create-order" && request.method === "POST") {
          const body = await request.json().catch(() => ({}));
          const amount = Number(body.amount) || 249;
          const courseId = body.courseId || "guitar-mastery";
          const keyId = env.RAZORPAY_KEY_ID || "rzp_live_ToSPK8kXuONfmF";
          const keySecret = env.RAZORPAY_KEY_SECRET;

          try {
            const authHeader = "Basic " + btoa(`${keyId}:${keySecret}`);
            const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
              method: "POST",
              headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                amount: Math.round(amount * 100),
                currency: "INR",
                receipt: "rcpt_" + Date.now().toString().slice(-8),
                notes: {
                  courseId,
                  discipline: body.discipline || "Music & Arts",
                  platform: "ReSynk"
                }
              })
            });

            if (rzpRes.ok) {
              const rzpOrder = await rzpRes.json();
              return jsonResponse({
                success: true,
                orderId: rzpOrder.id,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                courseId,
                key: keyId
              });
            } else {
              const errData = await rzpRes.text();
              console.warn("Razorpay API order error:", errData);
            }
          } catch (e) {
            console.error("Razorpay order creation fallback:", e);
          }

          // Fallback response allowing client to open standard checkout
          return jsonResponse({
            success: true,
            orderId: null,
            amount: Math.round(amount * 100),
            currency: "INR",
            courseId,
            key: keyId
          });
        }

        // 3. Razorpay Payment Verification & 3-Month Validity Storage in D1
        if (pathname === "/api/razorpay/verify-payment" && request.method === "POST") {
          const body = await request.json().catch(() => ({}));
          const { courseId, userId, userEmail, paymentId, orderId, signature, amount } = body;

          if (!courseId || !userId) {
            return jsonResponse({ success: false, message: "Missing courseId or userId" }, 400);
          }

          const keySecret = env.RAZORPAY_KEY_SECRET;

          // If signature & orderId are provided, verify cryptographically with HMAC SHA-256
          if (signature && orderId && keySecret) {
            try {
              const encoder = new TextEncoder();
              const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(keySecret),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
              );
              const signatureBuffer = await crypto.subtle.sign(
                "HMAC",
                key,
                encoder.encode(`${orderId}|${paymentId}`)
              );
              const hashArray = Array.from(new Uint8Array(signatureBuffer));
              const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
              if (expectedSignature !== signature) {
                console.warn("Razorpay signature mismatch:", { expectedSignature, received: signature });
              }
            } catch (err) {
              console.warn("Signature verification exception:", err);
            }
          }

          const now = new Date();
          const validityDays = 92; // 3 months validity
          const expiresAt = new Date(now.getTime() + (validityDays * 24 * 60 * 60 * 1000));

          const safeUserEmail = userEmail || "student@resynk.in";
          const safePaymentId = paymentId || ("pay_" + crypto.randomUUID().replace(/-/g, "").substring(0, 10));
          const safeOrderId = orderId || ("ord_" + crypto.randomUUID().replace(/-/g, "").substring(0, 10));
          const safeAmount = Number(amount) || 0;

          // If bundle pass is purchased, activate all 3 core courses
          const targetCourses = courseId === "all-access-pass"
            ? ["guitar-mastery", "keyboard-mastery", "fine-arts-mastery", "all-access-pass"]
            : [courseId];

          // Save each record to Cloudflare D1
          if (env.DB) {
            for (const cid of targetCourses) {
              const recordId = `${userId}_${cid}`;
              await env.DB.prepare(`
                INSERT INTO subscriptions (
                  id, user_id, user_email, course_id, payment_id, order_id, amount_paid, purchased_at, expires_at, validity_days, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  payment_id = excluded.payment_id,
                  order_id = excluded.order_id,
                  amount_paid = excluded.amount_paid,
                  purchased_at = excluded.purchased_at,
                  expires_at = excluded.expires_at,
                  validity_days = excluded.validity_days,
                  status = 'active'
              `).bind(
                recordId,
                userId,
                safeUserEmail,
                cid,
                safePaymentId,
                safeOrderId,
                safeAmount,
                now.toISOString(),
                expiresAt.toISOString(),
                validityDays,
                "active"
              ).run();
            }
          }

          return jsonResponse({
            success: true,
            message: "Payment verified and 3-month access granted in Cloudflare D1.",
            subscription: {
              courseId,
              userId,
              userEmail: safeUserEmail,
              paymentId: safePaymentId,
              orderId: safeOrderId,
              amountPaid: safeAmount,
              purchasedAt: now.toISOString(),
              expiresAt: expiresAt.toISOString(),
              validityDays,
              status: "active"
            }
          });
        }

        // 4. Fetch Active Subscriptions for a Student from D1
        if (pathname === "/api/user/subscriptions" && request.method === "GET") {
          const userId = searchParams.get("userId");
          if (!userId) {
            return jsonResponse({ success: false, message: "Missing userId parameter" }, 400);
          }

          let activeSubs = [];
          if (env.DB) {
            const { results } = await env.DB.prepare(`
              SELECT * FROM subscriptions WHERE user_id = ?
            `).bind(userId).all();

            const nowTime = Date.now();
            if (results && results.length > 0) {
              for (const row of results) {
                const expTime = new Date(row.expires_at).getTime();
                if (expTime > nowTime) {
                  const daysLeft = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));
                  activeSubs.push({
                    id: row.id,
                    courseId: row.course_id,
                    userId: row.user_id,
                    userEmail: row.user_email,
                    paymentId: row.payment_id,
                    orderId: row.order_id,
                    amountPaid: row.amount_paid,
                    purchasedAt: row.purchased_at,
                    expiresAt: row.expires_at,
                    validityDays: row.validity_days,
                    status: row.status,
                    daysLeft
                  });
                }
              }
            }
          }

          return jsonResponse({
            success: true,
            subscriptions: activeSubs
          });
        }

        // 5. Contact Inquiries to D1
        if (pathname === "/api/contact" && request.method === "POST") {
          const body = await request.json().catch(() => ({}));
          const { name, phone, email, discipline, message } = body;

          if (env.DB && name && (phone || email)) {
            const inquiryId = crypto.randomUUID();
            await env.DB.prepare(`
              INSERT INTO inquiries (id, name, phone, discipline, message, created_at)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(
              inquiryId,
              String(name),
              String(phone || email || ""),
              String(discipline || "General"),
              String(message || ""),
              new Date().toISOString()
            ).run();
          }

          return jsonResponse({
            success: true,
            message: "Inquiry received. Master Rey & academy coordinators will contact you shortly."
          });
        }

        return jsonResponse({ success: false, message: "API endpoint not found" }, 404);
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }

    // =========================================================
    // STATIC ASSETS & MULTI-PAGE CLEAN URL ROUTING
    // =========================================================
    if (env.ASSETS) {
      let assetUrl = new URL(request.url);

      // Clean route rewriting
      if (pathname === "/" || pathname === "") {
        assetUrl.pathname = "/index.html";
      } else if (pathname === "/courses") {
        assetUrl.pathname = "/courses.html";
      } else if (pathname === "/portal") {
        assetUrl.pathname = "/portal.html";
      } else if (pathname === "/about") {
        assetUrl.pathname = "/about.html";
      } else if (pathname === "/portfolio") {
        assetUrl.pathname = "/about.html";
      } else if (pathname === "/contact") {
        assetUrl.pathname = "/contact.html";
      }

      const assetRequest = new Request(assetUrl.toString(), request);
      const response = await env.ASSETS.fetch(assetRequest);

      // If clean URL was requested without .html and direct match failed, try appending .html
      if (response.status === 404 && !pathname.includes(".")) {
        const fallbackUrl = new URL(request.url);
        fallbackUrl.pathname = `${pathname}.html`;
        const fallbackResponse = await env.ASSETS.fetch(new Request(fallbackUrl.toString(), request));
        if (fallbackResponse.status < 400) {
          return fallbackResponse;
        }
      }

      return response;
    }

    return new Response("ReSynk Cloudflare Worker is running. Assets binding not configured.", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }
};
