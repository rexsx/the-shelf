const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const base = process.argv[2];

async function readPdf(file) {
  const parser = new PDFParse({ data: new Uint8Array(fs.readFileSync(file)) });
  try {
    const result = await parser.getText();
    return { pages: result.pages ? result.pages.length : 0, text: result.text || "" };
  } finally {
    await parser.destroy();
  }
}

(async function () {
  const subjects = fs.readdirSync(base, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name).sort();

  let totalWords = 0;
  let totalPages = 0;
  const thin = [];

  for (const sub of subjects) {
    const dir = path.join(base, sub);
    const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(".pdf")).sort();
    let words = 0;
    let pages = 0;
    let failed = 0;

    for (const f of files) {
      try {
        const r = await readPdf(path.join(dir, f));
        words += r.text.trim().split(/\s+/).filter(Boolean).length;
        pages += r.pages;
      } catch (err) {
        failed += 1;
      }
    }

    totalWords += words;
    totalPages += pages;
    const perPage = pages ? Math.round(words / pages) : 0;
    if (perPage < 30) thin.push(sub);

    console.log("  " + sub.padEnd(8) +
      String(files.length).padStart(3) + " files  " +
      String(pages).padStart(4) + " pages  " +
      String(words).padStart(7) + " words  " +
      String(perPage).padStart(4) + " w/page  " +
      (failed ? failed + " failed  " : "") +
      (perPage < 30 ? "IMAGE-ONLY" : "text ok"));
  }

  console.log("");
  console.log("total: " + totalPages + " pages, " + totalWords.toLocaleString() + " words");
  if (thin.length) console.log("little or no extractable text: " + thin.join(", "));
})();
