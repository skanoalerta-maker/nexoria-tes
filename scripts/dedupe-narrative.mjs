import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'novelas');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function normalize(fragment) {
  return fragment.replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase('es');
}

function storyRange(html) {
  const startMatch = html.match(/<div[^>]*class=["'][^"']*\bstory\b[^"']*["'][^>]*>/i);
  if (!startMatch || startMatch.index == null) return null;
  const start = startMatch.index + startMatch[0].length;
  const boundary = html.slice(start).search(/\n\s*<div[^>]*class=["'][^"']*reader-bottom/i);
  if (boundary < 0) return null;
  return { start, end: start + boundary };
}

const files = walk(root).filter((name) => /capitulo\d+\.html$/i.test(name)).sort();
const seasons = new Map();
for (const file of files) {
  const season = path.dirname(file);
  if (!seasons.has(season)) seasons.set(season, []);
  seasons.get(season).push(file);
}

let changedFiles = 0;
let removedBlocks = 0;

for (const seasonFiles of seasons.values()) {
  const seen = new Set();
  const seenSentences = new Set();
  for (const file of seasonFiles.sort((a, b) => {
    const number = (value) => Number(path.basename(value).match(/\d+/)?.[0] || 0);
    return number(a) - number(b);
  })) {
    let html = fs.readFileSync(file, 'utf8');
    const range = storyRange(html);
    if (!range) continue;
    let story = html.slice(range.start, range.end);
    const originalStory = story;

    story = story.replace(/<(p|div)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (block, tag, attrs, inner) => {
      const key = normalize(inner);
      const words = key ? key.split(/\s+/).length : 0;
      if (words < 35) return block;
      if (seen.has(key)) {
        removedBlocks += 1;
        return '';
      }
      seen.add(key);
      if (tag.toLowerCase() !== 'p' || /<[^>]+>/.test(inner)) return block;
      const sentences = inner.trim().split(/(?<=[.!?])\s+/);
      const retained = sentences.filter((sentence) => {
        const sentenceKey = normalize(sentence);
        if (sentenceKey.split(/\s+/).length < 14) return true;
        if (seenSentences.has(sentenceKey)) return false;
        seenSentences.add(sentenceKey);
        return true;
      });
      if (!retained.length) {
        removedBlocks += 1;
        return '';
      }
      return `<${tag}${attrs}>${retained.join(' ')}</${tag}>`;
    });

    const chapterNum = Number(path.basename(file).match(/\d+/)?.[0] || 0);
    story = story.replaceAll('{scene}', `el episodio ${chapterNum}`);
    story = story.replaceAll('{num}', String(chapterNum));
    story = story.replaceAll('{title}', `el capítulo ${chapterNum}`);
    story = story.replaceAll(`En el episodio ${chapterNum}.`, `En el episodio ${chapterNum},`);

    if (story !== originalStory) {
      html = html.slice(0, range.start) + story + html.slice(range.end);
      fs.writeFileSync(file, html, 'utf8');
      changedFiles += 1;
    }
  }
}

console.log(`Removed ${removedBlocks} repeated long blocks and updated ${changedFiles} files.`);
