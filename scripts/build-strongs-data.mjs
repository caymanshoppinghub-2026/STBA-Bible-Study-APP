/**
 * Builds src/data/strongs.json.gz from the Open Scriptures Strong's dictionaries
 * (https://github.com/openscriptures/strongs — CC-BY-SA, derived from Strong's 1890/1894 public-domain text).
 *
 * Usage: node scripts/build-strongs-data.mjs <greek-dictionary.js> <hebrew-dictionary.js>
 * Output shape: { g: { "5485": [lemma, translit, pron, def, derivation, kjv] }, h: { ... } }
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const [, , greekPath, hebrewPath] = process.argv;
if (!greekPath || !hebrewPath) {
  console.error("Usage: node scripts/build-strongs-data.mjs <greek.js> <hebrew.js>");
  process.exit(1);
}

function loadDict(file) {
  const t = fs.readFileSync(file, "utf8");
  const start = t.indexOf("{", t.indexOf("var"));
  const end = t.lastIndexOf("}");
  return JSON.parse(t.slice(start, end + 1));
}

const fold = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z' -]/g, "")
    .trim();

const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

const out = { g: {}, h: {} };

const greek = loadDict(greekPath);
for (const [key, e] of Object.entries(greek)) {
  const num = key.replace(/^G/i, "");
  // Open Scriptures' Greek file has no Strong's-style respelling, so use the ASCII-folded transliteration
  out.g[num] = [clean(e.lemma), clean(e.translit), fold(e.translit), clean(e.strongs_def), clean(e.derivation), clean(e.kjv_def)];
}

const hebrew = loadDict(hebrewPath);
for (const [key, e] of Object.entries(hebrew)) {
  const num = key.replace(/^H/i, "");
  out.h[num] = [clean(e.lemma), clean(e.xlit), clean(e.pron), clean(e.strongs_def), clean(e.derivation), clean(e.kjv_def)];
}

const dest = path.join(process.cwd(), "src", "data", "strongs.json.gz");
fs.writeFileSync(dest, zlib.gzipSync(Buffer.from(JSON.stringify(out), "utf8"), { level: 9 }));
console.log(`Wrote ${dest}: ${Object.keys(out.g).length} Greek + ${Object.keys(out.h).length} Hebrew entries`);
