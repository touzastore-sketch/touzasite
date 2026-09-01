const fs = require('fs');

function firestoreValueToJs(val) {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('arrayValue' in val) {
    const values = val.arrayValue.values || [];
    return values.map(firestoreValueToJs);
  }
  if ('mapValue' in val) {
    const fields = val.mapValue.fields || {};
    const res = {};
    for (const [k, v] of Object.entries(fields)) {
      res[k] = firestoreValueToJs(v);
    }
    return res;
  }
  if ('nullValue' in val) return null;
  return val;
}

const https = require('https');
const url = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0218563638/databases/ai-studio-touzashop-b580d05a-fac1-4bc9-bb58-4f3bc5ec6ad6/documents:runQuery?key=AIzaSyAEpohcMHT3pCjuxpl682BJfwtyCMGNpqM';
const body = JSON.stringify({ structuredQuery: { from: [{ collectionId: 'products' }] } });
const req = https.request(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    const products = [];
    parsed.forEach(item => {
      if (item.document) {
        const id = item.document.name.split('/').pop();
        const fields = item.document.fields || {};
        const prod = { id };
        for (const [k, v] of Object.entries(fields)) {
          prod[k] = firestoreValueToJs(v);
        }
        products.push(prod);
      }
    });
    console.log('Fetched full products count:', products.length);

    const out = `import { Product } from '../types';

export const HERO_IMAGE = '/images/touza_hero_poster.jpg';
export const CATALOG_VERSION = 'v2026_09_01_29prods_live';

export const getLocalizedProductName = (product?: Product | null, language: string = 'ar'): string => {
  if (!product) return '';
  if (language === 'ar') {
    return product.nameAr || product.name || '';
  }
  return product.name || product.nameAr || '';
};

export const getLocalizedProductSubtitle = (product?: Product | null, language: string = 'ar'): string => {
  if (!product) return '';
  if (language === 'ar') {
    return product.subtitleAr || product.subtitle || '';
  }
  return product.subtitle || product.subtitleAr || '';
};

export const getLocalizedProductCategory = (product?: Product | null, language: string = 'ar'): string => {
  if (!product) return '';
  if (language === 'ar') {
    return product.categoryAr || product.category || '';
  }
  return product.category || product.categoryAr || '';
};

export const getLocalizedProductDescription = (product?: Product | null, language: string = 'ar'): string => {
  if (!product) return '';
  if (language === 'ar') {
    return product.descriptionAr || product.description || '';
  }
  return product.description || product.descriptionAr || '';
};

export const getLocalizedProductDetails = (product?: Product | null, language: string = 'ar'): string[] => {
  if (!product) return [];
  if (language === 'ar') {
    return product.detailsAr && product.detailsAr.length > 0
      ? product.detailsAr
      : product.details || [];
  }
  return product.details && product.details.length > 0
    ? product.details
    : product.detailsAr || [];
};

export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;
    fs.writeFileSync('src/data/products.ts', out, 'utf8');
    console.log('Successfully wrote src/data/products.ts with', products.length, 'products and helper functions');
  });
});
req.write(body);
req.end();
