# 🌙 FunkinMoon-Web

> **Next-Gen Rhythm Gaming Engine for the Web.**  
> A lightweight, modular, and highly optimized JavaScript engine designed to run *Friday Night Funkin'* mods directly in the browser across Desktop and Mobile devices.

---

## 📌 Overview

**MoonEngine Web** was engineered to deliver a smooth, lag-free experience that stays true to the original *Friday Night Funkin'* gameplay, incorporating advanced engine features directly into the Web ecosystem.

---

## ✨ Key Features

- **⚡ PWA & Offline First**: Operates fully offline thanks to Service Worker (v13) supporting *Range-Requests* for streamed audio.
- **🎵 Conductor & Audio Engine (`FunkinSound.js`)**: Real-time audio synchronization with dynamic BPM change mapping, rate/pitch adjustments, volume control, and audio fading.
- **📦 Integrated Modding System (`PolyMod.js` & `Mods.js`)**:
  - Dynamic overriding and loading of custom assets (music, charts, graphics, sound effects).
  - Native support for the `pack.json` format inside `mods/`.
  - Fast live asset reloading (**Hot-Reload via F5**).
- **📱 Cross-Platform Optimization**:
  - **Mobile**: Touch controls, haptic vibration support, screen lock via WakeLock API, and Android back button interception.
  - **Desktop**: Fullscreen support (**F11**), FPS & Debug overlay (**F3**), frame rate configuration (30 to 240 FPS), and Electron/NW.js compatibility.
- **🌐 Community Features**:
  - Discord OAuth2 authentication support.
  - Global community chat grouped by channels/rooms.

---

## 🛠️ Project Architecture

```text
FunkinMoon-Web/
├── index.html                  # Main landing interface, WebGL canvas & interactive intro
├── project.js                  # Script sequence orchestrator & dependency loader
├── sw.js                       # Service Worker with multi-tier caching strategies
├── manifest.json               # Web App Manifest settings for PWA
├── assets/                     # Global static game assets
│   ├── images/                 # Sprites and menu graphics
│   ├── sounds/                 # Sound effects (.ogg)
│   ├── music/                  # Background music track (.ogg)
│   └── songs/                  # Audio tracks and chart data
├── mods/                       # Directory for community mods
│   └── introMod/               # Example mod implementation
│       ├── pack.json           # Mod manifest and asset overrides
│       └── scripts/            # Custom logic scripts (.lua)
└── source/                     # Core engine codebase
    ├── Main.js                 # Engine orchestrator & state manager
    └── funkin/
        ├── Version.js          # SemVer version management
        ├── Preferences.js      # Saved user options and configuration
        ├── Paths.js            # Dynamic asset path resolver
        ├── audio/
        │   └── FunkinSound.js  # Audio wrapper & sound pooling system
        ├── backend/
        │   ├── Conductor.js    # BPM synchronization & timing windows
        │   └── Mods.js         # Community mod loader & catalog manager
        ├── external/
        │   ├── android/AndroidAPI.js
        │   └── windows/WinAPI.js
        ├── modding/
        │   ├── PolyMod.js      # File override & manifest resolver
        │   └── module/Module.js
        ├── play/
        │   └── PlayState.js    # Gameplay loop, strum lines & hit checks
        └── ui/
            ├── community/CommunityMenu.js
            ├── freeplay/FreeplayState.js
            ├── options/OptionsState.js
            └── debug/FunkinDebugDisplay.js
```

---

## 🚀 How to Run Locally

Because the engine relies on **Service Workers** and asynchronous `fetch` calls to read assets and JSON files, it must be served over a local HTTP server.

### Using VS Code
1. Install the **Live Server** extension.
2. Open the project root folder in VS Code.
3. Right-click `index.html` and click **Open with Live Server**.

### Using Node.js (npx)
```bash
# Serve the project directory with http-server
npx http-server -p 8080 .
```
Then navigate to `http://localhost:8080` in your web browser.

---

## ⌨️ Keybindings

| Key | Action |
| :--- | :--- |
| **F3** | Toggle Debug Display (FPS meter & JS Memory usage). |
| **F5** | Hot-reload the currently active mod. |
| **F11** | Toggle Fullscreen mode. |
| **ENTER** | Confirm selection in menus. |
| **Arrow Keys / W S** | Navigate menu options. |

---

## 🎮 Creating a Mod (`pack.json`)

To create a custom mod, add a subfolder inside the `mods/` directory containing a `pack.json` file:

```json
{
  "id": "myCustomMod",
  "title": "My Special Mod",
  "author": "Your Name",
  "version": "1.0.0",
  "description": "Custom mod built for MoonEngine Web.",
  "icon": "assets/images/modIcon.png",
  "songs": [
    {
      "name": "Tutorial",
      "folder": "tutorial",
      "bpm": 100,
      "difficulties": ["easy", "normal", "hard"]
    }
  ],
  "overrides": {
    "assets/sounds/scrollMenu.ogg": "sounds/customScroll.ogg"
  }
}
```

---

## 👥 Credits & Author

- **Lead Developer:** [Brenninho123](https://github.com/Brenninho123)
- **Base Engine Concept:** Friday Night Funkin' (Funkin' Crew)
- **Discord Community:** [Join the Server](https://discord.gg/CEvNkkrgDX)

---

> *MoonEngine Web Edition — Crafted with focus on performance, modularity, and open modding.*
