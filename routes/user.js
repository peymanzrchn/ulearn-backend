const express = require("express");

const userController = require("../controllers/userController");

const router = express.Router();

router.post("/login", userController.handleLogin);
router.post("/register", userController.createUser);
router.post("/forget-password", userController.handleForgetPassword);
router.post("/reset-password/:token", userController.handleResetPassword);

module.exports = router;
