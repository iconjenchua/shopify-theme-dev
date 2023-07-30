const { envVariables } = require('./helper');
const fs = require('fs')
const path = require('path')

// Define the folders that this script will make for store-specific files
const shopifyDirs = [
  'config',
  'layout',
  'locales',
  'templates/customers',
  'sections',
  // 'assets',
  // 'snippets',
];

const store = envVariables.STORE;

if(store && store != '' && store != 'development') {
  for(let i = 0; i < shopifyDirs.length; i++) {
    let currentPath = path.resolve(__dirname, '../stores/', store, shopifyDirs[i]);
  
    fs.mkdirSync(currentPath, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }
}
