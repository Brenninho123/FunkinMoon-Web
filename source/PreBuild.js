const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const OUTPUT_FILE = path.join(__dirname, '..', 'assets', 'assetsManifest.json');

function scanDirectory(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            scanDirectory(filePath, fileList);
        } else if (file !== 'assetsManifest.json') {
            const relativePath = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');
            fileList.push(relativePath);
        }
    });

    return fileList;
}

function generateManifest() {
    const assetFiles = scanDirectory(ASSETS_DIR);
    const manifestData = {
        generatedAt: new Date().toISOString(),
        totalAssets: assetFiles.length,
        assets: assetFiles
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifestData, null, 2));
}

generateManifest();
