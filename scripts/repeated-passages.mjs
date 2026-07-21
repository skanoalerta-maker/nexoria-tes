import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'novelas');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function normalize(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ').replace(/\s+/g, ' ').trim();
}

const occurrences = new Map();
for (const file of walk(root).filter((name) => /capitulo\d+\.html$/i.test(name))) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(process.cwd(), file).replaceAll('\\', '/');
  for (const match of html.matchAll(/<(?:p|div)[^>]*(?:class=["'](?:lead|quote)["'])?[^>]*>([\s\S]*?)<\/(?:p|div)>/gi)) {
    const text = normalize(match[1]);
    if (text.split(/\s+/).length < 35) continue;
    const key = text.toLocaleLowerCase('es');
    if (!occurrences.has(key)) occurrences.set(key, { text, files: [] });
    occurrences.get(key).files.push(rel);
  }
}

const repeated = [...occurrences.values()].filter((item) => item.files.length > 1).sort((a, b) => b.files.length - a.files.length);
for (const item of repeated) {
  console.log(`\nCOUNT ${item.files.length}\n${item.text.slice(0, 260)}${item.text.length > 260 ? '…' : ''}\n${[...new Set(item.files)].join('\n')}`);
}
console.log(`\nRepeated long passages: ${repeated.length}`);
