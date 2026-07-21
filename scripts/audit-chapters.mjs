import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const novelasRoot = path.join(root, 'novelas');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function cleanText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractStory(html) {
  const start = html.search(/<(?:div|section|article)[^>]*class=["'][^"']*\bstory\b[^"']*["'][^>]*>/i);
  if (start < 0) return '';
  const tail = html.slice(start);
  const end = tail.search(/<\/div>\s*<\/div>\s*(?:<div[^>]*class=["'][^"']*reader-bottom|<footer|<script)/i);
  return cleanText(end > 0 ? tail.slice(0, end) : tail);
}

const chapterFiles = walk(novelasRoot).filter((file) => /capitulo\d+\.html$/i.test(file));
const bySeason = new Map();
const issues = [];
const fingerprints = new Map();

for (const file of chapterFiles) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const match = rel.match(/^(.*)\/capitulo(\d+)\.html$/i);
  const season = match[1];
  const fileNum = Number(match[2]);
  const html = fs.readFileSync(file, 'utf8');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
  const h1 = cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
  const story = extractStory(html);
  const words = story ? story.split(/\s+/).length : 0;

  if (!bySeason.has(season)) bySeason.set(season, []);
  bySeason.get(season).push({ fileNum, rel, title, h1, words });

  const declaredNums = [...`${title} ${h1}`.matchAll(/Cap(?:í|i)tulo\s+(\d+)/gi)].map((m) => Number(m[1]));
  if (declaredNums.some((n) => n !== fileNum)) issues.push({ type: 'chapter-number-mismatch', rel, fileNum, declaredNums });
  if (!story) issues.push({ type: 'missing-story-container', rel });
  if (words < 250) issues.push({ type: 'short-chapter', rel, words });

  const fingerprint = story.toLocaleLowerCase('es').replace(/[^a-záéíóúüñ0-9]+/gi, ' ').trim();
  if (fingerprint) {
    if (!fingerprints.has(fingerprint)) fingerprints.set(fingerprint, []);
    fingerprints.get(fingerprint).push(rel);
  }

  for (const href of [...html.matchAll(/href=["']([^"'#?]+)(?:[?#][^"']*)?["']/gi)].map((m) => m[1])) {
    if (/^(?:https?:|mailto:|javascript:)/i.test(href)) continue;
    const target = path.resolve(path.dirname(file), decodeURI(href));
    if (!fs.existsSync(target)) issues.push({ type: 'broken-link', rel, href });
  }
}

for (const [season, chapters] of bySeason) {
  chapters.sort((a, b) => a.fileNum - b.fileNum);
  const max = chapters.at(-1).fileNum;
  const missing = Array.from({ length: max }, (_, i) => i + 1).filter((n) => !chapters.some((c) => c.fileNum === n));
  if (missing.length) issues.push({ type: 'missing-files', season, missing });
}

for (const files of fingerprints.values()) {
  if (files.length > 1) issues.push({ type: 'duplicate-story', files });
}

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(novelasRoot, 'data.js'), 'utf8'), sandbox);
const catalog = sandbox.window.NEBULA_NOVELS || {};
for (const novel of Object.values(catalog)) {
  for (const chapter of novel.chapters || []) {
    const rel = `novelas/${novel.baseFolder}/${chapter.season}/capitulo${chapter.num}.html`;
    if (!fs.existsSync(path.join(root, rel))) issues.push({ type: 'catalog-target-missing', novel: novel.id, rel });
  }
  const seasonDir = path.join(novelasRoot, novel.baseFolder, novel.defaultSeason);
  if (fs.existsSync(seasonDir)) {
    const diskNums = fs.readdirSync(seasonDir).map((name) => name.match(/^capitulo(\d+)\.html$/i)).filter(Boolean).map((m) => Number(m[1]));
    const catalogNums = (novel.chapters || []).filter((c) => c.season === novel.defaultSeason).map((c) => c.num);
    const hidden = diskNums.filter((n) => !catalogNums.includes(n)).sort((a, b) => a - b);
    if (hidden.length) issues.push({ type: 'chapters-hidden-from-catalog', novel: novel.id, hidden });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  chapterCount: chapterFiles.length,
  seasonCount: bySeason.size,
  seasons: Object.fromEntries([...bySeason].sort().map(([key, value]) => [key, value.sort((a, b) => a.fileNum - b.fileNum)])),
  issues,
};

if (process.argv.includes('--summary')) {
  const issueCounts = issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({
    chapterCount: report.chapterCount,
    seasonCount: report.seasonCount,
    issueCounts,
    issues: issues.filter((issue) => !['broken-link', 'short-chapter'].includes(issue.type)),
    shortChapters: issues.filter((issue) => issue.type === 'short-chapter'),
  }, null, 2));
} else {
  console.log(JSON.stringify(report, null, 2));
}
