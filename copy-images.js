const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\tienv\\.gemini\\antigravity-ide\\brain\\57099d5a-542c-4e52-85f3-9fa75da9ba81';
const destDir = path.join(__dirname, 'public', 'uploads');

const filesToCopy = {
    'web_design_trends_1789284368958.jpg': 'web_design_trends.jpg',
    'seo_optimization_1789284478048.jpg': 'seo_optimization.jpg',
    'ui_ux_design_1789284490862.jpg': 'ui_ux_design.jpg',
    'page_speed_1789284505597.jpg': 'page_speed.jpg',
    'astro_framework_1789284520623.jpg': 'astro_framework.jpg'
};

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

for (const [srcFile, destFile] of Object.entries(filesToCopy)) {
    const srcPath = path.join(sourceDir, srcFile);
    const destPath = path.join(destDir, destFile);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${destFile}`);
    } else {
        console.error(`Source not found: ${srcPath}`);
    }
}
