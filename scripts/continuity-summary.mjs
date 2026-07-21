import fs from 'node:fs';
import path from 'node:path';

const directory = path.join(process.cwd(), 'reports', 'narrative');
const requested = process.argv[2]?.toLocaleLowerCase('es');
const files = fs.readdirSync(directory).filter((name) => name.endsWith('.txt') && (!requested || name.toLocaleLowerCase('es').includes(requested)));

for (const name of files) {
  const content = fs.readFileSync(path.join(directory, name), 'utf8');
  console.log(`\n######## ${name} ########`);
  const blocks = content.split(/(?====== CAPÍTULO \d+:)/).filter(Boolean);
  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const header = lines.shift();
    const first = lines.slice(0, 2).join(' ');
    const last = lines.slice(-2).join(' ');
    const signals = [...lines.join(' ').matchAll(/\b(?:\d{1,2}:\d{2}|\d{1,2}\s+de\s+[a-záéíóúñ]+|lunes|martes|miércoles|jueves|viernes|sábado|domingo|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|ayer|anoche|esa noche|al amanecer|a la mañana siguiente|horas después|días después|años después)\b/gi)].map((m) => m[0]);
    console.log(`\n${header}\nINICIO: ${first}\nCIERRE: ${last}\nTIEMPO: ${[...new Set(signals)].join(', ') || '-'}`);
  }
}
