const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

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

function mb(bytes) {
  return (bytes / 1048576).toFixed(1) + " MB";
}

async function buildSubject(dir, code) {
  const files = fs.readdirSync(dir)
    .filter(f => f.toLowerCase().endsWith(".pdf"))
    .sort();

  if (!files.length) return null;

  const merged = await PDFDocument.create();
  merged.setTitle((SUBJECT_NAMES[code] || code) + " - Grade 12 Semester 1 reviewer");
  merged.setSubject("Golden Faith Academy Senior High School");
  merged.setCreator("GFA Student Hub");

  let pages = 0;
  const skipped = [];

  for (const file of files) {
    const bytes = fs.readFileSync(path.join(dir, file));
    try {
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const copied = await merged.copyPages(doc, doc.getPageIndices());
      copied.forEach(p => merged.addPage(p));
      pages += copied.length;
    } catch (err) {
      skipped.push(file + " (" + err.message.split("\n")[0] + ")");
    }
  }

  const out = await merged.save({ useObjectStreams: true });
  const outPath = path.join(target, code + " - Grade 12 Sem 1 reviewer.pdf");
  fs.writeFileSync(outPath, out);

  return { code, files: files.length, pages, bytes: out.length, skipped, outPath };
}

(async function () {
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  const dirs = fs.readdirSync(source, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  let totalBytes = 0;
  const oversize = [];

  for (const code of dirs) {
    const result = await buildSubject(path.join(source, code), code);
    if (!result) { console.log("  " + code.padEnd(8) + " no PDFs, skipped"); continue; }
    totalBytes += result.bytes;
    if (result.bytes > 100 * 1048576) oversize.push(result.code);
    console.log(
      "  " + result.code.padEnd(8) +
      String(result.files).padStart(3) + " handouts  " +
      String(result.pages).padStart(4) + " pages  " +
      mb(result.bytes).padStart(9)
    );
    result.skipped.forEach(s => console.log("      could not merge: " + s));
  }

  console.log("");
  console.log("total: " + mb(totalBytes));
  if (oversize.length) {
    console.log("over GitHub's 100 MB file limit: " + oversize.join(", "));
  }
})();
