# Railway WebAR — Marker → Browser Navigation

This is a **WebAR starter** for your offline AR navigation idea. It runs directly in the **mobile browser** — no app install.
When the **HIRO marker** is detected, the page enables the **Open Navigation** button that links to `nav.html`.

> Built: 2025-08-13

## What’s inside
- **index.html** — Camera + AR.js marker scanner (uses `preset="hiro"` so no patt file needed).
- **nav.html** — A simple page to show directions after detection.
- **manifest.json** + **service-worker.js** — Optional PWA setup so the site can work offline after first load.
- **assets/hiro_preview.svg** — A preview image for the marker (not used for detection).

## Quick start
1. **Host** these files (any static host):
   - GitHub Pages (free), Netlify, or Vercel.
2. Open `index.html` on your phone. **Allow camera access**.
3. Point the camera at a **HIRO marker** (print a copy or show on a second screen).  
   You can generate a HIRO marker from AR.js tools online or use any standard HIRO marker.
4. When detected, tap **Open Navigation** → it goes to `nav.html`.

## Make it your own
- Change what happens on detection: in `index.html`, edit the click handler for `openBtn` to go to a **specific route page** or pass parameters in the URL (e.g., `nav.html?dest=pf1`).
- Replace the floating arrow with your own 3D assets (glTF) or show text overlays pointing to different platforms.
- Update `nav.html` with your **floor plan** and real steps.

## Offline (PWA) mode (optional)
- The **first time** the user opens the site online, the service worker caches core files.
- After that, it can open **without internet** (camera + AR still needs HTTPS).  
  > Note: Most mobile browsers require **HTTPS** for camera access. Use GitHub Pages with HTTPS.

## Create a QR code
- After you deploy (e.g., `https://yourname.github.io/your-repo/`), generate a QR code pointing to your **`index.html`**.
- Print and place the QR near station entrances.

## Common issues
- **Camera not opening**: Ensure the site is on **HTTPS** and you **allow camera permission**.
- **Marker not detected**: Use a proper **HIRO marker** with high contrast and adequate lighting. Keep it steady and fill 30–60% of the screen.
- **Blank screen on iOS**: Try Safari, and ensure iOS 15+ with WebXR-compatible AR.js builds.

## Next steps
- Add **multiple markers** (e.g., at Entrance, Ticket Counter, Platforms). Each can route to a different page.
- Use **location-based AR** (GPS) with AR.js if you want markerless outdoor cues.
- Convert to a **kiosk mode** PWA for station devices.

---

**Folders/Files**
```
index.html
nav.html
manifest.json
service-worker.js
assets/
  └── hiro_preview.svg
```
