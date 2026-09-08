class PolyMod {
    static activeMods = new Map();
    static modOrder = [];

    static init() {
        PolyMod.activeMods.clear();
        PolyMod.modOrder = [];
    }

    static async registerMod(modId, manifestUrl) {
        try {
            const response = await fetch(manifestUrl);
            if (!response.ok) return false;

            const manifest = await response.json();
            const modData = {
                id: modId,
                name: manifest.name || modId,
                version: manifest.version || '1.0.0',
                description: manifest.description || '',
                rootPath: manifestUrl.substring(0, manifestUrl.lastIndexOf('/')),
                overrides: manifest.overrides || {}
            };

            PolyMod.activeMods.set(modId, modData);
            if (!PolyMod.modOrder.includes(modId)) {
                PolyMod.modOrder.push(modId);
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    static unregisterMod(modId) {
        PolyMod.activeMods.delete(modId);
        const index = PolyMod.modOrder.indexOf(modId);
        if (index !== -1) {
            PolyMod.modOrder.splice(index, 1);
        }
    }

    static resolvePath(originalPath) {
        for (let i = PolyMod.modOrder.length - 1; i >= 0; i--) {
            const modId = PolyMod.modOrder[i];
            const mod = PolyMod.activeMods.get(modId);
            if (mod && mod.overrides && mod.overrides[originalPath]) {
                return `${mod.rootPath}/${mod.overrides[originalPath]}`;
            }
        }
        return originalPath;
    }

    static getActiveMods() {
        return PolyMod.modOrder.map(id => PolyMod.activeMods.get(id));
    }

    static clearMods() {
        PolyMod.activeMods.clear();
        PolyMod.modOrder = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PolyMod;
}
