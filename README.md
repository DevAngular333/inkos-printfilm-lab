# InkOS × PrintFilm Lab

Proof of concept for moving a story from [InkOS](https://github.com/Narcooo/inkos) into [PrintFilm](https://github.com/yuanzhongqiao/printfilm).

## DevAngular333 verified path

This public repository adds a reproducible smoke command over the real CLI and
import function:

```bash
npm test
npm run smoke
```

The smoke uses a tracked Vietnamese Markdown fixture, writes the bridge JSON to
a temporary directory, verifies title/language/script, and confirms stale
`scriptData`/`shots` are cleared. See [case study](docs/case-study.md) and
[attribution/license boundary](NOTICE.md). InkOS is AGPL-3.0; PrintFilm's
license was not publicly verifiable during the 2026-10-21 audit.

## What this repository proves

- InkOS can export a book as Markdown with `inkos export`.
- The bridge converts Markdown, TXT, or simple InkOS JSON into a stable `*.printfilm.json` package.
- PrintFilm can import that package into its existing project fields: `title`, `rawScript`, `language`, `targetDuration`, and `visualStyle`.
- Old `scriptData` and `shots` are cleared when a new InkOS script is imported, preventing stale scenes from being mixed with the new story.

The bridge does not copy either upstream repository. They remain independent applications connected through a documented file format.

## Requirements

- Node.js 20 or newer
- InkOS installed or built locally
- A separate PrintFilm checkout for trying the UI prototype

## Export from InkOS

From an InkOS project:

```bash
inkos export <book-id> --format md --output episode-01.md
```

InkOS also supports `--json`, which returns export metadata such as the output path.

## Convert to a PrintFilm package

```bash
npm run convert -- episode-01.md -o episode-01.printfilm.json
```

Optional settings:

```bash
npm run convert -- episode-01.md \
  --title "Episode 1" \
  --language vi \
  --duration "8 min" \
  --style "cinematic horror" \
  -o episode-01.printfilm.json
```

The generated format is intentionally small:

```json
{
  "format": "inkos-printfilm-bridge/v1",
  "source": {
    "application": "InkOS",
    "fileName": "episode-01.md"
  },
  "project": {
    "title": "Episode 1",
    "rawScript": "# Episode 1...",
    "language": "vi",
    "targetDuration": "8 min",
    "visualStyle": "cinematic horror",
    "scriptData": null,
    "shots": []
  }
}
```

## Try the PrintFilm UI integration

Copy `printfilm/InkOSImportButton.tsx` into a PrintFilm checkout. Render it from `components/StageScript/index.tsx` and connect it to the existing state setters:

```tsx
<InkOSImportButton
  onImport={(updates) => {
    setLocalTitle(updates.title);
    setLocalScript(updates.rawScript);
    setLocalLanguage(updates.language);
    setLocalDuration(updates.targetDuration);
    setLocalVisualStyle(updates.visualStyle);
    updateProject(updates);
  }}
/>
```

The button accepts `.md`, `.txt`, and bridge `.json` files. After import, use PrintFilm's existing script analysis action to generate characters, scenes, and shots.

## Test

```bash
npm test
```

GitHub Actions runs the same tests for every push and pull request.

## Current scope

This is a file-based integration, not a realtime API connection. That is deliberate: it keeps InkOS and PrintFilm upgradeable independently and avoids mixing AGPL-licensed InkOS source code into the PrintFilm application.
