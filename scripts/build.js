// scripts/build.js
// The frontend is static (no bundler); the backend is Vercel serverless
// functions whose dependencies are installed from package.json. There is
// nothing to compile, so "build" just validates that the required source files
// are present and exits successfully. This keeps `npm run build` meaningful
// both locally and in CI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const required = [
  'public/index.html',
  'api/auth/login.js',
  'api/auth/register.js',
  'api/simulations.js',
  'api/runs.js',
  'lib/db.js',
  'db/migrations/0001_core.sql',
];

let ok = true;
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`Missing required file: ${rel}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log('Build check passed: static frontend + serverless API present.');
