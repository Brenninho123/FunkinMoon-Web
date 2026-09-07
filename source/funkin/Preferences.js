class Preferences {
    static defaults = {
        fps: 60
    };

    static data = { ...Preferences.defaults };

    static init() {
        this.load();
    }

    static load() {
        try {
            const savedData = localStorage.getItem('moon_engine_preferences');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.data = { ...this.defaults, ...parsed };
            }
        } catch (e) {
            this.data = { ...this.defaults };
        }
    }

    static save() {
        try {
            localStorage.setItem('moon_engine_preferences', JSON.stringify(this.data));
        } catch (e) {
        }
    }

    static get(key) {
        if (this.data.hasOwnProperty(key)) {
            return this.data[key];
        }
        return this.defaults[key];
    }

    static set(key, value) {
        this.data[key] = value;
        this.save();
    }

    static reset() {
        this.data = { ...this.defaults };
        this.save();
    }
}

Preferences.init();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Preferences;
}
