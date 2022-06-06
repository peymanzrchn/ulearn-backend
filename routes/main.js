const express = require("express");

const mainController = require("../controllers/mainController");

const router = express.Router();

router.get("/courses", mainController.getCourses);
router.get("/course/:id", mainController.getSingleCourse);
router.post("/contact", mainController.handleContactPage);
router.get("/captcha.png", mainController.getCaptcha);

module.exports = router;
