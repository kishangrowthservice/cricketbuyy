const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderLogo() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const svgPath = path.resolve(__dirname, '../public/logo.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; background: transparent; display: flex; align-items: center; justify-content: center;">
        <div id="logo-container" style="display: inline-block;">
          ${svgContent}
        </div>
      </body>
    </html>
  `);

  const element = await page.$('#logo-container svg');
  if (element) {
    const pngPath = path.resolve(__dirname, '../public/logo.png');
    await element.screenshot({ path: pngPath, omitBackground: true });
    console.log('Successfully generated public/logo.png from SVG!');
  }

  await browser.close();
}

renderLogo().catch(err => {
  console.error('Error generating logo PNG:', err);
  process.exit(1);
});

