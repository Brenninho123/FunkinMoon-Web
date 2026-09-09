class Main {
    constructor() {
        this.currentState = null;
        this.subState = null;
        this.persistentUpdate = true;
        this.persistentDraw = true;

        this.engineReady = false;
        this.lastTime = performance.now();
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.elapsed = 0;
        this.isFocused = true;

        this.debugDisplay = null;
        this.audioCache = new Map();
        this.imageCache = new Map();
        this.currentMusic = null;
        this.activeSounds = new Set();
        this.eventListeners = new Map();
        this.globalPlugins = new Map();

        this.conductor = {
            songPosition: 0,
            bpm: 100,
            crotchet: ((60 / 100) * 1000),
            stepCrochet: (((60 / 100) * 1000) / 4),
            lastSongPos: 0
        };

        this.keys = {
            pressed: new Set(),
            justPressed: new Set(),
            justReleased: new Set()
        };

        this.init();
    }

    init() {
        if (typeof Save !== 'undefined' && Save.init) {
            Save.init();
        }

        if (typeof Preferences !== 'undefined') {
            this.targetFPS = Preferences.get('fps') || 60;
            this.frameInterval = 1000 / this.targetFPS;
        }

        this.initModdingSystem();
        this.setupNativeAPIs();
        this.setupInputListeners();
        this.setupWindowListeners();
        this.setupResizeHandler();

        if (typeof FunkinDebugDisplay !== 'undefined') {
            this.debugDisplay = new FunkinDebugDisplay(this);
        }

        window.moonEngine = this;
        this.engineReady = true;

        requestAnimationFrame((time) => this.loop(time));
    }

    initModdingSystem() {
        if (typeof PolyMod !== 'undefined') {
            PolyMod.init();
        }

        if (typeof Mods !== 'undefined') {
            Mods.loadSavedMods();
            Mods.fetchCommunityCatalog();
        }
    }

    setupNativeAPIs() {
        if (typeof AndroidAPI !== 'undefined' && AndroidAPI.isAndroid) {
            AndroidAPI.setKeepScreenOn(true);
            AndroidAPI.registerBackButtonHandler(() => {
                this.handleGlobalInput('escape', true);
            });
        }

        if (typeof WinAPI !== 'undefined' && WinAPI.isWindows) {
            WinAPI.setWindowTitle('MoonEngine - Advanced Web Edition');
            WinAPI.setDarkModeHeader(true);
        }
    }

    setupInputListeners() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (!this.keys.pressed.has(key)) {
                this.keys.justPressed.add(key);
            }
            this.keys.pressed.add(key);

            if (e.key === 'F3' && this.debugDisplay) {
                this.debugDisplay.toggle();
            }

            if (e.key === 'F5') {
                e.preventDefault();
                this.reloadActiveMod();
            }

            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullScreen();
            }

            this.handleGlobalInput(e.key, true);
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys.pressed.delete(key);
            this.keys.justReleased.add(key);

            this.handleGlobalInput(e.key, false);
        });
    }

    setupWindowListeners() {
        window.addEventListener('blur', () => {
            this.isFocused = false;
            this.keys.pressed.clear();
            this.keys.justPressed.clear();
            this.keys.justReleased.clear();

            if (this.currentMusic && !this.currentMusic.paused) {
                this.currentMusic.pause();
                this.wasMusicPlayingOnBlur = true;
            }
        });

        window.addEventListener('focus', () => {
            this.isFocused = true;
            this.lastTime = performance.now();

            if (this.wasMusicPlayingOnBlur && this.currentMusic) {
                this.currentMusic.play().catch(() => {});
                this.wasMusicPlayingOnBlur = false;
            }
        });
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.emit('resize', { width: window.innerWidth, height: window.innerHeight });
        });
    }

    registerPlugin(id, pluginInstance) {
        if (!id || !pluginInstance) return false;
        if (typeof pluginInstance.init === 'function') {
            pluginInstance.init(this);
        }
        this.globalPlugins.set(id, pluginInstance);
        this.emit('pluginRegistered', id);
        return true;
    }

    unregisterPlugin(id) {
        if (!this.globalPlugins.has(id)) return false;
        const instance = this.globalPlugins.get(id);
        if (typeof instance.destroy === 'function') {
            instance.destroy();
        }
        this.globalPlugins.delete(id);
        this.emit('pluginUnregistered', id);
        return true;
    }

    getPlugin(id) {
        return this.globalPlugins.get(id) || null;
    }

    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            for (const callback of this.eventListeners.get(event)) {
                try {
                    callback(data);
                } catch (e) {}
            }
        }
    }

    handleGlobalInput(key, isPressed) {
        for (const [_, plugin] of this.globalPlugins) {
            if (typeof plugin.handleInput === 'function') {
                if (plugin.handleInput(key, isPressed)) return;
            }
        }

        if (this.subState && typeof this.subState.handleInput === 'function') {
            this.subState.handleInput(key, isPressed);
            return;
        }

        if (this.currentState && typeof this.currentState.handleInput === 'function') {
            this.currentState.handleInput(key, isPressed);
        }
    }

    reloadActiveMod() {
        if (typeof Mods !== 'undefined') {
            const active = Mods.getActiveMod();
            if (active) {
                Mods.loadModFromPackage(active.id, `mods/${active.id}/pack.json`).then(() => {
                    if (this.currentState && typeof this.currentState.create === 'function') {
                        this.currentState.create();
                    }
                    this.emit('modReloaded', active.id);
                });
            }
        }
    }

    getAssetPath(path) {
        if (typeof Mods !== 'undefined') {
            return Mods.resolveModAsset(path);
        }
        if (typeof PolyMod !== 'undefined') {
            return PolyMod.resolvePath(path);
        }
        return path;
    }

    switchState(newState) {
        if (!newState) return;

        if (this.subState) {
            this.closeSubState();
        }

        if (this.currentState && typeof this.currentState.destroy === 'function') {
            try {
                this.currentState.destroy();
            } catch (e) {}
        }

        this.currentState = newState;
        this.emit('stateChange', newState);

        if (this.currentState && typeof this.currentState.create === 'function') {
            try {
                this.currentState.create();
            } catch (e) {}
        }
    }

    openSubState(targetSubState) {
        if (!targetSubState) return;

        if (this.subState && typeof this.subState.destroy === 'function') {
            this.subState.destroy();
        }

        this.subState = targetSubState;
        this.emit('subStateOpen', targetSubState);

        if (this.subState && typeof this.subState.create === 'function') {
            this.subState.create();
        }
    }

    closeSubState() {
        if (!this.subState) return;

        if (typeof this.subState.destroy === 'function') {
            this.subState.destroy();
        }

        this.subState = null;
        this.emit('subStateClose');
    }

    setBPM(newBPM) {
        this.conductor.bpm = newBPM;
        this.conductor.crotchet = ((60 / newBPM) * 1000);
        this.conductor.stepCrochet = (this.conductor.crotchet / 4);

        if (typeof Conductor !== 'undefined') {
            Conductor.changeBPM(newBPM);
        }
        this.emit('bpmChange', newBPM);
    }

    updateConductor() {
        if (this.currentMusic && !this.currentMusic.paused) {
            this.conductor.songPosition = this.currentMusic.currentTime * 1000;
            if (typeof Conductor !== 'undefined') {
                Conductor.update(this.conductor.songPosition);
            }
        }
    }

    playSound(soundName, volume = 0.6) {
        let rawPath = typeof Paths !== 'undefined' ? Paths.sound(soundName) : `assets/sounds/${soundName}.ogg`;
        const soundPath = this.getAssetPath(rawPath);

        if (typeof FunkinSound !== 'undefined') {
            return FunkinSound.playOnce(soundName, volume);
        }

        try {
            const audio = new Audio(soundPath);
            audio.volume = volume;
            this.activeSounds.add(audio);

            audio.onended = () => {
                this.activeSounds.delete(audio);
            };

            audio.play().catch(() => {});
            return audio;
        } catch (e) {
            return null;
        }
    }

    playMusic(musicName, volume = 0.5, loop = true) {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic = null;
        }

        let rawPath = typeof Paths !== 'undefined' ? Paths.music(musicName) : `assets/music/${musicName}.ogg`;
        const musicPath = this.getAssetPath(rawPath);

        if (typeof FunkinSound !== 'undefined') {
            this.currentMusic = FunkinSound.playMusic(musicName, { volume, loop });
            return;
        }

        try {
            this.currentMusic = new Audio(musicPath);
            this.currentMusic.volume = volume;
            this.currentMusic.loop = loop;
            this.currentMusic.play().catch(() => {});
        } catch (e) {}
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic = null;
        }
    }

    toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        }
    }

    loop(currentTime) {
        requestAnimationFrame((time) => this.loop(time));

        const elapsed = currentTime - this.lastTime;

        if (elapsed >= this.frameInterval) {
            this.elapsed = Math.min(elapsed / 1000, 0.1);
            this.lastTime = currentTime - (elapsed % this.frameInterval);

            if (typeof Preferences !== 'undefined') {
                const target = Preferences.get('fps');
                if (target && target !== this.targetFPS) {
                    this.targetFPS = target;
                    this.frameInterval = 1000 / this.targetFPS;
                }
            }

            if (this.isFocused) {
                this.updateConductor();

                for (const [_, plugin] of this.globalPlugins) {
                    if (typeof plugin.update === 'function') {
                        plugin.update(this.elapsed);
                    }
                }

                if (this.subState) {
                    if (typeof this.subState.update === 'function') {
                        this.subState.update(this.elapsed);
                    }
                    if (this.persistentUpdate && this.currentState && typeof this.currentState.update === 'function') {
                        this.currentState.update(this.elapsed);
                    }
                } else if (this.currentState && typeof this.currentState.update === 'function') {
                    this.currentState.update(this.elapsed);
                }
            }

            this.keys.justPressed.clear();
            this.keys.justReleased.clear();

            if (this.debugDisplay) {
                this.debugDisplay.update();
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (typeof MoonProject !== 'undefined') {
        MoonProject.init();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Main;
}
