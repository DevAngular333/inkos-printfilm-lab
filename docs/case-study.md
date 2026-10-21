# Case study: file bridge from InkOS to PrintFilm

## User and problem

A story author may keep narrative work in InkOS while a visual workflow uses
PrintFilm. Copying fields by hand loses title/language/script metadata and can
leave stale `scriptData` or `shots` from a previous project.

## DevAngular333 contribution

This repository keeps the upstream bridge proof of concept and adds a
framework-free smoke path: `scripts/smoke.mjs`. It runs the real CLI against a
tracked Markdown fixture, reads the generated bridge JSON through the import
function, verifies Vietnamese metadata and confirms stale scene fields are
cleared. Output lives in a temporary directory and is removed after the check.

```bash
npm test
node scripts/smoke.mjs
```

Expected smoke output:

```json
{"status":"PASS","format":"inkos-printfilm-bridge/v1","title":"Chuyến xe cuối","language":"vi","shots":0}
```

## Boundaries

This is a file-based adapter, not a realtime API or a claim that a PrintFilm
checkout is publicly runnable. InkOS is observed as AGPL-3.0; the PrintFilm
repository/license cited by the original README was not publicly resolvable in
this audit. See [`NOTICE.md`](../NOTICE.md) before redistributing integrations.
