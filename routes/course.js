const express = require("express");

const { authenticated } = require("../middlewares/auth");

const courseController = require("../controllers/dashController");

const router = express.Router();

router.post("/add-course", authenticated, courseController.createCourse);
router.put("/edit-course/:id", authenticated, courseController.editCourse);
router.delete("/delete-course/:id", authenticated, courseController.deleteCourse);
router.post("/image-upload", authenticated, courseController.uploadImage);

module.exports = router;
