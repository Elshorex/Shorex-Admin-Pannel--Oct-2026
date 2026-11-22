const fs = require('fs');

// Directory where your source code files are located
const sourceDirectory = 'src';
const paths = [
    'src/controllers/admin.controller',
    'src/controllers/country.controller',
    'src/controllers/city.controller',
    'src/controllers/region.controller',
    'src/controllers/language.controller',
    'src/controllers/currency.controller',
    'src/controllers/status.controller',
    'src/controllers/admin-site-map.controller',
    'src/controllers/user-roles.controller',
];

// Regular expression to match i18n keys within __() function calls
const i18nRegex = /i18n\.__\((['"`])(.*?)\1\)/g;

// Set to store unique keys
const keys = new Set();

// Function to extract keys from a file
function extractKeysFromFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let match;
    while ((match = i18nRegex.exec(fileContent)) !== null) {
        keys.add(match[2]);
    }
}

// Function to recursively traverse directories
function traverseDirectory(directory) {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        const filePath = `${directory}/${file}`;
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            traverseDirectory(filePath);
        } else if (stats.isFile()) {
            if (filePath.endsWith('.js')) {
                extractKeysFromFile(filePath);
            }
        }
    });
}

for (let index = 0; index < paths.length; index++) {
    // Start traversing the source directory
    traverseDirectory(paths[index]);
}



// Print out the extracted keys
console.log('Extracted keys:');
keys.forEach(key => console.log(key));


function jsonOutFormat(data){
    let output = {}
    for (const key of data) {
        output[key] = ""
    }
      console.log(JSON.stringify(output));
}
jsonOutFormat(keys);
