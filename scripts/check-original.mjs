import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const base = join(root, 'challenges', '000-human-verification-bureau');
const manifest = JSON.parse(readFileSync(join(base, 'original-manifest.json'), 'utf8'));
let failed = false;
for (const [file, expected] of Object.entries(manifest)) {
  try {
    const actual = createHash('sha256').update(readFileSync(join(base, 'original', file))).digest('hex');
    if (actual !== expected.public_sha256) throw new Error('内容已变化');
  } catch (error) { console.error(`${file}：${error.message}`); failed = true; }
}
const ignored = new Set(['node_modules', 'dist', 'work', 'test-results', 'playwright-report', '.local']);
function inspect(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) inspect(path);
    else {
      const file = relative(join(base, 'original'), path).replaceAll('\\', '/');
      if (!Object.hasOwn(manifest, file)) { console.error(`原版内存在额外文件：${file}`); failed = true; }
    }
  }
}
inspect(join(base, 'original'));
if (failed) process.exit(1);
console.log('公开原版与文件清单一致。');
