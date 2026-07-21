import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const novelasRoot = path.join(root, 'novelas');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(novelasRoot, 'data.js'), 'utf8'), sandbox);
const novels = Object.values(sandbox.window.NEBULA_NOVELS || {});

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function webRelative(fromDir, target) {
  const rel = path.relative(fromDir, target).replaceAll('\\', '/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

const chapterFiles = walk(novelasRoot).filter((file) => /capitulo\d+\.html$/i.test(file));
let changed = 0;

for (const file of chapterFiles) {
  const relFromNovelas = path.relative(novelasRoot, file).replaceAll('\\', '/');
  const match = relFromNovelas.match(/^(.*)\/(temporada\d+)\/capitulo(\d+)\.html$/i);
  if (!match) continue;

  const [, baseFolder, season, rawNum] = match;
  const num = Number(rawNum);
  const novel = novels.find((item) => item.baseFolder === baseFolder &&
    (item.chapters || []).some((chapter) => chapter.season === season && chapter.num === num));
  const chapter = novel?.chapters.find((item) => item.season === season && item.num === num);
  const sagaTitle = novel?.sagaTitle || baseFolder.split('/').at(-1).replaceAll('-', ' ').replaceAll('_', ' ')
    .replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase('es'));
  const chapterTitle = chapter?.title && !/^Capítulo \d+$/i.test(chapter.title)
    ? chapter.title
    : null;

  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>Capítulo ${num} | ${sagaTitle}</title>`);
  html = html.replaceAll('Nombre de la novela', sagaTitle);
  html = html.replaceAll('Título del capítulo', chapterTitle || `Capítulo ${num}`);
  html = html.replaceAll('Capítulo X', `Capítulo ${num}`);
  if (baseFolder === 'accion/mision-peligrosa') {
    html = html.replaceAll('Suegro a la Deriva', sagaTitle);
  }
  html = html.replace(/(<[^>]+(?:id=["']brandTitle["']|class=["'][^"']*brand-title[^"']*["'])[^>]*>)[\s\S]*?(<\/[^>]+>)/i,
    `$1${sagaTitle}$2`);

  if (chapterTitle) {
    html = html.replace(/(<h1[^>]*>)\s*(?:Título del capítulo|Capítulo X|Capítulo \d+)\s*(<\/h1>)/i,
      `$1${chapterTitle}$2`);
    html = html.replace(/(<h2[^>]*>)\s*(?:Título del capítulo|Capítulo X)\s*(<\/h2>)/i,
      `$1${chapterTitle}$2`);
  }

  html = html.replace(/href=(["'])([^"'#?]+)([?#][^"']*)?\1/gi, (full, quote, href, suffix = '') => {
    if (/^(?:https?:|mailto:|javascript:)/i.test(href)) return full;
    let decoded;
    try { decoded = decodeURI(href); } catch { decoded = href; }
    const currentDir = path.dirname(file);
    if (fs.existsSync(path.resolve(currentDir, decoded))) return full;

    const chapterName = path.basename(decoded);
    if (/^capitulo\d+\.html$/i.test(chapterName)) {
      const sameSeason = path.join(currentDir, chapterName);
      if (fs.existsSync(sameSeason)) return `href=${quote}${chapterName}${suffix}${quote}`;
      const siblingSeason = decoded.match(/temporada\d+/i)?.[0];
      if (siblingSeason) {
        const sibling = path.join(path.dirname(currentDir), siblingSeason, chapterName);
        if (fs.existsSync(sibling)) return `href=${quote}${webRelative(currentDir, sibling)}${suffix}${quote}`;
      }
    }

    return `href=${quote}${webRelative(currentDir, path.join(novelasRoot, 'index.html'))}${suffix}${quote}`;
  });

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}

console.log(`Normalized ${changed} chapter files.`);
