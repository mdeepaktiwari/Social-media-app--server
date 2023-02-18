import express, { Router } from "express";
const router = express.Router();
import {
  register,
  login,
  currentUser,
  findPeople,
  profileUpdate,
  forgetPassword,
  userFollow,
  addFollower,
  userFollowing,
  removeFollower,
  userUnfollow,
} from "../controller/auth";

// middleware
import { requireSignIn } from "../middlewares";

// routes
// user related request handled from here
router.post("/register", register);
router.post("/login", login);
router.get("/current-user", requireSignIn, currentUser);
router.post("/forget-password", forgetPassword);
router.put("/profile-update", requireSignIn, profileUpdate);
router.get("/find-people", requireSignIn, findPeople);
router.put("/user-follow", requireSignIn, addFollower, userFollow);
router.get("/user-following", requireSignIn, userFollowing);
router.put("/user-unfollow", requireSignIn, removeFollower, userUnfollow);

module.exports = router;
