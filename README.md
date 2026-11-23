# Mitch — Boundary-Set Platonic AI Companion

**Mitch** is a boundary-set platonic AI companion web app built to encourage healthy conversational habits and mindful screen time. Built with Next.js, React, Tailwind CSS, and the Google Gemini API.

---

## What's Inside (Teammate Guide)

### 1. Chat Tab & Demo Time Controls
* **Live Session Timer (`MM:SS`):** Tracks how long you have been chatting in real time.
* **Quick Demo Shortcuts (`+10m` / `+30m`):** Located right inside the chat tab so we don't have to sit and chat for 15–30 minutes just to test the break modals. Click them during demos/presentations to jump the session timer forward and trigger the reflection break and long-session warnings immediately.

### 2. Built-In Boundaries & Safety Guardrails
* **Strictly Platonic Role:** Mitch uses persistent role badges and dynamic system prompts to stay strictly a peer/friend—romantic, flirtatious, or emotional dependency prompts are politely turned down.
* **Explicit Content Ban:** NSFW, explicit, and inappropriate topics are strictly blocked and redirected.
* **Mindful Break Nudges:** Automatically interrupts long chat sessions with reflection break prompts encouraging users to take a breather offline.

### 3. UI & Navigation
* **Light Mode / Dark Mode Toggle:** Switch themes anytime from the interface.
* **Navigation Tabs:**
  * **Home / Chat:** Main conversation view with live timer and demo time-skip buttons.
  * **About Me:** User profile and preferences view.
  * **About Mitch:** Explains Mitch's platonic boundaries, design purpose, and AI limitations.

---

## Tech Stack
* Next.js / React / TypeScript
* Tailwind CSS
* Google Gemini API
* Vercel

---

## Run Locally
```bash
git clone [https://github.com/chawsandyhtet-kuro/mitch-ai-companion.git](https://github.com/chawsandyhtet-kuro/mitch-ai-companion.git)
cd mitch-ai-companion
npm install
npm run dev
