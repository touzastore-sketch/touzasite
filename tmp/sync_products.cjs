const fs = require('fs');
const live = JSON.parse(fs.readFileSync('/tmp/live_firestore_products.json', 'utf8'));

const out = `import { Product } from '../types';

export const HERO_IMAGE = '/images/touza_hero_poster.jpg';
export const CATALOG_VERSION = 'v2026_09_01_29prods_live';

export const PRODUCTS: Product[] = ${JSON.stringify(live, null, 2)};
`;

fs.writeFileSync('src/data/products.ts', out, 'utf8');
console.log('Successfully wrote src/data/products.ts with', live.length, 'products');
