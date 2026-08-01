import path from 'node:path';

const LANGUAGE_HINTS = [
  { code: 'vi', pattern: /[ăâđêôơưĂÂĐÊÔƠƯ]|\b(và|không|một|người|cảnh|nhân vật)\b/iu },
  { code: 'zh', pattern: /[\u3400-\u9fff]/u },
  { code: 'ja', pattern: /[\u3040-\u30ff]/u },
];

export function detectLanguage(text) {
  for (const hint of LANGUAGE_HINTS) {
    if (hint.pattern.test(text)) return hint.code;
  }
  return 'en';
}

export function extractTitle(text, fallback = 'InkOS Story') {
  const heading = text.match(/^\s*#\s+(.+?)\s*$/m)?.[1]?.trim();
  if (heading) return heading;

  const firstContentLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('---'));

  return firstContentLine?.replace(/^#+\s*/, '').slice(0, 120) || fallback;
}

function unwrapInkOSJson(input) {
  const candidate = typeof input === 'string' ? JSON.parse(input) : input;
  if (!candidate || typeof candidate !== 'object') {
    throw new TypeError('InkOS JSON must be an object.');
  }

  const script = candidate.rawScript ?? candidate.markdown ?? candidate.content ?? candidate.text;
  if (typeof script !== 'string' || !script.trim()) {
    throw new TypeError('InkOS JSON must contain rawScript, markdown, content, or text.');
  }

  return {
    script,
    title: typeof candidate.title === 'string' ? candidate.title : undefined,
    language: typeof candidate.language === 'string' ? candidate.language : undefined,
    sourceBookId: typeof candidate.bookId === 'string' ? candidate.bookId : undefined,
  };
}

export function createPrintFilmPackage(input, options = {}) {
  const sourceName = options.sourceName || 'inkos-export.md';
  const parsed = options.inputType === 'json' || sourceName.toLowerCase().endsWith('.json')
    ? unwrapInkOSJson(input)
    : { script: String(input) };

  const rawScript = parsed.script.trim();
  if (!rawScript) throw new TypeError('The InkOS export is empty.');

  const title = options.title || parsed.title || extractTitle(rawScript, path.basename(sourceName, path.extname(sourceName)));
  const language = options.language || parsed.language || detectLanguage(rawScript);

  return {
    format: 'inkos-printfilm-bridge/v1',
    exportedAt: new Date().toISOString(),
    source: {
      application: 'InkOS',
      fileName: path.basename(sourceName),
      bookId: parsed.sourceBookId,
    },
    project: {
      title,
      rawScript,
      language,
      targetDuration: options.targetDuration || '5 min',
      visualStyle: options.visualStyle || 'cinematic storytelling',
      scriptData: null,
      shots: [],
    },
  };
}

export function readPrintFilmImport(input) {
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  if (data?.format !== 'inkos-printfilm-bridge/v1' || !data?.project) {
    throw new TypeError('Unsupported InkOS–PrintFilm package.');
  }
  if (typeof data.project.rawScript !== 'string' || !data.project.rawScript.trim()) {
    throw new TypeError('The package does not contain a script.');
  }

  return {
    title: data.project.title || 'InkOS Story',
    rawScript: data.project.rawScript,
    language: data.project.language || detectLanguage(data.project.rawScript),
    targetDuration: data.project.targetDuration || '5 min',
    visualStyle: data.project.visualStyle || 'cinematic storytelling',
    scriptData: null,
    shots: [],
  };
}
