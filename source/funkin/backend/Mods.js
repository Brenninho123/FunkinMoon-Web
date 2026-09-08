class Mods {
    static globalModsList = [];
    static loadedModsMap = new Map();
    static activeModId = null;

    static async fetchCommunityCatalog(catalogUrl = 'assets/data/mods-catalog.json') {
        try {
            const response = await fetch(catalogUrl);
            if (!response.ok) return [];

            const data = await response.json();
            Mods.globalModsList = Array.isArray(data.mods) ? data.mods : [];
            return Mods.globalModsList;
        } catch (e) {
            return [];
        }
    }

    static async loadModFromPackage(modId, packageUrl) {
        try {
            const response = await fetch(packageUrl);
            if (!response.ok) return false;

            const modManifest = await response.json();
            const modEntry = {
                id: modId,
                title: modManifest.title || modId,
                author: modManifest.author || 'Unknown',
                version: modManifest.version || '1.0.0',
                description: modManifest.description || '',
                banner: modManifest.banner || null,
                icon: modManifest.icon || null,
                songs: modManifest.songs || [],
                assets: modManifest.assets || {},
                scripts: modManifest.scripts || [],
                installedAt: Date.now()
            };

            Mods.loadedModsMap.set(modId, modEntry);

            if (typeof PolyMod !== 'undefined' && modManifest.polyModManifest) {
                await PolyMod.registerMod(modId, `${packageUrl}/mod.json`);
            }

            Mods.saveInstalledMods();
            return true;
        } catch (e) {
            return false;
        }
    }

    static setActiveMod(modId) {
        if (modId === null || Mods.loadedModsMap.has(modId)) {
            Mods.activeModId = modId;
            if (typeof Save !== 'undefined' && Save.setCustom) {
                Save.setCustom('activeCommunityMod', modId);
            }
            return true;
        }
        return false;
    }

    static getActiveMod() {
        return Mods.activeModId ? Mods.loadedModsMap.get(Mods.activeModId) : null;
    }

    static getInstalledMods() {
        return Array.from(Mods.loadedModsMap.values());
    }

    static saveInstalledMods() {
        if (typeof Save !== 'undefined' && Save.setCustom) {
            const modArray = Array.from(Mods.loadedModsMap.entries());
            Save.setCustom('installedCommunityMods', modArray);
        }
    }

    static loadSavedMods() {
        if (typeof Save !== 'undefined' && Save.getCustom) {
            const saved = Save.getCustom('installedCommunityMods');
            if (Array.isArray(saved)) {
                Mods.loadedModsMap = new Map(saved);
            }
            Mods.activeModId = Save.getCustom('activeCommunityMod') || null;
        }
    }

    static removeMod(modId) {
        if (Mods.loadedModsMap.has(modId)) {
            Mods.loadedModsMap.delete(modId);
            if (typeof PolyMod !== 'undefined') {
                PolyMod.unregisterMod(modId);
            }
            if (Mods.activeModId === modId) {
                Mods.activeModId = null;
            }
            Mods.saveInstalledMods();
            return true;
        }
        return false;
    }

    static resolveModAsset(assetPath) {
        const activeMod = Mods.getActiveMod();
        if (activeMod && activeMod.assets && activeMod.assets[assetPath]) {
            return activeMod.assets[assetPath];
        }

        if (typeof PolyMod !== 'undefined') {
            return PolyMod.resolvePath(assetPath);
        }

        return assetPath;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Mods;
}
