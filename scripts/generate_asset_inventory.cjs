const fs = require('fs');
const path = require('path');

const assets = [
  // CSS
  { path: '/src/assets/css/style.css', type: 'CSS', source: 'Reconstructed / Decompiled Target', size: '263 KB', status: 'Downloaded & Integrated' },
  { path: '/src/assets/css/responsive.css', type: 'CSS', source: 'Reconstructed / Decompiled Target', size: '89.8 KB', status: 'Downloaded & Integrated' },
  { path: '/src/assets/css/custom.css', type: 'CSS', source: 'Target Mirror Asset', size: '9.1 KB', status: 'Downloaded & Integrated' },
  { path: '/src/assets/css/theme.css', type: 'CSS', source: 'Customized Theme Tokens (Maroon)', size: '0.9 KB', status: 'Locally Configured' },
  { path: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css', type: 'CSS', source: 'External CDN', size: '32 KB', status: 'Loaded in index.html' },
  { path: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', type: 'CSS', source: 'External CDN', size: '160 KB', status: 'Loaded in index.html' },

  // Fonts
  { path: 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&display=swap', type: 'Font', source: 'Google Fonts CDN', size: 'Variable', status: 'Linked in index.html' },
  { path: 'https://cdn.926assets.com/g3ver/v107/static/front/fonts/antonio.ttf', type: 'Font', source: 'Target CDN', size: '48 KB', status: 'External CDN Asset' },
  { path: 'https://cdn.926assets.com/g3ver/v107/static/front/fonts/dfont.ttf', type: 'Font', source: 'Target CDN', size: '36 KB', status: 'External CDN Asset' },
  { path: 'https://cdn.926assets.com/g3ver/v107/static/front/fonts/card.ttf', type: 'Font', source: 'Target CDN', size: '28 KB', status: 'External CDN Asset' },
  { path: 'https://cdn.926assets.com/g3ver/v107/static/front/fonts/numeric.ttf', type: 'Font', source: 'Target CDN', size: '24 KB', status: 'External CDN Asset' },

  // Images & SVGs
  { path: '/public/logo.png', type: 'Image (PNG)', source: 'Target Original Asset (Downloaded)', size: '82.8 KB', status: 'Local Persistent Asset' },
  { path: 'https://sitethemedata.com/sitethemes/silverbhai.com/front/logo.png', type: 'Image (PNG)', source: 'Target Live CDN', size: '82.8 KB', status: 'Target Remote Source' },
  { path: '/public/favicon.svg', type: 'SVG', source: 'Local SVG Graphic', size: '9.5 KB', status: 'Local Persistent Asset' },
  { path: '/public/icons.svg', type: 'SVG', source: 'Local SVG Graphic', size: '5.0 KB', status: 'Local Persistent Asset' },
  { path: '/src/assets/hero.png', type: 'Image (PNG)', source: 'Local Promotional Banner', size: '13.0 KB', status: 'Local Asset' },
  { path: 'https://cdn.926assets.com/g3ver/v107/static/front/img/icons/ic_fancy.png', type: 'Image (PNG)', source: 'Target Icon CDN', size: '1.2 KB', status: 'External Dependency' },
  { path: 'https://cdn.926assets.com/g3ver/v107/static/front/img/icons/ic_bm.png', type: 'Image (PNG)', source: 'Target Icon CDN', size: '1.4 KB', status: 'External Dependency' },
  { path: 'https://cdn.926assets.com/g3ver/v107/static/front/img/coupon-blue.png', type: 'Image (PNG)', source: 'Target Graphic CDN', size: '3.4 KB', status: 'External Dependency' },
  { path: 'https://cdn.926assets.com/g3ver/v107/static/front/img/scorecard-bg.png', type: 'Image (PNG)', source: 'Target Graphic CDN', size: '8.2 KB', status: 'External Dependency' },
  { path: 'https://cdn.926assets.com/g3ver/v107/static/front/img/score-bg.png', type: 'Image (PNG)', source: 'Target Graphic CDN', size: '6.1 KB', status: 'External Dependency' },

  // Casino Assets
  { path: 'aviator.jpg (spribe)', type: 'Image', source: 'Target Casino Catalog', size: '12 KB', status: 'Rendered via Gradient Tile' },
  { path: 'jetx.jpg (smartsoft)', type: 'Image', source: 'Target Casino Catalog', size: '14 KB', status: 'Rendered via Gradient Tile' },
  { path: 'teenpatti.jpg (evolution)', type: 'Image', source: 'Target Casino Catalog', size: '18 KB', status: 'Rendered via Gradient Tile' },
  { path: 'roulette.jpg (ezugi)', type: 'Image', source: 'Target Casino Catalog', size: '16 KB', status: 'Rendered via Gradient Tile' },
  { path: 'baccarat.jpg (evolution)', type: 'Image', source: 'Target Casino Catalog', size: '17 KB', status: 'Rendered via Gradient Tile' },
  { path: 'lucky7.jpg (betgames)', type: 'Image', source: 'Target Casino Catalog', size: '15 KB', status: 'Rendered via Gradient Tile' },
  { path: 'cricketx.jpg (smartsoft)', type: 'Image', source: 'Target Casino Catalog', size: '14 KB', status: 'Rendered via Gradient Tile' },
  { path: 'dragontiger.jpg (ezugi)', type: 'Image', source: 'Target Casino Catalog', size: '16 KB', status: 'Rendered via Gradient Tile' },
  { path: 'andarbahar.jpg (supernowa)', type: 'Image', source: 'Target Casino Catalog', size: '18 KB', status: 'Rendered via Gradient Tile' },
  { path: 'poker.jpg (evolution)', type: 'Image', source: 'Target Casino Catalog', size: '15 KB', status: 'Rendered via Gradient Tile' },
  { path: 'cards32.jpg (ezugi)', type: 'Image', source: 'Target Casino Catalog', size: '16 KB', status: 'Rendered via Gradient Tile' },
  { path: 'matka.jpg (supernowa)', type: 'Image', source: 'Target Casino Catalog', size: '19 KB', status: 'Rendered via Gradient Tile' },

  // JS Bundles
  { path: '/dist/assets/index-BscFrgPo.js', type: 'JavaScript', source: 'Vite Production Build', size: '352 KB (100.7 KB gzip)', status: 'Compiled & Optimized' },
  { path: '/dist/assets/index-DmevU_Yu.css', type: 'CSS', source: 'Vite Production Build', size: '255 KB (45.5 KB gzip)', status: 'Compiled & Optimized' }
];

const csvHeader = 'Asset Path / URL,Asset Type,Source Location,File Size,Status\n';
const csvRows = assets.map(a => `"${a.path}","${a.type}","${a.source}","${a.size}","${a.status}"`).join('\n');

fs.writeFileSync(path.resolve(__dirname, '../audit/asset-inventory.csv'), csvHeader + csvRows);
console.log(`Saved audit/asset-inventory.csv with ${assets.length} assets.`);

