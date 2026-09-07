const projectConfig = {
    name: 'MoonEngine',
    version: '1.2.0-web',
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
        'source/funkin/online/Online.js',
        'source/funkin/api/discord/DiscordLogin.js',
        'source/funkin/api/youtube/YoutubeChannels.js',
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
        songs: 'assets/songs/'
    }
};

class MoonProject {
    static get config() {
        return projectConfig;
    }

    static init() {
        if (typeof Save !== 'undefined') {
            Save.init();
        }
    }

    static loadScriptSequence(callback) {
        let loaded = 0;
        const total = projectConfig.scripts.length;

        projectConfig.scripts.forEach((src) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false;
            script.onload = () => {
                loaded++;
                if (loaded === total && typeof callback === 'function') {
                    callback();
                }
            };
            document.head.appendChild(script);
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoonProject;
}
