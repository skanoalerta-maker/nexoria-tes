import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const novelasRoot = path.join(root, 'novelas');
const outputRoot = path.join(root, 'reports', 'narrative');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function decode(text) {
  const entities = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  };
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, key) => {
    if (key[0] === '#') {
      const hex = key[1]?.toLowerCase() === 'x';
      const number = Number.parseInt(key.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : ' ';
    }
    return entities[key.toLowerCase()] ?? ' ';
  });
}

function clean(fragment) {
  return decode(fragment)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(?:p|div|h\d|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function storyFragment(html) {
  const startMatch = html.match(/<(?:div|section|article)[^>]*class=["'][^"']*\bstory\b[^"']*["'][^>]*>/i);
  if (!startMatch || startMatch.index == null) return '';
  const start = startMatch.index + startMatch[0].length;
  const tail = html.slice(start);
  const boundary = tail.search(/\n\s*<div[^>]*class=["'][^"']*reader-bottom/i);
  return tail.slice(0, boundary >= 0 ? boundary : undefined);
}

const groups = new Map();
for (const file of walk(novelasRoot).filter((name) => /capitulo\d+\.html$/i.test(name))) {
  const rel = path.relative(novelasRoot, file).replaceAll('\\', '/');
  const match = rel.match(/^(.*\/temporada\d+)\/capitulo(\d+)\.html$/i);
  if (!match) continue;
  if (!groups.has(match[1])) groups.set(match[1], []);
  const html = fs.readFileSync(file, 'utf8');
  groups.get(match[1]).push({
    number: Number(match[2]),
    title: clean(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ''),
    narrative: clean(storyFragment(html)),
  });
}

fs.mkdirSync(outputRoot, { recursive: true });
for (const [season, chapters] of groups) {
  const target = path.join(outputRoot, `${season.replaceAll('/', '__')}.txt`);
  const body = chapters.sort((a, b) => a.number - b.number).map((chapter) =>
    `===== CAPÍTULO ${chapter.number}: ${chapter.title} =====\n${chapter.narrative}\n`
  ).join('\n');
  fs.writeFileSync(target, body, 'utf8');
}

console.log(`Exported ${groups.size} season files to ${path.relative(root, outputRoot)}.`);
