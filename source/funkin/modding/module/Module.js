class Module {
    constructor(id, scriptPath = '') {
        this.id = id;
        this.scriptPath = scriptPath;
        this.active = true;
        this.listeners = new Map();
        this.variables = new Map();
    }

    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(callback);
    }

    off(eventName, callback) {
        if (!this.listeners.has(eventName)) return;
        const callbacks = this.listeners.get(eventName);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    trigger(eventName, ...args) {
        if (!this.active) return;
        if (this.listeners.has(eventName)) {
            const callbacks = this.listeners.get(eventName);
            for (let i = 0; i < callbacks.length; i++) {
                try {
                    callbacks[i](...args);
                } catch (e) {
                }
            }
        }
    }

    setVar(name, value) {
        this.variables.set(name, value);
    }

    getVar(name, defaultValue = null) {
        return this.variables.has(name) ? this.variables.get(name) : defaultValue;
    }

    enable() {
        this.active = true;
    }

    disable() {
        this.active = false;
    }

    destroy() {
        this.listeners.clear();
        this.variables.clear();
        this.active = false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Module;
}
