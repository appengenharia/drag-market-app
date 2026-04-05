const fs = require('fs');
const path = require('path');

let sharp;

try {
  sharp = require('sharp');
} catch (error) {
  console.error('O modulo "sharp" nao foi encontrado. Rode "npm install" antes de executar "node generate-icons.js".');
  process.exit(1);
}

const rootDir = __dirname;
const sourcePath = path.join(rootDir, 'logo.svg');
const iconSizes = [48, 72, 96, 192, 512];
const sourceSvg = fs.readFileSync(sourcePath);

if (!fs.existsSync(sourcePath)) {
  console.error('Arquivo logo.svg nao encontrado em: ' + sourcePath);
  process.exit(1);
}

async function generateIcon(size) {
  const outputPath = path.join(rootDir, 'icon-' + size + '.png');

  await sharp(sourceSvg, { density: 384 })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 17, g: 17, b: 17, alpha: 1 }
    })
    .png()
    .toFile(outputPath);

  console.log('Icone gerado:', path.basename(outputPath));
}

async function start() {
  for (const size of iconSizes) {
    await generateIcon(size);
  }
  console.log('Todos os icones PNG foram gerados a partir de logo.svg.');
}

start().catch(function (error) {
  console.error('Falha ao gerar icones PNG:', error.message);
  process.exit(1);
});
