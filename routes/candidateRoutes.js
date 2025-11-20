const express = require("express");
const router = express.Router();
const {
  upload,
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
} = require("../Controllers/candidateController");

// Accept profilePicture (single) and documents (array)
const multerFields = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "documents", maxCount: 30 },
]);

router.get("/", getCandidates);
router.get("/:id", getCandidateById);
router.post("/", multerFields, createCandidate);
router.put("/:id", updateCandidate);

module.exports = router;
