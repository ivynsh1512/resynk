# resynk — D Paul’s Academy Masterclass Platform

An artisanal, responsive web platform for **resynk**, offering structured masterclasses in **Guitar**, **Keyboard & Certified Music Theorem**, and **Fine Arts Studio**.

---

## 🌟 Key Features

1. **Disciplines Offered**:
   - **Guitar Mastery (Acoustic & Electric)**: Posture, 8 essential open chords, syncopated strumming, barre chord mechanics, fingerstyle polyphony, pentatonic lead improvisation.
   - **Keyboard & Comprehensive Music Theorem**: Based on D Paul’s Academy Certified Music Theorem. Hand independence, scale geometry, chord inversions, voice leading, and classical to pop accompaniments.
   - **Fine Arts & Creative Expression**: Pencil grading (2H–8B), light physics, shading gradients, 1 & 2-point perspective, Loomis portraiture method, and acrylic landscape painting.
   - **Triad Master Pass**: Complete 90-day access across all 3 disciplines.

2. **Razorpay Payment Integration**:
   - Integrated Razorpay standard checkout (`https://checkout.razorpay.com/v1/checkout.js`).
   - Prefills user information and INR billing.
   - Built-in graceful simulation checkout for zero-friction testing.

3. **Strict 3-Month (90 Days) Validity**:
   - Validity is calculated dynamically from the exact moment of payment:
     $$\text{Expiry Date} = \text{Purchase Timestamp} + (90 \times 24 \times 60 \times 60 \times 1000)$$
   - Real-time countdown timer badge in the student classroom displaying days remaining and formatted expiration date.
   - Automatic expiry enforcement once the 90-day window concludes.

4. **DRM Anti-Screen Recording & Anti-Download Engine**:
   - **Dynamic Forensic Moving Watermark**: Bouncing, semi-opaque cryptographic stamp rendering the student's verified email, session hash, and a live ticking clock `[HH:MM:SS]`. Shifts position every 5 seconds so that camera or software recordings permanently identify the leaker.
   - **Window Blur & Focus Shield**: Pauses playback and blacks out the player with a frosted security screen whenever the browser window loses focus or screen snipping tools (`Win+Shift+S`, `PrintScreen`) are activated.
   - **Download Neutralization**: Native `<video>` download attributes stripped via `controlsList="nodownload noplaybackrate noremoteplayback"` and `disablePictureInPicture`.
   - **Shortcut & DevTools Neutralization**: Blocks right-click context menu, `F12`, `Ctrl+Shift+I`, `Ctrl+U`, `Ctrl+S`, and `Ctrl+P`.
   - **Screen Capture API Interception**: Guards against `navigator.mediaDevices.getDisplayMedia` capture scripts.

5. **Firebase Authentication (Google Sign-In)**:
   - Configured with official Firebase v11 modular SDK.
   - Google sign-in via `signInWithPopup`.
   - Stores subscriptions and user session in Firestore and local client cache.
   - Includes instant student demo mode fallback for offline or custom localhost testing.

6. **Founder’s & Instructor’s Portfolio (D Paul’s Academy)**:
   - Dedicated editorial gallery at the bottom featuring **Master Reynole**:
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

## 🚀 Running the Project

Start the zero-dependency local static server:
```bash
node server.js
```
Then open your browser at:
```
http://localhost:3000
```
