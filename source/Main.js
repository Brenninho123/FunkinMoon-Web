class Main {
    constructor() {
        this.currentState = null;
        this.nextState = null;
        this.engineReady = false;

        this.lastTime = performance.now();
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;

        this.debugDisplay = null;
        this.audioCache = new Map();
        this.currentMusic = null;

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

        if (typeof PolyMod !== 'undefined') {
            PolyMod.init();
        }

        this.setupNativeAPIs();
        this.setupInputListeners();

        if (typeof FunkinDebugDisplay !== 'undefined') {
            this.debugDisplay = new FunkinDebugDisplay(this);
        }

        window.moonEngine = this;
        this.engineReady = true;

        this.loop(performance.now());
    }

    setupNativeAPIs() {
        if (typeof AndroidAPI !== 'undefined' && AndroidAPI.isAndroid) {
            AndroidAPI.setKeepScreenOn(true);
            AndroidAPI.registerBackButtonHandler(() => {
                if (this.currentState && typeof this.currentState.handleInput === 'function') {
                    this.currentState.handleInput('escape', true);
                }
            });
        }

        if (typeof WinAPI !== 'undefined' && WinAPI.isWindows) {
            WinAPI.setWindowTitle('MoonEngine - Web Edition');
            WinAPI.setDarkModeHeader(true);
        }
    }

    setupInputListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F3' && this.debugDisplay) {
                this.debugDisplay.toggle();
            }

            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullScreen();
            }

            if (this.currentState && typeof this.currentState.handleInput === 'function') {
                this.currentState.handleInput(e.key, true);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.currentState && typeof this.currentState.handleInput === 'function') {
                this.currentState.handleInput(e.key, false);
            }
        });
    }

    switchState(newState) {
        if (!newState) return;

        if (this.currentState && typeof this.currentState.destroy === 'function') {
            this.currentState.destroy();
        }

        this.currentState = newState;

        if (this.currentState && typeof this.currentState.create === 'function') {
            this.currentState.create();
        }
    }

    playSound(soundName, volume = 0.6) {
        const soundPath = typeof Paths !== 'undefined' ? Paths.sound(soundName) : `assets/sounds/${soundName}.ogg`;
        
        try {
            const audio = new Audio(soundPath);
            audio.volume = volume;
            audio.play().catch(() => {});
        } catch (e) {
        }
    }

    playMusic(musicName, volume = 0.5, loop = true) {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic = null;
        }

        const musicPath = typeof Paths !== 'undefined' ? Paths.music(musicName) : `assets/music/${musicName}.ogg`;

        try {
            this.currentMusic = new Audio(musicPath);
            this.currentMusic.volume = volume;
            this.currentMusic.loop = loop;
            this.currentMusic.play().catch(() => {});
        } catch (e) {
        }
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
            const dt = elapsed / 1000;
            this.lastTime = currentTime - (elapsed % this.frameInterval);

            if (typeof Preferences !== 'undefined') {
                const target = Preferences.get('fps');
                if (target && target !== this.targetFPS) {
                    this.targetFPS = target;
                    this.frameInterval = 1000 / this.targetFPS;
                }
            }

            if (this.currentState && typeof this.currentState.update === 'function') {
                this.currentState.update(dt);
            }

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
