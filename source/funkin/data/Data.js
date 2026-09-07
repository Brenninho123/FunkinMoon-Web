class Data {
    static cache = new Map();

    static async loadJSON(key, library = null) {
        const path = typeof Paths !== 'undefined' ? Paths.json(key, library) : `assets/data/${key}.json`;
        if (Data.cache.has(path)) {
            return Data.cache.get(path);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) return null;
            const json = await response.json();
            Data.cache.set(path, json);
            return json;
        } catch (e) {
            return null;
        }
    }

    static async loadXML(key, library = null) {
        const path = typeof Paths !== 'undefined' ? Paths.xml(key, library) : `assets/images/${key}.xml`;
        if (Data.cache.has(path)) {
            return Data.cache.get(path);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) return null;
            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            Data.cache.set(path, xmlDoc);
            return xmlDoc;
        } catch (e) {
            return null;
        }
    }

    static async loadChart(songName, difficulty = 'normal') {
        const path = typeof Paths !== 'undefined' ? Paths.chart(songName, difficulty) : `assets/songs/${songName.toLowerCase()}/${songName.toLowerCase()}.json`;
        if (Data.cache.has(path)) {
            return Data.cache.get(path);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) return null;
            const chartData = await response.json();
            Data.cache.set(path, chartData);
            return chartData;
        } catch (e) {
            return null;
        }
    }

    static parseAtlasXml(xmlDoc) {
        if (!xmlDoc) return [];
        const subtextures = xmlDoc.getElementsByTagName('SubTexture');
        const frames = [];

        for (let i = 0; i < subtextures.length; i++) {
            const node = subtextures[i];
            frames.push({
                name: node.getAttribute('name'),
                x: parseInt(node.getAttribute('x') || '0', 10),
                y: parseInt(node.getAttribute('y') || '0', 10),
                width: parseInt(node.getAttribute('width') || '0', 10),
                height: parseInt(node.getAttribute('height') || '0', 10),
                frameX: parseInt(node.getAttribute('frameX') || '0', 10),
                frameY: parseInt(node.getAttribute('frameY') || '0', 10),
                frameWidth: parseInt(node.getAttribute('frameWidth') || '0', 10),
                frameHeight: parseInt(node.getAttribute('frameHeight') || '0', 10)
            });
        }

        return frames;
    }

    static clearCache() {
        Data.cache.clear();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Data;
}
