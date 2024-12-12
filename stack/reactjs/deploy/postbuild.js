const fs = require('fs');
const path = require('path');

const filesToCopy = ['storage-cors.json', 'storage-website.json'];
const sourceDir = path.join(__dirname);
const destination = path.join(__dirname, '..', 'build');

// Ensure the destination directory exists
if (!fs.existsSync(destination)) {
  fs.mkdirSync(destination, { recursive: true });
}

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destinationPath = path.join(destination, file);

  fs.copyFile(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error(`Error copying ${file}:`, err);
    } else {
      console.log(`${file} copied to build folder.`);
    }
  });
});
