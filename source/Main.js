class MoonEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas ? (this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')) : null;

        this.lastTime = performance.now();
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.isRunning = false;

        this.currentState = null;
        this.debugDisplay = null;

        this.assets = {
            images: new Map(),
            audio: new Map(),
            json: new Map()
        };

        this.audioCache = new Map();
        this.keysPressed = new Set();
        this.touchActive = false;

        this.init();
    }

    init() {
        if (!this.canvas) return;

        if (typeof Save !== 'undefined') {
            Save.init();
        }

        if (typeof Preferences !== 'undefined') {
            Preferences.init();
        }

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        if (this.gl) {
            this.gl.clearColor(0.02, 0.03, 0.06, 1.0);
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        }

        this.setupInputs();
        this.setupDebugDisplay();
        this.preloadCoreAudio();

        this.loadInitialAssets().then(() => {
            this.isRunning = true;
            if (typeof PlayState !== 'undefined') {
                this.switchState(new PlayState(this));
            }
            this.startLoop();
        });
    }

    setupDebugDisplay() {
        if (typeof FunkinDebugDisplay !== 'undefined') {
            this.debugDisplay = new FunkinDebugDisplay(this);
        }
    }

    preloadCoreAudio() {
        const sounds = ['scrollMenu', 'confirmMenu'];
        sounds.forEach(name => {
            const path = typeof Paths !== 'undefined' ? Paths.sound(name) : `assets/sounds/${name}.ogg`;
            const audio = new Audio(path);
            audio.preload = 'auto';
            this.audioCache.set(name, path);
        });
    }

    playSound(soundName, volume = 0.6) {
        const path = this.audioCache.get(soundName) || (typeof Paths !== 'undefined' ? Paths.sound(soundName) : `assets/sounds/${soundName}.ogg`);
        const audio = new Audio(path);
        audio.volume = volume;
        audio.play().catch(() => {});
    }

    switchState(newState) {
        if (this.currentState && typeof this.currentState.destroy === 'function') {
            this.currentState.destroy();
        }

        this.currentState = newState;

        if (this.currentState && typeof this.currentState.create === 'function') {
            this.currentState.create();
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const displayWidth = this.canvas.clientWidth || window.innerWidth;
        const displayHeight = this.canvas.clientHeight || window.innerHeight;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            if (this.gl) {
                this.gl.viewport(0, 0, displayWidth, displayHeight);
            }
        }
    }

    setupInputs() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();

            if (e.key === 'F3') {
                e.preventDefault();
                if (this.debugDisplay) {
                    this.debugDisplay.toggle();
                }
            }

            if (!e.repeat) {
                this.keysPressed.add(key);
                this.handleInput(key, true);
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keysPressed.delete(key);
            this.handleInput(key, false);
        });

        if (this.canvas) {
            this.canvas.addEventListener('touchstart', (e) => {
                this.touchActive = true;
                this.handleTouch(e, 'start');
            }, { passive: true });

            this.canvas.addEventListener('touchend', (e) => {
                this.touchActive = false;
                this.handleTouch(e, 'end');
            }, { passive: true });
        }
    }

    handleInput(key, isPressed) {
        if (this.currentState && typeof this.currentState.handleInput === 'function') {
            this.currentState.handleInput(key, isPressed);
        }
    }

    handleTouch(event, type) {
        if (this.currentState && typeof this.currentState.handleTouch === 'function') {
            this.currentState.handleTouch(event, type);
        }
    }

    async loadInitialAssets() {
        const iconPath = typeof Paths !== 'undefined' ? Paths.image('iconMoon') : 'assets/images/iconMoon.png';
        await this.loadImage('iconMoon', iconPath).catch(() => {});
    }

    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.images.set(key, img);
                resolve(img);
            };
            img.onerror = (err) => reject(err);
            img.src = src;
        });
    }

    startLoop() {
        this.lastTime = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        const targetFps = typeof Preferences !== 'undefined' ? Preferences.get('fps') : 60;
        const frameInterval = 1000 / targetFps;
        const elapsed = timestamp - this.lastTime;

        if (elapsed >= frameInterval) {
            const deltaTime = Math.min(elapsed / 1000, 0.1);
            this.lastTime = timestamp - (elapsed % frameInterval);

            this.calculateFPS(deltaTime);
            this.update(deltaTime);
            this.render();
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    calculateFPS(deltaTime) {
        this.fpsTimer += deltaTime;
        this.frameCount++;

        if (this.fpsTimer >= 1.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer -= 1.0;
        }
    }

    update(dt) {
        if (this.currentState && typeof this.currentState.update === 'function') {
            this.currentState.update(dt);
        }

        if (this.debugDisplay) {
            this.debugDisplay.update();
        }
    }

    render() {
        if (!this.gl) return;

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        if (this.currentState && typeof this.currentState.render === 'function') {
            this.currentState.render(this.gl);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.moonEngine = new MoonEngine('gameCanvas');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoonEngine;
}