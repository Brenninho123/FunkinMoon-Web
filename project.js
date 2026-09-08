const projectConfig = {
    name: 'MoonEngine',
    version: '1.4.0-web',
    author: 'Brenninho123',
    repository: 'https://github.com/Brenninho123/Funkin-Moon',
    discordServer: 'https://discord.gg/CEvNkkrgDX',

    targetFPS: 60,
    webglOptions: {
        alpha: true,
        antialias: true,
        depth: true,
        stencil: false,
        preserveDrawingBuffer: false
    },

    scripts: [
        'source/funkin/Version.js',
        'source/funkin/Preferences.js',
        'source/funkin/save/Save.js',
        'source/funkin/Paths.js',
        'source/funkin/data/Data.js',
        'source/funkin/audio/FunkinSound.js',
        'source/funkin/backend/Conductor.js',
        'source/funkin/backend/Mods.js',
        'source/funkin/online/Online.js',
        'source/funkin/api/discord/DiscordLogin.js',
        'source/funkin/api/youtube/YoutubeChannels.js',
        'source/funkin/external/android/AndroidAPI.js',
        'source/funkin/external/windows/WinAPI.js',
        'source/funkin/modding/PolyMod.js',
        'source/funkin/modding/module/Module.js',
        'source/funkin/ui/community/CommunityMenu.js',
        'source/funkin/ui/options/OptionsState.js',
        'source/funkin/ui/debug/FunkinDebugDisplay.js',
        'source/funkin/ui/freeplay/FreeplayState.js',
        'source/funkin/play/PlayState.js',
        'source/Main.js'
    ],

    assets: {
        images: 'assets/images/',
        sounds: 'assets/sounds/',
        music: 'assets/music/',
        fonts: 'assets/fonts/',
        songs: 'assets/songs/',
        stages: 'assets/stages/',
        characters: 'assets/characters/',
        mods: 'mods/'
    }
};

class MoonProject {
    static get config() {
        return projectConfig;
    }

    static init() {
        if (typeof Save !== 'undefined' && Save.init) {
            Save.init();
        }
    }

    static loadScriptSequence(callback, onProgress) {
        let loaded = 0;
        const scripts = projectConfig.scripts;
        const total = scripts.length;

        if (total === 0) {
            if (typeof callback === 'function') callback();
            return;
        }

        const loadNext = (index) => {
            if (index >= total) {
                if (typeof callback === 'function') callback();
                return;
            }

            const script = document.createElement('script');
            script.src = scripts[index];
            script.async = false;

            script.onload = () => {
                loaded++;
                if (typeof onProgress === 'function') {
                    onProgress(loaded, total, scripts[index]);
                }
                loadNext(index + 1);
            };

            script.onerror = (err) => {
                console.error(`[MoonEngine] Erro ao carregar script: ${scripts[index]}`, err);
                loadNext(index + 1);
            };

            document.head.appendChild(script);
        };

        loadNext(0);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoonProject;
}
