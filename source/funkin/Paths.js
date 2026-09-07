class Paths {
    static get SOUND_EXT() {
        return 'ogg';
    }

    static get IMAGE_EXT() {
        return 'png';
    }

    static file(path) {
        return `assets/${path}`;
    }

    static txt(key) {
        return this.file(`data/${key}.txt`);
    }

    static xml(key) {
        return this.file(`images/${key}.xml`);
    }

    static json(key) {
        return this.file(`data/${key}.json`);
    }

    static shaderFragment(key) {
        return this.file(`shaders/${key}.frag`);
    }

    static shaderVertex(key) {
        return this.file(`shaders/${key}.vert`);
    }

    static lua(key) {
        return this.file(`scripts/${key}.lua`);
    }

    static sound(key) {
        return this.file(`sounds/${key}.${this.SOUND_EXT}`);
    }

    static soundRandom(key, min, max) {
        const randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
        return this.sound(`${key}${randomIndex}`);
    }

    static music(key) {
        return this.file(`music/${key}.${this.SOUND_EXT}`);
    }

    static image(key) {
        return this.file(`images/${key}.${this.IMAGE_EXT}`);
    }

    static font(key) {
        return this.file(`fonts/${key}`);
    }

    static getSparrowAtlas(key) {
        return {
            image: this.image(key),
            xml: this.xml(key)
        };
    }

    static character(key) {
        return {
            image: this.image(`characters/${key}`),
            xml: this.xml(`characters/${key}`)
        };
    }

    static stage(key) {
        return this.file(`stages/${key}`);
    }

    static inst(song) {
        const formattedSong = song.toLowerCase().replace(/\s+/g, '-');
        return this.file(`songs/${formattedSong}/Inst.${this.SOUND_EXT}`);
    }

    static voices(song) {
        const formattedSong = song.toLowerCase().replace(/\s+/g, '-');
        return this.file(`songs/${formattedSong}/Voices.${this.SOUND_EXT}`);
    }

    static chart(song, jsonName = null) {
        const formattedSong = song.toLowerCase().replace(/\s+/g, '-');
        const fileName = jsonName ? jsonName : `${formattedSong}-chart`;
        return this.file(`data/songs/${formattedSong}/${fileName}.json`);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Paths;
}
