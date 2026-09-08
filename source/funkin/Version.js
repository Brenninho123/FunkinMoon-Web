class Version {
    static MAJOR = 1;
    static MINOR = 3;
    static PATCH = 0;
    static SUFFIX = 'web';
    static BUILD_NUMBER = 1042;
    static ENGINE_NAME = 'MoonEngine';

    static CHANGELOG = [
        'v1.3.0-web: Integrated FunkinSound, Conductor & AudioContext Auto-Recovery.',
        'v1.2.0-web: Enhanced FreeplayState UI with dynamic score lerping & banner previews.',
        'v1.1.0-web: ServiceWorker v12 with byte-range WebAudio streaming and IndexedDB support.',
        'v1.0.0-web: Core modular engine architecture release.'
    ];

    static get string() {
        const base = `${Version.MAJOR}.${Version.MINOR}.${Version.PATCH}`;
        return Version.SUFFIX ? `${base}-${Version.SUFFIX}` : base;
    }

    static get fullDetails() {
        return `${Version.ENGINE_NAME} v${Version.string} (Build ${Version.BUILD_NUMBER})`;
    }

    static parse(versionString) {
        if (!versionString || typeof versionString !== 'string') return null;
        
        const cleanStr = versionString.replace(/^v/i, '').trim();
        const parts = cleanStr.split('-');
        const numbers = parts[0].split('.').map(n => parseInt(n, 10));

        return {
            major: numbers[0] || 0,
            minor: numbers[1] || 0,
            patch: numbers[2] || 0,
            suffix: parts[1] || ''
        };
    }

    static isCompatible(targetVersionString) {
        const target = Version.parse(targetVersionString);
        if (!target) return false;
        
        return target.major === Version.MAJOR && target.minor <= Version.MINOR;
    }

    static compare(versionA, versionB) {
        const a = Version.parse(versionA);
        const b = Version.parse(versionB);

        if (!a || !b) return 0;

        if (a.major !== b.major) return a.major > b.major ? 1 : -1;
        if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
        if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;

        return 0;
    }

    static getLatestChangelog() {
        return Version.CHANGELOG[0] || 'No changelog available.';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Version;
}
