import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const sourceAppPath = path.join(distDir, 'app.html');

const staticRoutes = [
  'login',
  'register',
  'dashboard',
  'terms',
  'admin',
  'admin/orders',
  'admin/ranks',
  'admin/coins',
];

async function ensureFileExists(filePath) {
  await readFile(filePath, 'utf8');
}

async function generateRoutePages() {
  await ensureFileExists(sourceAppPath);
  const html = await readFile(sourceAppPath, 'utf8');

  for (const route of staticRoutes) {
    const routeDir = path.join(distDir, route);
    const routeIndexPath = path.join(routeDir, 'index.html');

    await mkdir(routeDir, { recursive: true });
    await writeFile(routeIndexPath, html, 'utf8');
  }

  // Keep a copy at 404 so unknown static misses still boot the SPA on some hosts.
  await copyFile(sourceAppPath, path.join(distDir, '404.html'));
}

generateRoutePages().catch((error) => {
  console.error('Failed to generate static route entry files.', error);
  process.exitCode = 1;
});
