class MoonEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

        this.lastTime = performance.now();
        this.accumulator = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.isRunning = false;

        this.currentState = null;

        this.assets = {
            images: new Map(),
            audio: new Map(),
            json: new Map()
        };

        this.keysPressed = new Set();
        this.init();
    }

    init() {
        if (!this.gl) {
            return;
        }

        if (typeof Preferences !== 'undefined') {
            Preferences.init();
        }

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.gl.clearColor(0.02, 0.03, 0.06, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.setupInputs();
        
        this.loadInitialAssets().then(() => {
            this.isRunning = true;
            if (typeof PlayState !== 'undefined') {
                this.switchState(new PlayState(this));
            }
            this.startLoop();
        });
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
    }

    handleInput(key, isPressed) {
        if (this.currentState && typeof this.currentState.handleInput === 'function') {
            this.currentState.handleInput(key, isPressed);
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
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        if (this.currentState && typeof this.currentState.render === 'function') {
            this.currentState.render(this.gl);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.moonEngine = new MoonEngine('gameCanvas');
});
