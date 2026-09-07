class Paths {
    static currentLevel = null;
    static cache = new Map();
    static localTrackedAssets = new Set();

    static setCurrentLevel(name) {
        Paths.currentLevel = name ? name.toLowerCase() : null;
    }

    static getPath(file, type = 'IMAGE', library = null) {
        if (library != null) {
            return `assets/${library}/${file}`;
        }
        if (Paths.currentLevel != null) {
            return `assets/${Paths.currentLevel}/${file}`;
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

    static txt(key, library = null) {
        return Paths.getPath(`data/${key}.txt`, 'TEXT', library);
    }

    static lua(key, library = null) {
        return Paths.getPath(`scripts/${key}.lua`, 'TEXT', library);
    }

    static sound(key, library = null) {
        return Paths.getPath(`sounds/${key}.ogg`, 'SOUND', library);
    }

    static music(key, library = null) {
        return Paths.getPath(`music/${key}.ogg`, 'MUSIC', library);
    }

    static font(key) {
        return `assets/fonts/${key}.ttf`;
    }

    static inst(song) {
        const cleanSong = song.toLowerCase().replace(/\s+/g, '-');
        return `assets/songs/${cleanSong}/Inst.ogg`;
    }

    static voices(song) {
        const cleanSong = song.toLowerCase().replace(/\s+/g, '-');
        return `assets/songs/${cleanSong}/Voices.ogg`;
    }

    static chart(song, difficulty = 'normal') {
        const cleanSong = song.toLowerCase().replace(/\s+/g, '-');
        const diff = difficulty.toLowerCase();
        const suffix = (diff === 'normal' || diff === '') ? '' : `-${diff}`;
        return `assets/songs/${cleanSong}/${cleanSong}${suffix}.json`;
    }

    static stage(key) {
        return `assets/stages/${key}.json`;
    }

    static character(key) {
        return `assets/characters/${key}.json`;
    }

    static freeplayBanner(song) {
        const cleanSong = song.toLowerCase().replace(/\s+/g, '-');
        return `assets/images/freeplay/banners/${cleanSong}.png`;
    }

    static icon(key) {
        return `assets/images/icons/icon-${key}.png`;
    }

    static mainMenu(key) {
        return `assets/images/mainmenu/${key}.png`;
    }

    static file(file, library = null) {
        return Paths.getPath(file, 'FILE', library);
    }

    static exists(path) {
        if (Paths.cache.has(path)) {
            return true;
        }
        return false;
    }

    static trackAsset(path, data) {
        Paths.cache.set(path, data);
        Paths.localTrackedAssets.add(path);
    }

    static clearCache() {
        Paths.cache.clear();
        Paths.localTrackedAssets.clear();
    }

    static clearUnusedMemory() {
        for (const [key, value] of Paths.cache.entries()) {
            if (!Paths.localTrackedAssets.has(key)) {
                Paths.cache.delete(key);
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Paths;
}
