import fs from 'fs';
import path from 'path';
import https from 'https';

const IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600',
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600',
  'https://images.unsplash.com/photo-1508219803418-5f1f89469b50?w=600',
];

const OUTPUT_DIR = path.join(process.cwd(), 'testing', 'images');

async function downloadImage(url: string, index: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const filename = `unsplash-${String(index + 1).padStart(2, '0')}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);

    const file = fs.createWriteStream(filepath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded ${filename}`);
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Downloading ${IMAGES.length} images to ${OUTPUT_DIR}...\n`);

  for (let i = 0; i < IMAGES.length; i++) {
    try {
      await downloadImage(IMAGES[i], i);
    } catch (err) {
      console.error(`✗ Failed to download image ${i + 1}:`, err);
    }
  }

  console.log('\nDone!');
}

main();
