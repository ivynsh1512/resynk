# resynk — D Paul’s Academy Masterclass Platform

An artisanal, responsive web conservatory for **resynk**, offering structured masterclasses in **Guitar**, **Keyboard & Certified Music Theorem**, and **Fine Arts Studio** by **D Paul’s Academy** (Founder & Director Master Reynole, since 2014, Kothanur, Bangalore).

---

## 🌐 Live Production URL
- **Cloudflare Worker**: [https://resynk.divyansh-shukla.workers.dev](https://resynk.divyansh-shukla.workers.dev)
- **GitHub Repository**: [https://github.com/ivynsh1512/resynk](https://github.com/ivynsh1512/resynk)

---

## 🌟 Key Architectural Features

1. **Disciplines & 4-Course Single-Row Catalog**:
   - **Guitar Mastery (Acoustic & Electric)**: Posture, 8 essential open chords, syncopated strumming, barre chord mechanics, fingerstyle polyphony, pentatonic lead improvisation. (₹1,499)
   - **Keyboard & Comprehensive Music Theorem**: Based on D Paul’s Academy Certified Music Theorem. Hand independence, scale geometry, chord inversions, voice leading, and classical to pop accompaniments. (₹1,499)
   - **Fine Arts & Creative Expression Studio**: Pencil grading (2H–8B), light physics, shading gradients, 1 & 2-point perspective, Loomis portraiture method, and acrylic landscape painting. (₹1,099)
   - **Triad Master Pass**: Complete 90-day access across all 3 disciplines. (₹2,999)
   - Rendered across desktop in a clean, balanced **single 4-column row** with responsive tablet (2-col) and mobile (1-col) stacking.

2. **Razorpay Payment Integration**:
   - Integrated Razorpay standard checkout (`https://checkout.razorpay.com/v1/checkout.js`).
   - Prefills verified user information and INR billing.
   - Real-time order creation and verification against Cloudflare D1 database.

3. **Strict 3-Month (90 Days) Validity Architecture**:
   - Validity is calculated dynamically from the exact moment of payment:
     $$\text{Expiry Date} = \text{Purchase Timestamp} + (90 \times 24 \times 60 \times 60 \times 1000)$$
   - Real-time countdown timer badge in the student classroom displaying days remaining and formatted expiration date.
   - Automatic expiry enforcement once the 90-day window concludes.

4. **Studio-Grade DRM Anti-Screen Recording & Anti-Download Engine**:
   - **Dynamic Forensic Moving Watermark**: Bouncing, semi-opaque cryptographic stamp rendering the student's verified email, session hash, and a live ticking clock `[HH:MM:SS]`. Shifts position every 5 seconds so that camera or software recordings permanently identify the leaker.
   - **Window Blur & Focus Shield**: Pauses playback and blacks out the player with a frosted security screen whenever the browser window loses focus or screen snipping tools (`Win+Shift+S`, `PrintScreen`) are activated.
   - **Download Neutralization**: Native `<video>` download attributes stripped via `controlsList="nodownload noplaybackrate noremoteplayback"` and `disablePictureInPicture`.
   - **Shortcut & DevTools Neutralization**: Blocks right-click context menu, `F12`, `Ctrl+Shift+I`, `Ctrl+U`, `Ctrl+S`, and `Ctrl+P`.
   - **Screen Capture API Interception**: Guards against `navigator.mediaDevices.getDisplayMedia` capture scripts.

5. **Pure Google Authentication (Firebase SDK)**:
   - Configured with official Firebase v11 modular SDK.
   - Clean, authentic Google sign-in via `signInWithPopup(auth, provider)` — zero mock credentials or fake logins.
   - Synchronizes subscriptions across Cloudflare D1, Firestore, and client session.

6. **Cloudflare Worker & Cloudflare D1 Database**:
   - **Worker**: Edge router handling static asset delivery and clean multi-page URL routing (`/`, `/courses`, `/portal`, `/portfolio`, `/contact`).
   - **D1 Database**: `resynk-db` (APAC/Singapore) storing active subscriptions, payment tokens, and student inquiry records.

7. **Founder’s & Instructor’s Portfolio (Master Reynole)**:
   - Comprehensive 9-section editorial biography:
     - **Profile**: Founder / Director since 2014 • Motto: *"Dance • Learn • Grow"*
     - **Education & Certifications**: BA Sociology, PGDP in Psychology, International Certified Happiness Coach, Certified Comprehensive Music Theorem
     - **Awards & Recognition**: State Level Seva Bhushan Puraskar Award, Best Empowering Choreographer from Swing, Coherence Appreciation Award
     - **Judging & Guest Appearances**: St Francis PU College (×2), Santa Fest by Swing, St Anne’s PU College (×2), St Anne’s Women’s Degree College, St Francis Xavier Degree College, United College
     - **Events**: IBM 2014, Mphasis 2015, Global Thinkers 2017 & 2018, Swing Event 2018/2019, Survana Karnataka Varnangal Event (2016-2024), food fests & wedding galas
     - **Organizations & Communities**: Suvarna Karnataka Kerala Samajan, Orkid Woods Dance Classes, Krishna Northwoods, Purva Palm Beach Dance, Vajram Essenza, Mantri Web City, Brigade Towers, Nikko Apartments
     - **School Collaborations**: Groups 1 to 4 (Clarence High School, Kinderdale International, Riverstone, St Patrick's, Hegemony Global, etc.)
     - **Colleges Annual Days**: St Francis PU College, St Anne’s College, St Francis Xavier Degree College
     - **Contact & Socials**: Instagram `@Master_reynole`, YouTube `@Dpauls_academy`, Phone `910 839 6010`, Location `Kothanur, Bangalore`.

---

## 🛠️ Local Development & Deployment

### 1. Run Locally
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000).

### 2. Deploy to Cloudflare Workers
```bash
npm run deploy
```

### 3. Initialize D1 Database Schema
```bash
npm run d1:init
```
