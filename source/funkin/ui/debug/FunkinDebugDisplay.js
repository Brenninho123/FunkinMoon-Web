class FunkinDebugDisplay {
    constructor(engine) {
        this.engine = engine;
        this.container = null;
        this.fpsText = null;
        this.memoryText = null;
        this.visible = true;

        this.frameCount = 0;
        this.lastTime = performance.now();
        this.currentFps = 0;

        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.id = 'funkin-debug-display';
        
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: '99999',
            pointerEvents: 'none',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#e0aaff',
            backgroundColor: 'rgba(3, 5, 10, 0.75)',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(157, 78, 221, 0.4)',
            backdropFilter: 'blur(4px)',
            webkitBackdropFilter: 'blur(4px)',
            lineHeight: '1.4',
            userSelect: 'none'
        });

        this.fpsText = document.createElement('div');
        this.fpsText.textContent = 'FPS: 0';
        this.container.appendChild(this.fpsText);

        this.memoryText = document.createElement('div');
        this.memoryText.style.fontSize = '10px';
        this.memoryText.style.color = '#9499c0';
        this.memoryText.textContent = 'MEM: 0 MB';
        this.container.appendChild(this.memoryText);

        document.body.appendChild(this.container);
    }

    update() {
        if (!this.visible) return;

        this.frameCount++;
        const now = performance.now();
        const delta = now - this.lastTime;

        if (delta >= 1000) {
            this.currentFps = Math.round((this.frameCount * 1000) / delta);
            this.frameCount = 0;
            this.lastTime = now;

            this.fpsText.textContent = `FPS: ${this.currentFps}`;

            if (this.currentFps >= 50) {
                this.fpsText.style.color = '#00f5d4';
            } else if (this.currentFps >= 30) {
                this.fpsText.style.color = '#ffb703';
            } else {
                this.fpsText.style.color = '#ff0055';
            }

            if (performance && performance.memory) {
                const usedMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
                this.memoryText.textContent = `MEM: ${usedMB} MB`;
            } else {
                this.memoryText.textContent = `MEM: N/A`;
            }
        }
    }

    toggle() {
        this.visible = !this.visible;
        this.container.style.display = this.visible ? 'block' : 'none';
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FunkinDebugDisplay;
}
