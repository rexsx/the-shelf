const fs = require("fs");
const path = require("path");

const source = process.argv[2];
const target = process.argv[3] || path.resolve(__dirname, "..", "assets", "js", "data.js");

if (!source) {
  console.error("usage: node tools/import-resources.js <source.txt> [target.js]");
  process.exit(1);
}

const STRANDS = ["STEM", "ABM", "HUMSS", "ICT"];
const NA = /^n\/?a$/i;

const lines = fs.readFileSync(source, "utf8").split(/\r?\n/).map(s => s.trim());
const rows = [];
let grade = null;
let strand = null;
let semester = null;
let subject = null;
let topic = null;

function nextMeaningful(from) {
  for (let i = from + 1; i < lines.length; i++) {
    if (lines[i]) return lines[i];
  }
  return "";
}

lines.forEach((line, i) => {
  if (!line) return;

  let m = line.match(/^GFA Grade (\d+)$/i);
  if (m) { grade = Number(m[1]); return; }

  if (STRANDS.indexOf(line) !== -1 && /^Semester \d+$/i.test(nextMeaningful(i))) {
    strand = line; subject = null; topic = null; return;
  }

  m = line.match(/^Semester (\d+)$/i);
  if (m) { semester = Number(m[1]); subject = null; topic = null; return; }

  m = line.match(/^Topic\s+(\d+)\s*:\s*(.*)$/i);
  if (m) {
    topic = { number: Number(m[1]), title: m[2].trim(), handout: null, videos: [] };
    if (NA.test(topic.title) || !topic.title) { topic = null; return; }
    rows.push({ grade, strand, semester, subject, topic });
    return;
  }

  m = line.match(/^Handout\s*:\s*(.*)$/i);
  if (m) { if (topic && !NA.test(m[1]) && m[1]) topic.handout = m[1].trim(); return; }

  m = line.match(/^Video Guide\s*:\s*(.*)$/i);
  if (m) { if (topic && !NA.test(m[1]) && m[1]) topic.videos.push(m[1].trim()); return; }

  if (/^https?:\/\//i.test(line)) { if (topic) topic.videos.push(line); return; }

  if (strand && semester !== null) { subject = line; topic = null; }
});

const SUBJECT_NAMES = {
  ACCT1: "Fundamentals of Accountancy, Business and Management 1",
  ACCT2: "Fundamentals of Accountancy, Business and Management 2",
  ORCOM: "Oral Communication in Context",
  ORGMA: "Organization and Management",
  PHYSCI: "Physical Science",
  UCSP: "Understanding Culture, Society and Politics",
  WLNS4: "Wellness 4",
  WLNS5: "Wellness 5",
  WLNS6: "Wellness 6",
  DISS: "Disciplines and Ideas in the Social Sciences",
  PPG: "Philippine Politics and Governance",
  ECON: "Applied Economics",
  ENTREP: "Entrepreneurship",
  MRKTG: "Principles of Marketing",
  PHILO: "Introduction to the Philosophy of the Human Person",
  BUSFIN: "Business Finance",
  BUSMATH: "Business Mathematics",
  ETHICS: "Business Ethics and Social Responsibility",
  PERSDEV: "Personal Development",
  WICA: "Work Immersion and Culminating Activity",
  EMTECH: "Empowerment Technologies",
  GENMATH: "General Mathematics",
  GENBIO1: "General Biology 1",
  GENBIO2: "General Biology 2",
  GENCHEM1: "General Chemistry 1",
  GENCHEM2: "General Chemistry 2",
  GENPHY1: "General Physics 1",
  GENPHY2: "General Physics 2",
  PRECAL: "Pre-Calculus",
  BASCAL: "Basic Calculus",
  STATPROB: "Statistics and Probability",
  EARTHSCI: "Earth Science",
  DRRR: "Disaster Readiness and Risk Reduction",
  RWS: "Reading and Writing Skills",
  EAPP: "English for Academic and Professional Purposes",
  PR1: "Practical Research 1",
  PR2: "Practical Research 2",
  MIL: "Media and Information Literacy",
  CPAR: "Contemporary Philippine Arts from the Regions",
  LIT21: "21st Century Literature from the Philippines and the World",
  KOMPAN: "Komunikasyon at Pananaliksik sa Wika at Kulturang Filipino",
  PAGBASA: "Pagbasa at Pagsusuri ng Iba't Ibang Teksto",
  FILPIL: "Filipino sa Piling Larangan",
  CSS: "Computer Systems Servicing",
  CESC: "Community Engagement, Solidarity and Citizenship",
  DIASS: "Disciplines and Ideas in the Applied Social Sciences",
  TNCT: "Trends, Networks and Critical Thinking",
  CW: "Creative Writing",
  CNF: "Creative Nonfiction",
  WRBS: "World Religions and Belief Systems",
  ANIM1: "Animation 1",
  PROG1: "Computer Programming 1",
  BIO1: "General Biology 1"
};

const catalogue = {};
const stats = { topics: 0, handouts: 0, videos: 0, empty: 0, unknownCodes: new Set() };

rows.forEach(row => {
  const t = row.topic;
  if (!t.handout && !t.videos.length) { stats.empty += 1; return; }
  stats.topics += 1;
  if (t.handout) stats.handouts += 1;
  stats.videos += t.videos.length;
  if (!SUBJECT_NAMES[row.subject]) stats.unknownCodes.add(row.subject);

  const strandKey = row.strand.toLowerCase();
  catalogue[strandKey] = catalogue[strandKey] || { code: row.strand, semesters: {} };
  const sem = catalogue[strandKey].semesters;
  sem[row.semester] = sem[row.semester] || { subjects: {} };
  const subs = sem[row.semester].subjects;
  subs[row.subject] = subs[row.subject] || { code: row.subject, name: SUBJECT_NAMES[row.subject] || row.subject, topics: [] };
  subs[row.subject].topics.push({
    n: t.number,
    title: t.title,
    handout: t.handout,
    videos: t.videos
  });
});

const out = {
  grade: rows.length ? rows[0].grade : null,
  strands: Object.keys(catalogue).map(key => {
    const s = catalogue[key];
    return {
      id: key,
      code: s.code,
      semesters: Object.keys(s.semesters).sort().map(n => ({
        number: Number(n),
        subjects: Object.keys(s.semesters[n].subjects)
          .sort()
          .map(code => s.semesters[n].subjects[code])
      }))
    };
  })
};

const banner = "window.SHELF = ";
fs.writeFileSync(target, banner + JSON.stringify(out, null, 2) + ";\n");

console.log("topics with material : " + stats.topics);
console.log("handouts             : " + stats.handouts);
console.log("video links          : " + stats.videos);
console.log("skipped (no links)   : " + stats.empty);
if (stats.unknownCodes.size) {
  console.log("subject codes without a full name: " + [...stats.unknownCodes].join(", "));
}
out.strands.forEach(s => {
  s.semesters.forEach(sem => {
    const n = sem.subjects.reduce((a, x) => a + x.topics.length, 0);
    console.log("  " + s.code.padEnd(6) + " sem " + sem.number + "  " +
      String(sem.subjects.length).padStart(2) + " subjects  " + String(n).padStart(3) + " topics");
  });
});
console.log("written to " + target);
