#!/usr/bin/env node

/**
 * Script: update_product_image.cjs
 * 
 * Allows updating a product's image by uploading from local disk to the new Cloudinary
 * account (s1vv6dqw / tooooza_img) and updating the product record in Cloud Firestore.
 * 
 * Usage:
 *   node scripts/update_product_image.cjs --list
 *   node scripts/update_product_image.cjs --id <productId> --file <pathToImage>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CLOUDINARY_CLOUD_NAME = 's1vv6dqw';
const CLOUDINARY_UPLOAD_PRESET = 'tooooza_img';
const FIRESTORE_API_KEY = 'AIzaSyAEpohcMHT3pCjuxpl682BJfwtyCMGNpqM';
const FIRESTORE_PROJECT_ID = 'gen-lang-client-0218563638';
const FIRESTORE_DATABASE_ID = 'ai-studio-touzashop-b580d05a-fac1-4bc9-bb58-4f3bc5ec6ad6';

// Converts Firestore document fields to JavaScript object
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

// Converts JS value to Firestore document field structure
function jsToFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(jsToFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = jsToFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

// Fetch all products from Firestore
async function fetchAllProducts() {
  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents:runQuery?key=${FIRESTORE_API_KEY}`;
  const body = JSON.stringify({ structuredQuery: { from: [{ collectionId: 'products' }] } });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
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
          resolve(products);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Upload file to Cloudinary with unsigned preset
async function uploadFileToCloudinary(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const fileData = fs.readFileSync(filePath);
  const base64Data = `data:image/${path.extname(filePath).replace('.', '') || 'jpeg'};base64,${fileData.toString('base64')}`;

  const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
  const payload = [
    '--' + boundary,
    'Content-Disposition: form-data; name="upload_preset"',
    '',
    CLOUDINARY_UPLOAD_PRESET,
    '--' + boundary,
    'Content-Disposition: form-data; name="file"',
    '',
    base64Data,
    '--' + boundary + '--'
  ].join('\r\n');

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300 && json.secure_url) {
            let url = json.secure_url;
            if (url.includes('/image/upload/') && !url.includes('/image/upload/f_auto,q_auto/')) {
              url = url.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
            }
            resolve(url);
          } else {
            reject(new Error(json?.error?.message || `Cloudinary upload failed: ${data}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Update product in Firestore
async function updateProductInFirestore(product) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/products/${product.id}?key=${FIRESTORE_API_KEY}`;
  const fields = {};
  for (const [k, v] of Object.entries(product)) {
    if (k !== 'id') {
      fields[k] = jsToFirestoreValue(v);
    }
  }

  const body = JSON.stringify({ fields });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          reject(new Error(`Firestore update failed with status ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
======================================================
  TOUZA Cloudinary Product Image Updater Tool
======================================================
Cloud Name: ${CLOUDINARY_CLOUD_NAME}
Upload Preset: ${CLOUDINARY_UPLOAD_PRESET}

Usage:
  node scripts/update_product_image.cjs --list
    Lists all products with ID, name, and current image status.

  node scripts/update_product_image.cjs --id <productId> --file <pathToImage>
    Uploads the specified image file from your machine to Cloudinary
    and assigns it to the specified product in Cloud Firestore.
======================================================
    `);
    process.exit(0);
  }

  if (args.includes('--list')) {
    console.log('Fetching products from Firestore...');
    const products = await fetchAllProducts();
    console.log(`Total products: ${products.length}\n`);
    products.forEach((p, idx) => {
      const img = p.images?.[0] || 'No image';
      const isNew = img.includes(CLOUDINARY_CLOUD_NAME);
      const isOld = img.includes('qazdrpcx');
      const status = isNew ? '[NEW CLOUD]' : isOld ? '[OLD BROKEN CLOUD]' : '[OTHER]';
      console.log(`${(idx + 1).toString().padStart(2)}. [${p.id}] ${p.nameAr || p.name} (${p.category})`);
      console.log(`    Status: ${status}`);
      console.log(`    Image: ${img}`);
      console.log('');
    });
    process.exit(0);
  }

  const idIdx = args.indexOf('--id');
  const fileIdx = args.indexOf('--file');

  if (idIdx === -1 || fileIdx === -1) {
    console.error('Error: Both --id <productId> and --file <imagePath> are required.');
    process.exit(1);
  }

  const productId = args[idIdx + 1];
  const filePath = args[fileIdx + 1];

  if (!productId || !filePath) {
    console.error('Error: Missing value for --id or --file.');
    process.exit(1);
  }

  console.log(`1. Uploading "${filePath}" to Cloudinary (${CLOUDINARY_CLOUD_NAME})...`);
  const uploadedUrl = await uploadFileToCloudinary(filePath);
  console.log(`   -> Uploaded URL: ${uploadedUrl}`);

  console.log(`2. Fetching product "${productId}" from Firestore...`);
  const products = await fetchAllProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    console.error(`Error: Product with ID "${productId}" not found in Firestore.`);
    process.exit(1);
  }

  console.log(`   -> Found product: "${product.nameAr || product.name}"`);

  // Update images array and primary color image
  const updatedImages = [uploadedUrl, ...(product.images?.slice(1) || [])];
  const updatedColors = (product.colors || []).map((col, idx) => {
    if (idx === 0 || !col.imageUrl || col.imageUrl.includes('qazdrpcx')) {
      return { ...col, imageUrl: uploadedUrl };
    }
    return col;
  });

  const updatedProduct = {
    ...product,
    images: updatedImages,
    colors: updatedColors
  };

  console.log(`3. Saving updated product in Firestore...`);
  await updateProductInFirestore(updatedProduct);
  console.log(`✅ Success! Product "${product.nameAr || product.name}" updated with new image URL.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
