// Generates assets/json/hadithBooks.json (book + section metadata bundled in the app).
// usage: node scripts/generate-hadith-books.js <output.json> <source dir>
// <source dir> must contain:
//   info.json            from https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/info.json
//   hj_<book>.json       from https://raw.githubusercontent.com/AhmedBaset/hadith-json/v1.2.0/db/by_book/the_9_books/<book>.json
const fs = require("fs");
const path = require("path");

const info = require(path.resolve(process.argv[3], "info.json")); // fawazahmed0/hadith-api@1 /info.json
const BOOKS = [
  ["bukhari", "sahihain"],
  ["muslim", "sahihain"],
  ["abudawud", "sunan"],
  ["tirmidhi", "sunan"],
  ["nasai", "sunan"],
  ["ibnmajah", "sunan"],
  ["malik", "other"],
];

const norm = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
const clean = (s) => s.trim().replace(/\s+/g, " ");

const out = BOOKS.map(([key, group]) => {
  const fz = info[key];
  const hj = require(path.resolve(process.argv[3], `hj_${key}.json`)); // AhmedBaset/hadith-json@v1.2.0 by_book
  const arabicByEnglish = new Map(hj.chapters.map((c) => [norm(c.english), c.arabic]));

  // Section membership comes from each hadith's reference.book: fawaz section_details
  // ranges are wrong for some books (e.g. ibnmajah sections 10-14 overlap).
  // reference.book === 0 means "unknown" except where section 0 is a real, titled
  // section (muslim Introduction, ibnmajah Book of the Sunnah).
  // A few hadiths carry a reference.book that sits inside another section's block
  // (e.g. muslim #388 -> section 16). They stay in their referenced section, but are
  // excluded from the displayed range so ranges don't balloon and overlap.
  const sec0Title = (fz.metadata.sections["0"] || "").trim();
  const sec0 = fz.metadata.section_details["0"];
  const isRealSec0 = (num) =>
    sec0Title && num >= sec0.hadithnumber_first && num <= sec0.hadithnumber_last;
  const known = fz.hadiths
    .filter((h) => h.reference.book !== 0 || isRealSec0(h.hadithnumber))
    .map((h) => ({ num: h.hadithnumber, sec: h.reference.book }))
    .sort((a, b) => a.num - b.num);

  const stats = new Map();
  const get = (n) => {
    if (!stats.has(n)) stats.set(n, { first: Infinity, last: -Infinity, count: 0 });
    return stats.get(n);
  };
  // Displayed range = the section's main block in number order. Runs of the same
  // section separated by <= MAX_GAP stray hadiths are merged into one block; stray
  // hadiths elsewhere still count toward their referenced section.
  const MAX_GAP = 3;
  const runs = [];
  for (const h of known) {
    const last = runs[runs.length - 1];
    if (last && last.sec === h.sec) {
      last.end = h.num;
      last.len++;
    } else {
      runs.push({ sec: h.sec, start: h.num, end: h.num, len: 1 });
    }
  }
  const blocks = new Map(); // sec -> best { start, end, len }
  for (let i = 0; i < runs.length; i++) {
    const sec = runs[i].sec;
    let block = { start: runs[i].start, end: runs[i].end, len: runs[i].len };
    let gap = 0;
    for (let j = i + 1; j < runs.length; j++) {
      if (runs[j].sec === sec) {
        block = { start: block.start, end: runs[j].end, len: block.len + runs[j].len };
        gap = 0;
      } else {
        gap += runs[j].len;
        if (gap > MAX_GAP) break;
      }
    }
    const best = blocks.get(sec);
    if (!best || block.len > best.len) blocks.set(sec, block);
  }
  for (const h of known) get(h.sec).count++;
  for (const [sec, block] of blocks) {
    get(sec).first = block.start;
    get(sec).last = block.end;
  }

  // reference.book === 0 outside a real section 0 means "unknown": place by core range,
  // falling back to the closest preceding section.
  const ranges = [...stats].map(([n, s]) => ({ n, first: s.first, last: s.last }));
  for (const h of fz.hadiths) {
    if (h.reference.book !== 0 || isRealSec0(h.hadithnumber)) continue;
    const num = h.hadithnumber;
    const inside = ranges.find((r) => num >= r.first && num <= r.last);
    const prev = ranges.filter((r) => r.first <= num).sort((a, b) => b.first - a.first)[0];
    const target = inside || prev;
    if (!target) throw new Error(`${key}: cannot place hadith ${num}`);
    const s = get(target.n);
    s.count++;
    // Unknown hadiths following a section's block (e.g. nasai's second Agriculture
    // chapter) extend its displayed range; the overlap check below guards this.
    if (!inside) s.last = Math.max(s.last, num);
  }

  const sections = Object.entries(fz.metadata.sections)
    .map(([n, english]) => [Number(n), english])
    .filter(([n]) => stats.has(n))
    .sort((a, b) => a[0] - b[0])
    .map(([n, english]) => {
      const arabic = arabicByEnglish.get(norm(english));
      if (!arabic) throw new Error(`No Arabic title for ${key} section ${n}: ${english}`);
      const { first, last, count } = stats.get(n);
      return { number: n, title: clean(arabic), first, last, count };
    });

  for (let i = 1; i < sections.length; i++) {
    if (sections[i].first <= sections[i - 1].last) {
      console.log(`  OVERLAP ${key}: ${sections[i - 1].number}[${sections[i - 1].first}-${sections[i - 1].last}] vs ${sections[i].number}[${sections[i].first}-${sections[i].last}]`);
    }
  }

  const sectionTotal = sections.reduce((a, s) => a + s.count, 0);
  if (sectionTotal !== fz.hadiths.length) {
    throw new Error(`${key}: ${sectionTotal} hadiths in sections vs ${fz.hadiths.length} total`);
  }

  return {
    key,
    edition: `ara-${key}`,
    title: clean(hj.metadata.arabic.title),
    author: clean(hj.metadata.arabic.author),
    group,
    hadithCount: fz.hadiths.length,
    hasGrades: fz.hadiths.some((h) => h.grades.length > 0),
    sections,
  };
});

const target = process.argv[2];
fs.writeFileSync(target, JSON.stringify(out, null, 2) + "\n");
for (const b of out) {
  console.log(
    b.key.padEnd(9),
    "sections",
    String(b.sections.length).padStart(3),
    "hadiths",
    String(b.hadithCount).padStart(5),
    "grades",
    b.hasGrades,
  );
}
console.log("wrote", path.resolve(target), fs.statSync(target).size, "bytes");
