const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const source = process.argv[2];
const target = process.argv[3];

if (!source || !target) {
  console.error("usage: node tools/build-reviewers.js <handouts dir> <output dir>");
  process.exit(1);
}

const SUBJECT_NAMES = {
  ACCT1: "Fundamentals of Accountancy, Business and Management 1",
  ANIM1: "Animation 1",
  BIO1: "General Biology 1",
  DISS: "Disciplines and Ideas in the Social Sciences",
  DRRR: "Disaster Readiness and Risk Reduction",
  ORCOM: "Oral Communication in Context",
  ORGMA: "Organization and Management",
  PHYSCI: "Physical Science",
  PPG: "Philippine Politics and Governance",
  PRECAL: "Pre-Calculus",
  PROG1: "Computer Programming 1",
  UCSP: "Understanding Culture, Society and Politics"
};

const SECTION = /^(?:[IVXLC]+\.|[A-Z]\.|\d+\.)\s+\S/;
const NOISE = /^(page \d+|\d+\s*\|\s*page|handout\s*\d*|copyright|all rights reserved)/i;

function ascii(text) {
  return String(text)
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/[•●▪◦·‣⁃]/g, "-")
    .replace(/…/g, "...")
    .replace(/[   ]/g, " ")
    .replace(/[^\x20-\x7E¡-ÿ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLines(text) {
  return text
    .split(/\r?\n/)
    .map(ascii)
    .filter(l => l && !NOISE.test(l));
}

function outlineOf(text) {
  const lines = cleanLines(text);
  const sections = [];

  lines.forEach((line, i) => {
    if (!SECTION.test(line) || line.length > 90) return;
    const heading = line.replace(/\s*[:.]\s*$/, "");
    let gist = "";
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      const next = lines[j];
      if (SECTION.test(next)) break;
      if (next.length > 45) { gist = next; break; }
    }
    sections.push({ heading: heading, gist: gist });
  });

  const STOPWORD = /^(one|this|these|those|it|they|we|you|there|that|the|a|an|some|many|most|each|all|there's|his|her|their|its|such|other|another|both|no|not|if|when|where|how|why|what|who|in|on|at|for|as|by|with|from|but|and|or|so|then|thus|however|therefore|according|basically|generally|usually|today|now|here)$/i;

  const terms = [];
  const seen = {};
  lines.forEach(line => {
    const m = line.match(/^([A-Z][A-Za-z'-]*(?:\s+[A-Za-z'-]+){0,3})\s+(?:is|are|refers to|means|is defined as)\s+(?:the\s+|a\s+|an\s+)?(.{30,180})$/);
    if (!m) return;
    const term = m[1].replace(/[\s:;,-]+$/, "").trim();
    if (!term) return;
    const words = term.split(/\s+/);
    if (words.length > 4) return;
    if (STOPWORD.test(words[0])) return;
    if (words.some(w => STOPWORD.test(w) && w.length > 3)) return;
    const key = term.toLowerCase();
    if (seen[key]) return;
    seen[key] = true;
    terms.push({ term: term, meaning: m[2].replace(/\s*[.;,]\s*$/, "") });
  });

  return { sections: sections.slice(0, 14), terms: terms.slice(0, 12) };
}

function wrap(text, font, size, width) {
  const words = ascii(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach(w => {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) > width && line) { lines.push(line); line = w; }
    else line = test;
  });
  if (line) lines.push(line);
  return lines;
}

async function readTopic(file) {
  const parser = new PDFParse({ data: new Uint8Array(fs.readFileSync(file)) });
  try {
    const r = await parser.getText();
    return r.text || "";
  } finally {
    await parser.destroy();
  }
}

async function buildSubject(dir, code) {
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(".pdf")).sort();
  if (!files.length) return null;

  const topics = [];
  for (const file of files) {
    let text = "";
    try { text = await readTopic(path.join(dir, file)); } catch (err) { text = ""; }
    const title = file.replace(/\.pdf$/i, "").replace(/^(\d+)\s*-\s*/, "$1. ");
    topics.push(Object.assign({ title: title }, outlineOf(text)));
  }

  const doc = await PDFDocument.create();
  const name = SUBJECT_NAMES[code] || code;
  doc.setTitle(code + " reviewer - " + name);
  doc.setSubject("Grade 12 Semester 1 study outline");
  doc.setCreator("GFA Student Hub");

  const body = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const W = 595.28, H = 841.89, M = 56;
  const maxW = W - M * 2;
  let page = doc.addPage([W, H]);
  let y = H - M;

  function room(need) {
    if (y - need >= M) return;
    page = doc.addPage([W, H]);
    y = H - M;
  }

  function write(text, font, size, colour, indent, gap) {
    const lines = wrap(text, font, size, maxW - (indent || 0));
    lines.forEach(l => {
      room(size + 4);
      page.drawText(l, { x: M + (indent || 0), y: y - size, size: size, font: font, color: colour });
      y -= size + 4;
    });
    y -= gap || 0;
  }

  const ink = rgb(0.05, 0.07, 0.11);
  const soft = rgb(0.35, 0.4, 0.48);
  const accent = rgb(0.12, 0.43, 0.82);

  write(code, bold, 26, ink, 0, 2);
  write(name, body, 13, soft, 0, 14);
  write("Grade 12, Semester 1 study outline", body, 10, soft, 0, 6);
  write("A summary of section headings and key terms, made by students for revision. " +
    "It is not the handout and does not replace it.", italic, 9, soft, 0, 18);

  topics.forEach(topic => {
    room(60);
    y -= 6;
    page.drawLine({
      start: { x: M, y: y + 6 }, end: { x: W - M, y: y + 6 },
      thickness: 0.8, color: rgb(0.8, 0.84, 0.89)
    });
    y -= 6;
    write(topic.title, bold, 12.5, ink, 0, 6);

    if (!topic.sections.length && !topic.terms.length) {
      write("No outline could be read from this handout.", italic, 9, soft, 10, 8);
      return;
    }

    topic.sections.forEach(s => {
      write(s.heading, bold, 9.5, accent, 10, 0);
      if (s.gist) write(s.gist, body, 9, soft, 20, 2);
    });

    if (topic.terms.length) {
      y -= 4;
      write("Key terms", bold, 9, ink, 10, 3);
      topic.terms.forEach(t => {
        write(t.term + " - " + t.meaning, body, 9, soft, 20, 1);
      });
    }
    y -= 8;
  });

  const bytes = await doc.save();
  const out = path.join(target, code + " reviewer - Grade 12 Sem 1.pdf");
  fs.writeFileSync(out, bytes);

  return {
    code: code,
    topics: topics.length,
    sections: topics.reduce((a, t) => a + t.sections.length, 0),
    terms: topics.reduce((a, t) => a + t.terms.length, 0),
    pages: doc.getPageCount(),
    bytes: bytes.length
  };
}

(async function () {
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  const dirs = fs.readdirSync(source, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name).sort();

  let total = 0;
  for (const code of dirs) {
    const r = await buildSubject(path.join(source, code), code);
    if (!r) continue;
    total += r.bytes;
    console.log("  " + r.code.padEnd(8) +
      String(r.topics).padStart(3) + " topics  " +
      String(r.sections).padStart(4) + " headings  " +
      String(r.terms).padStart(3) + " terms  " +
      String(r.pages).padStart(3) + " pages  " +
      (r.bytes / 1024).toFixed(0).padStart(5) + " KB");
  }
  console.log("");
  console.log("total: " + (total / 1048576).toFixed(1) + " MB");
})();
