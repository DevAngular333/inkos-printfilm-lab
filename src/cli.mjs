#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createPrintFilmPackage } from './bridge.mjs';

function usage() {
  console.log(`Usage:
  node src/cli.mjs <inkos-export.md|txt|json> [-o output.printfilm.json]

Options:
  --title <text>       Override project title
  --language <code>    Override language, e.g. vi or en
  --duration <text>    Target duration, default: 5 min
  --style <text>       Visual style
  -o, --output <path>  Output file path`);
}

function parseArgs(argv) {
  const options = {};
  let input;
  let output;

  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith('-') && !input) input = value;
    else if (value === '-o' || value === '--output') output = argv[++i];
    else if (value === '--title') options.title = argv[++i];
    else if (value === '--language') options.language = argv[++i];
    else if (value === '--duration') options.targetDuration = argv[++i];
    else if (value === '--style') options.visualStyle = argv[++i];
    else if (value === '-h' || value === '--help') return { help: true };
    else throw new Error(`Unknown argument: ${value}`);
  }

  return { input, output, options };
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  const source = await readFile(args.input, 'utf8');
  const packageData = createPrintFilmPackage(source, {
    ...args.options,
    sourceName: args.input,
  });
  const output = args.output || `${args.input.replace(/\.[^.]+$/, '')}.printfilm.json`;
  await writeFile(output, `${JSON.stringify(packageData, null, 2)}\n`, 'utf8');
  console.log(`Created ${path.resolve(output)}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
