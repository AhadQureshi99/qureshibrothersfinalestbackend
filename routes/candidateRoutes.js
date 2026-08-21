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

// Accept profilePicture (single), documents (array), and resumes (array)
const multerFields = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "documents", maxCount: 30 },
  { name: "resumes", maxCount: 30 },
]);

router.get("/", getCandidates);
router.get("/:id", getCandidateById);
const verifyJWT = require("../middelwares/authMiddleware");
router.post("/", verifyJWT, multerFields, createCandidate);
router.put("/:id", verifyJWT, multerFields, updateCandidate);
router.patch("/:id", verifyJWT, multerFields, updateCandidate);
router.delete("/:id", verifyJWT, deleteCandidate);

// route to upload/update profile picture for existing candidate
router.post(
  "/:id/profile-picture",
  verifyJWT,
  upload.single("profilePicture"),
  uploadProfilePicture,
);

module.exports = router;
