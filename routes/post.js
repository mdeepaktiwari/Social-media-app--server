import express from "express";
import formidable from "express-formidable";
const router = express.Router();
import {
  createPost,
  uploadImage,
  postByUser,
  userPost,
  updatePost,
  newsFeed,
  deletePost,
  totalPost,
  unlikePost,
  likePost,
  addComment,
  removeComment,
  posts,
  getPost,
} from "../controller/post";

// middleware
import { requireSignIn, canEditDeletePost, isAdmin } from "../middlewares";

// router
// post related request taken up here
router.post("/create-post", requireSignIn, createPost);

// For handling form data formidable is used
router.post(
  "/upload-image",
  requireSignIn,
  formidable({ maxFileSize: 10 * 1024 * 1024 }),
  uploadImage
);
router.delete(
  "/delete-post/:_id",
  requireSignIn,
  canEditDeletePost,
  deletePost
);
router.get("/user-post/:_id", requireSignIn, userPost);
router.put("/update-post/:_id", requireSignIn, canEditDeletePost, updatePost);
router.get("/user-post", requireSignIn, postByUser);
router.get("/news-feed/:page", requireSignIn, newsFeed);
router.put("/like-post", requireSignIn, likePost);
router.put("/add-comment", requireSignIn, addComment);
router.put("/remove-comment", requireSignIn, removeComment);
router.put("/unlike-post", requireSignIn, unlikePost);
router.get("/total-post", totalPost);
router.get("user-post/:_id", userPost);
router.get("/posts", posts);
router.get("/post/:_id", getPost);

// admin access
router.delete(
  "/admin/delete-post/:_id",
  requireSignIn,
  isAdmin,
  deletePost
);
module.exports = router;
