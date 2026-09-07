class MoonEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        this.lastTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;

        this.assets = {
            images: {},
            audio: {},
            json: {}
        };

        this.init();
    }

    init() {
        if (!this.gl) {
            console.error('WebGL is not supported in this browser environment.');
            return;
        }

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.gl.clearColor(0.02, 0.03, 0.06, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.setupInputs();
        this.loadInitialAssets().then(() => {
            this.startLoop();
        });
    }

    resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        if (this.gl) {
            this.gl.viewport(0, 0, width, height);
        }
    }

    setupInputs() {
        window.addEventListener('keydown', (e) => {
            this.handleInput(e.key, true);
        });

        window.addEventListener('keyup', (e) => {
            this.handleInput(e.key, false);
        });
    }

    handleInput(key, isPressed) {
        switch (key.toLowerCase()) {
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
        const iconPath = 'assets/images/iconMoon.png';
        await this.loadImage('iconMoon', iconPath).catch(() => {});
    }

    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.images[key] = img;
                resolve(img);
            };
            img.onerror = (err) => reject(err);
            img.src = src;
        });
    }

    startLoop() {
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
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
