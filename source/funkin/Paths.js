class Paths {
    static currentLevel = null;
    static cache = new Map();

    static setCurrentLevel(name) {
        Paths.currentLevel = name.toLowerCase();
    }

    static getPath(file, type = 'IMAGE', library = null) {
        if (library != null) {
            return `assets/${library}/${file}`;
        }

        if (Paths.currentLevel != null) {
            const levelPath = `assets/${Paths.currentLevel}/${file}`;
            return levelPath;
        }

        return `assets/${file}`;
    }

    static image(key, library = null) {
        return Paths.getPath(`images/${key}.png`, 'IMAGE', library);
    }

    static xml(key, library = null) {
        return Paths.getPath(`images/${key}.xml`, 'TEXT', library);
    }

    static json(key, library = null) {
        return Paths.getPath(`data/${key}.json`, 'TEXT', library);
    }

    static sound(key, library = null) {
        return Paths.getPath(`sounds/${key}.ogg`, 'SOUND', library);
    }

    static music(key, library = null) {
        return Paths.getPath(`music/${key}.ogg`, 'MUSIC', library);
    }

    static inst(song) {
        return `assets/songs/${song.toLowerCase()}/Inst.ogg`;
    }

    static voices(song) {
        return `assets/songs/${song.toLowerCase()}/Voices.ogg`;
    }

    static chart(song, difficulty = 'normal') {
        const suff = difficulty.toLowerCase() === 'normal' ? '' : `-${difficulty.toLowerCase()}`;
        return `assets/songs/${song.toLowerCase()}/${song.toLowerCase()}${suff}.json`;
    }

    static mainMenu(key) {
        return `assets/images/mainmenu/${key}.png`;
    }

    static font(key) {
        return `assets/fonts/${key}.ttf`;
    }

    static clearCache() {
        Paths.cache.clear();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Paths;
}
