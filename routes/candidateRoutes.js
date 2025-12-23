const express = require("express");
const router = express.Router();
const {
  upload,
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  uploadProfilePicture,
  deleteCandidate,
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
router.delete("/:id", deleteCandidate);

// route to upload/update profile picture for existing candidate
router.post(
  "/:id/profile-picture",
  upload.single("profilePicture"),
  uploadProfilePicture
);

module.exports = router;
