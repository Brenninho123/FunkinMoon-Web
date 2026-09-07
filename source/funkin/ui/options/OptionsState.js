class OptionsState {
    constructor(engine) {
        this.engine = engine;
        this.options = [
            { key: 'fps', name: 'FPS Limit', type: 'number', min: 30, max: 240, step: 30 }
        ];
        this.selectedIndex = 0;
        this.isActive = false;
    }

    create() {
        this.isActive = true;
        this.selectedIndex = 0;
    }

    handleInput(key, isPressed) {
        if (!isPressed || !this.isActive) return;

        switch (key) {
            case 'w':
            case 'arrowup':
                this.changeSelection(-1);
                break;
            case 's':
            case 'arrowdown':
                this.changeSelection(1);
                break;
            case 'a':
            case 'arrowleft':
                this.adjustOption(-1);
                break;
            case 'd':
            case 'arrowright':
                this.adjustOption(1);
                break;
            case 'escape':
            case 'backspace':
                this.close();
                break;
        }
    }

    changeSelection(change) {
        this.selectedIndex += change;
        if (this.selectedIndex < 0) {
            this.selectedIndex = this.options.length - 1;
        } else if (this.selectedIndex >= this.options.length) {
            this.selectedIndex = 0;
        }
    }

    adjustOption(direction) {
        const option = this.options[this.selectedIndex];
        if (!option) return;

        if (option.type === 'number') {
            let currentValue = Preferences.get(option.key);
            let newValue = currentValue + (direction * option.step);

            if (newValue < option.min) newValue = option.min;
            if (newValue > option.max) newValue = option.max;

            Preferences.set(option.key, newValue);
        }
    }

    close() {
        this.isActive = false;
    }

    update(elapsed) {
    }

    render(gl) {
    }

    destroy() {
        this.isActive = false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptionsState;
}
