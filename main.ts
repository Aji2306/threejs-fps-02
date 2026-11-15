// Breachline entrypoint script
// Automatically bundles game assets and generates the competition dossier
// Written for the make.fun competition entry 2026

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-threejs.ts';

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = dirname(scriptPath);
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function replicateAssets(sourceDir, targetDir) {
  if (existsSync(sourceDir)) {
    mkdirSync(targetDir, { recursive: true });
    cpSync(sourceDir, targetDir, { recursive: true });
  }
}

function deployEntry() {
  mkdirSync(outputDir, { recursive: true });
  replicateAssets(join(repoRoot, 'game'), join(outputDir, 'game'));
  replicateAssets(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

  const dossierConfig = {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648
  };

  const dossierContent = buildDossier(outputDir, dossierConfig);
  writeFileSync(join(outputDir, 'dossier.json'), dossierContent);
}

deployEntry();
