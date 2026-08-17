require("dotenv").config();
const connectDB = require("../config/connectDB");
const mongoose = require("mongoose");
const Candidate = require("../models/candidateModel");

async function dedupeDocuments(arr) {
  if (!Array.isArray(arr)) return arr;
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (!item) continue;
    const key =
      (item.filename && String(item.filename).trim()) ||
      (item.originalName && String(item.originalName).trim()) ||
      (item.url && String(item.url).split("/").pop()) ||
      JSON.stringify(item);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function dedupeResumes(arr) {
  if (!Array.isArray(arr)) return arr;
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (!item) continue;
    const key =
      (item.filename && String(item.filename).trim()) ||
      (item.url && String(item.url).split("/").pop()) ||
      JSON.stringify(item);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function run() {
  await connectDB();
  console.log("Connected to DB, starting candidate dedupe...");
  const cursor = Candidate.find().cursor();
  let processed = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const origDocs = (doc.documents || []).length;
    const origRes = (doc.resumes || []).length;
    const newDocs = await dedupeDocuments(doc.documents || []);
    const newRes = await dedupeResumes(doc.resumes || []);
    const changed = newDocs.length !== origDocs || newRes.length !== origRes;
    if (changed) {
      doc.documents = newDocs;
      doc.resumes = newRes;
      await doc.save();
      console.log(
        `Cleaned candidate ${doc._id}: documents ${origDocs}->${newDocs.length}, resumes ${origRes}->${newRes.length}`,
      );
    }
    processed++;
  }
  console.log(`Done. Processed ${processed} candidates.`);
  mongoose.disconnect();
}

run().catch((e) => {
  console.error("Dedupe script failed", e);
  process.exit(1);
});
