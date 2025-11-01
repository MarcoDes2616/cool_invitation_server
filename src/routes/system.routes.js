const express = require("express");
const {
  registerNewUserEmail,
  verifyEmail,
  login,
  sendAuthTokenController,
  getMe,
  savePushToken,
  sendCustomNotification,
  deletePushToken,
  logout
} = require("../controllers/system.controller");
const verifyJWT = require("../middlewares/auth.middleware");

const systemRouter = express.Router();

systemRouter.route("/registrer_new_user_email")
  .post(registerNewUserEmail);

systemRouter.route("/verify_email_token")
  .post(verifyEmail);

// systemRouter.route("/request_auth_token").post(sendAuthTokenController);

// systemRouter.route("/me").get(verifyJWT, getMe);

// systemRouter.route("/save-push-token").post(savePushToken);

// systemRouter.route("/delete-push-token").post(verifyJWT, deletePushToken);

// systemRouter.route("/logout").post(verifyJWT, logout)

// systemRouter
//   .route("/send-custom-notification")
//   .post(verifyJWT, isAdmin, sendCustomNotification);

module.exports = systemRouter;
