#!/usr/bin/env node
/**
 * Reproducible CLI smoke for the public bridge path.
 * Output is written to a temporary directory and removed automatically.
 */
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readPrintFilmImport } from '../src/bridge.mjs';

const run = promisify(execFile);
const root = path.resolve(new URL('..', import.meta.url).pathname);
const input = path.join(root, 'test/fixtures/episode-01.md');
const temp = await mkdtemp(path.join(os.tmpdir(), 'inkos-printfilm-smoke-'));
const output = path.join(temp, 'episode-01.printfilm.json');

try {
  await run(process.execPath, [path.join(root, 'src/cli.mjs'), input, '--language', 'vi', '--duration', '5 min', '-o', output], { cwd: root });
  const packageData = JSON.parse(await readFile(output, 'utf8'));
  const updates = readPrintFilmImport(packageData);
  if (packageData.format !== 'inkos-printfilm-bridge/v1') throw new Error('unexpected bridge format');
  if (updates.title !== 'Chuyến xe cuối' || updates.language !== 'vi') throw new Error('metadata was not preserved');
  if (!updates.rawScript.includes('Đêm mưa')) throw new Error('script was not preserved');
  if (updates.scriptData !== null || updates.shots.length !== 0) throw new Error('stale PrintFilm state was not cleared');
  console.log(JSON.stringify({ status: 'PASS', format: packageData.format, title: updates.title, language: updates.language, shots: updates.shots.length }));
} finally {
  await rm(temp, { recursive: true, force: true });
}
