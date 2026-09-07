const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONFIG = {
    assetsDir: path.join(__dirname, 'assets'),
    sourceDir: path.join(__dirname, 'source'),
    outputManifest: path.join(__dirname, 'assets-manifest.json'),
    swFile: path.join(__dirname, 'sw.js'),
    versionFile: path.join(__dirname, 'source/funkin/Version.js'),
    validExtensions: ['.png', '.ogg', '.json', '.xml', '.js', '.css', '.html', '.ttf'],
    ignoredPaths: ['node_modules', '.git', '.vscode', 'PreBuild.js']
};

class PreBuildPipeline {
    constructor() {
        this.buildVersion = this.generateVersionString();
        this.timestamp = Date.now();
        this.manifestData = {
            version: this.buildVersion,
            timestamp: this.timestamp,
            assets: [],
            hash: ''
        };
    }

    generateVersionString() {
        const date = new Date();
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const rev = String(Math.floor(Date.now() / 1000) % 10000).padStart(4, '0');
        return `${year}.${month}.${day}-${rev}`;
    }

    getFileHash(filePath) {
        const buffer = fs.readFileSync(filePath);
        return crypto.createHash('md5').update(buffer).digest('hex');
    }

    walkDirectory(dirPath, fileList = []) {
        if (!fs.existsSync(dirPath)) return fileList;

        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
            const fullPath = path.join(dirPath, file);
            const relativePath = path.relative(__dirname, fullPath).replace(/\\/g, '/');

            if (CONFIG.ignoredPaths.some(ignored => relativePath.includes(ignored))) {
                return;
            }

            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                this.walkDirectory(fullPath, fileList);
            } else {
                const ext = path.extname(fullPath).toLowerCase();
                if (CONFIG.validExtensions.includes(ext)) {
                    fileList.push({
                        path: `./${relativePath}`,
                        size: stat.size,
                        hash: this.getFileHash(fullPath)
                    });
                }
            }
        });

        return fileList;
    }

    generateManifest() {
        const assetFiles = this.walkDirectory(CONFIG.assetsDir);
        const sourceFiles = this.walkDirectory(CONFIG.sourceDir);

        const rootFiles = [
            'index.html',
            'manifest.json',
            'project.js'
        ].filter(f => fs.existsSync(path.join(__dirname, f)))
         .map(f => ({
             path: `./${f}`,
             size: fs.statSync(path.join(__dirname, f)).size,
             hash: this.getFileHash(path.join(__dirname, f))
         }));

        const allEntries = [...rootFiles, ...assetFiles, ...sourceFiles];
        
        const overallHash = crypto.createHash('md5')
            .update(allEntries.map(e => e.hash).join(''))
            .digest('hex');

        this.manifestData.assets = allEntries;
        this.manifestData.hash = overallHash;

        fs.writeFileSync(
            CONFIG.outputManifest,
            JSON.stringify(this.manifestData, null, 2),
            'utf8'
        );
    }

    updateServiceWorker() {
        if (!fs.existsSync(CONFIG.swFile)) return;

        let content = fs.readFileSync(CONFIG.swFile, 'utf8');

        content = content.replace(
            /const APP_VERSION = ['"`].*?['"`];/,
            `const APP_VERSION = '${this.buildVersion}';`
        );

        const formattedAssetsList = JSON.stringify(
            this.manifestData.assets.map(a => a.path),
            null,
            4
        );

        content = content.replace(
            /const CORE_ASSETS = \[[\s\S]*?\];/,
            `const CORE_ASSETS = ${formattedAssetsList};`
        );

        fs.writeFileSync(CONFIG.swFile, content, 'utf8');
    }

    updateVersionClass() {
        const versionDir = path.dirname(CONFIG.versionFile);
        if (!fs.existsSync(versionDir)) {
            fs.mkdirSync(versionDir, { recursive: true });
        }

        const classContent = `class Version {\n` +
            `    static get build() {\n` +
            `        return '${this.buildVersion}';\n` +
            `    }\n\n` +
            `    static get timestamp() {\n` +
            `        return ${this.timestamp};\n` +
            `    }\n\n` +
            `    static get hash() {\n` +
            `        return '${this.manifestData.hash}';\n` +
            `    }\n` +
            `}\n\n` +
            `if (typeof module !== 'undefined' && module.exports) {\n` +
            `    module.exports = Version;\n` +
            `}\n`;

        fs.writeFileSync(CONFIG.versionFile, classContent, 'utf8');
    }

    execute() {
        this.generateManifest();
        this.updateServiceWorker();
        this.updateVersionClass();
    }
}

new PreBuildPipeline().execute();
