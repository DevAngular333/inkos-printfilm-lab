import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrintFilmPackage, detectLanguage, extractTitle, readPrintFilmImport } from '../src/bridge.mjs';

test('detects Vietnamese content', () => {
  assert.equal(detectLanguage('Một người bước vào căn phòng và không quay lại.'), 'vi');
});

test('extracts Markdown heading as title', () => {
  assert.equal(extractTitle('# Chuyến Xe Cuối\n\nNội dung'), 'Chuyến Xe Cuối');
});

test('converts Markdown into a clean PrintFilm project', () => {
  const result = createPrintFilmPackage('# Tập 1\n\n## Cảnh 1\nĐêm mưa.', {
    sourceName: 'episode-01.md',
  });

  assert.equal(result.format, 'inkos-printfilm-bridge/v1');
  assert.equal(result.project.title, 'Tập 1');
  assert.equal(result.project.language, 'vi');
  assert.equal(result.project.scriptData, null);
  assert.deepEqual(result.project.shots, []);
});

test('accepts InkOS JSON metadata', () => {
  const result = createPrintFilmPackage(JSON.stringify({
    bookId: 'night-bus',
    title: 'Night Bus',
    language: 'en',
    markdown: '# Chapter 1\nA bus arrives.',
  }), { sourceName: 'book.json' });

  assert.equal(result.source.bookId, 'night-bus');
  assert.equal(result.project.title, 'Night Bus');
});

test('reads package for PrintFilm updateProject', () => {
  const packageData = createPrintFilmPackage('# Demo\nStory', { sourceName: 'demo.md' });
  const update = readPrintFilmImport(packageData);

  assert.equal(update.title, 'Demo');
  assert.equal(update.rawScript, '# Demo\nStory');
  assert.deepEqual(update.shots, []);
});
