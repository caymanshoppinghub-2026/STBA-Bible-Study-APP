const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const docxPath = "data/sda-commentary-imports/The Second Book of Moses Called EXODUS.docx";
const xml = execSync(`unzip -p "${docxPath}" word/document.xml`, { maxBuffer: 50 * 1024 * 1024 }).toString();

const text = xml
  .replace(/<w:tab[^>]*\/>/g, "\t")
  .replace(/<w:br[^>]*\/>/g, "\n")
  .replace(/<w:p[^>]*>/g, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/\r/g, "");

fs.writeFileSync("data/sda-commentary-imports/exodus_extracted_text.txt", text, "utf8");
console.log("Exodus text extracted, length:", text.length, "characters");
console.log("First 1500 chars:\n" + text.substring(0, 1500));
