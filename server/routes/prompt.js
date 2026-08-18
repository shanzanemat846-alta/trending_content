const {
  addPrompt,
  getPrompts,
  prompt_delete,
  getPrompt,
  prompt_update,
} = require("../controllers/promptController");

const router = require("express").Router();

router.get("/pull", getPrompts);
router.get("/:id", getPrompt);
router.post("/", addPrompt);
router.patch("/:id", prompt_update);
router.delete("/:id", prompt_delete);

module.exports = router;
