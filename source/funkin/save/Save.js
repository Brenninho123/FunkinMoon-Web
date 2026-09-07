class Save {
    static prefix = 'MoonEngine_';
    static data = {
        scores: {},
        accuracy: {},
        preferences: {},
        customData: {}
    };

    static init() {
        Save.load();
    }

    static save() {
        try {
            const serialized = JSON.stringify(Save.data);
            localStorage.setItem(`${Save.prefix}Data`, serialized);
        } catch (e) {
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(`${Save.prefix}Data`);
            if (raw) {
                const parsed = JSON.parse(raw);
                Save.data = Object.assign(Save.data, parsed);
            }
        } catch (e) {
        }
    }

    static setSongScore(songKey, difficulty, score, accuracy = 0) {
        const key = `${songKey.toLowerCase()}_${difficulty.toLowerCase()}`;
        
        if (!Save.data.scores[key] || Save.data.scores[key] < score) {
            Save.data.scores[key] = score;
            Save.data.accuracy[key] = accuracy;
            Save.save();
        }
    }

    static getSongScore(songKey, difficulty) {
        const key = `${songKey.toLowerCase()}_${difficulty.toLowerCase()}`;
        return Save.data.scores[key] || 0;
    }

    static getSongAccuracy(songKey, difficulty) {
        const key = `${songKey.toLowerCase()}_${difficulty.toLowerCase()}`;
        return Save.data.accuracy[key] || 0.0;
    }

    static setPreference(key, value) {
        Save.data.preferences[key] = value;
        Save.save();
    }

    static getPreference(key, defaultValue = null) {
        if (Save.data.preferences[key] !== undefined) {
            return Save.data.preferences[key];
        }
        return defaultValue;
    }

    static setCustom(key, value) {
        Save.data.customData[key] = value;
        Save.save();
    }

    static getCustom(key, defaultValue = null) {
        if (Save.data.customData[key] !== undefined) {
            return Save.data.customData[key];
        }
        return defaultValue;
    }

    static reset() {
        Save.data = {
            scores: {},
            accuracy: {},
            preferences: {},
            customData: {}
        };
        try {
            localStorage.removeItem(`${Save.prefix}Data`);
        } catch (e) {
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Save;
}
