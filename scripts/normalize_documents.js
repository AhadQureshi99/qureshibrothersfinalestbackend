const connectDB = require('../config/connectDB');
const Candidate = require('../models/candidateModel');

(async () => {
  try {
    await connectDB();
    console.log('Connected to DB, starting normalization...');

    const candidates = await Candidate.find({}).select('documents resumes');
    console.log(`Found ${candidates.length} candidates`);

    let totalUpdated = 0;
    for (const c of candidates) {
      const docs = Array.isArray(c.documents) ? c.documents : [];
      const resumes = Array.isArray(c.resumes) ? c.resumes : [];

      const docMap = new Map();
      for (const d of docs) {
        const keyCandidates = [d.filename, d.originalName, d.title, (d.url || '').split('/').pop()]
          .filter(Boolean)
          .map(String);
        const key = keyCandidates[0] || JSON.stringify(d);
        if (!docMap.has(key)) {
          docMap.set(key, { ...d.toObject ? d.toObject() : d });
        } else {
          const existing = docMap.get(key);
          // prefer existing date or use current
          if ((!existing.date || existing.date === '') && d.date) existing.date = d.date;
          // prefer originalName if missing
          if ((!existing.originalName || existing.originalName === '') && d.originalName) existing.originalName = d.originalName;
        }
      }

      // resumes dedupe by filename or url basename
      const resumeMap = new Map();
      for (const r of resumes) {
        const key = (r.filename || (r.url || '').split('/').pop() || JSON.stringify(r)).toString();
        if (!resumeMap.has(key)) resumeMap.set(key, r);
      }

      const newDocs = Array.from(docMap.values());
      const newResumes = Array.from(resumeMap.values());

      const changed = newDocs.length !== docs.length || newResumes.length !== resumes.length;
      if (changed) {
        c.documents = newDocs;
        c.resumes = newResumes;
        await c.save();
        totalUpdated++;
        console.log(`Normalized candidate ${c._id}: docs ${docs.length} -> ${newDocs.length}, resumes ${resumes.length} -> ${newResumes.length}`);
      }
    }

    console.log(`Normalization complete. Candidates updated: ${totalUpdated}`);
    process.exit(0);
  } catch (err) {
    console.error('Normalization failed', err);
    process.exit(1);
  }
})();
