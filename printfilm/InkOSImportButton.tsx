import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface PrintFilmUpdate {
  title: string;
  rawScript: string;
  language: string;
  targetDuration: string;
  visualStyle: string;
  scriptData: null;
  shots: [];
}

interface Props {
  onImport: (updates: PrintFilmUpdate) => void;
}

function detectLanguage(text: string): string {
  if (/[ăâđêôơưĂÂĐÊÔƠƯ]|\b(và|không|một|người|cảnh|nhân vật)\b/iu.test(text)) return 'vi';
  if (/[\u3400-\u9fff]/u.test(text)) return 'zh';
  if (/[\u3040-\u30ff]/u.test(text)) return 'ja';
  return 'en';
}

function titleFromMarkdown(text: string, fallback: string): string {
  return text.match(/^\s*#\s+(.+?)\s*$/m)?.[1]?.trim() || fallback;
}

function parseImport(content: string, fileName: string): PrintFilmUpdate {
  if (fileName.toLowerCase().endsWith('.json')) {
    const payload = JSON.parse(content);
    if (payload?.format !== 'inkos-printfilm-bridge/v1' || !payload?.project?.rawScript) {
      throw new Error('Unsupported InkOS–PrintFilm package.');
    }
    return {
      title: payload.project.title || 'InkOS Story',
      rawScript: payload.project.rawScript,
      language: payload.project.language || detectLanguage(payload.project.rawScript),
      targetDuration: payload.project.targetDuration || '5 min',
      visualStyle: payload.project.visualStyle || 'cinematic storytelling',
      scriptData: null,
      shots: [],
    };
  }

  const rawScript = content.trim();
  if (!rawScript) throw new Error('The selected InkOS export is empty.');
  return {
    title: titleFromMarkdown(rawScript, fileName.replace(/\.[^.]+$/, '')),
    rawScript,
    language: detectLanguage(rawScript),
    targetDuration: '5 min',
    visualStyle: 'cinematic storytelling',
    scriptData: null,
    shots: [],
  };
}

const InkOSImportButton: React.FC<Props> = ({ onImport }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      setError(null);
      onImport(parseImport(await file.text(), file.name));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Import failed.');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".md,.txt,.json,text/markdown,text/plain,application/json"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 border border-cyan-300/30 text-cyan-100 hover:bg-cyan-300/10"
      >
        <Upload className="w-3.5 h-3.5" />
        Import InkOS
      </button>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
};

export default InkOSImportButton;
