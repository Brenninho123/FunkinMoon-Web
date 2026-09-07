# Assets Overview — MoonEngine Web

Welcome to the **MoonEngine Web** assets repository! This guide provides the structure and specifications required to load custom songs, characters, stages, and scripts smoothly in the web engine.

---

## 📁 Web Asset Hierarchy

Ensure all assets are structured inside the `assets/` directory as shown below to allow the browser to resolve paths correctly:

```text
assets/
├── data/
│   ├── songs/
│   │   └── [song-name]/
│   │       ├── [song-name]-chart.json
│   │       └── events.json
│   └── credits.json
├── images/
│   ├── characters/
│   │   ├── [character-id].png
│   │   └── [character-id].xml
│   ├── UI/
│   │   ├── healthBar.png
│   │   └── noteSplashes.png
│   └── stages/
│       └── [stage-name]/
│           ├── bg.png
│           └── front.png
├── songs/
│   └── [song-name]/
│       ├── Inst.ogg
│       └── Voices.ogg
└── scripts/
    ├── custom_modules/
    └── stages/
        └── [stage-name].lua
```

---

## 🎨 Image & Texture Specifications

- **Format**: 24-bit PNG with transparent alpha channel.
- **Spritesheets**: Sparrow V2 XML (`.png` paired with `.xml`).
- **Web Texture Limits**: Keep total texture sizes under `4096x4096` pixels per sheet for optimal GPU rendering across desktop and mobile browsers.
- **Animation Naming**:
  - `idle`: Default character pose loop.
  - `singLEFT`, `singDOWN`, `singUP`, `singRIGHT`: Directional sing animations.
  - `missLEFT`, `missDOWN`, `missUP`, `missRIGHT`: Optional miss animations.

---

## 🎵 Audio Format Guidelines

- **Format**: `.ogg` (Vorbis codec) for best browser audio decoding performance and lower network payload.
- **Sample Rate**: `44,100 Hz` (16-bit).
- **Naming**:
  - `Inst.ogg` — Instrumental track.
  - `Voices.ogg` — Vocal track.

---

## 📊 Chart & Data Structure

- **Format**: `.json`
- Charts must follow standard FNF/MoonEngine JSON schemas containing note timings, speed, BPM, and camera targets.
- **Naming**: `[song-name]-chart.json`

---

## ⚙️ Scripting Support

- Custom stage events and character logic can be handled via Lua/Haxe scripts inside `assets/scripts/`.
- Available Web Callbacks:
  - `onCreate()`
  - `onCreatePost()`
  - `onUpdate(elapsed)`
  - `onBeatHit()`
  - `onStepHit()`

---

## ⚡ Web Optimization Best Practices

1. **Compression**: Compress all PNG assets using *TinyPNG* or *Pngquant* before deploying to reduce network request size.
2. **Audio Trimming**: Ensure silence is trimmed at the beginning of audio files to prevent desynchronization on web canvas.
3. **Memory Control**: Limit individual high-res background textures to avoid web browser memory spikes (`WebGL context lost`).
