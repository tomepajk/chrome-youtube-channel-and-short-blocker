import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = resolve(__dirname, '../src/manifest.json');

type BumpKind = 'major' | 'minor' | 'patch';

function getBumpKind(): BumpKind {
  if (process.argv.includes('--major')) return 'major';
  if (process.argv.includes('--minor')) return 'minor';
  return 'patch';
}

function bumpVersion(version: string, kind: BumpKind): string {
  const [major, minor, patch] = version.split('.').map((n) => parseInt(n, 10) || 0);
  switch (kind) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

export function bumpManifestVersion() {
  const current = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  current.version = bumpVersion(current.version, getBumpKind());
  writeFileSync(MANIFEST_PATH, JSON.stringify(current, null, 2) + '\n');
  return current;
}