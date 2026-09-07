class MoonEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        this.lastTime = performance.now();
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.isRunning = false;

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

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.gl.clearColor(0.02, 0.03, 0.06, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.setupInputs();
        this.loadInitialAssets().then(() => {
            this.isRunning = true;
            this.startLoop();
        });
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
            if (!e.repeat) {
                this.keysPressed.add(e.key.toLowerCase());
                this.handleInput(e.key.toLowerCase(), true);
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keysPressed.delete(e.key.toLowerCase());
            this.handleInput(e.key.toLowerCase(), false);
        });
    }

    handleInput(key, isPressed) {
        switch (key) {
            case 'a':
            case 'arrowleft':
                break;
            case 's':
            case 'arrowdown':
                break;
            case 'w':
            case 'arrowup':
                break;
            case 'd':
            case 'arrowright':
                break;
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

        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.calculateFPS(deltaTime);
        this.update(deltaTime);
        this.render();

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
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.moonEngine = new MoonEngine('gameCanvas');
});
