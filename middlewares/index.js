import { expressjwt } from "express-jwt";
import Post from "../models/post";

// express provide jwt authentication - This checks user is authorized or not
export const requireSignIn = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

// Middleware to check whether the user is same who created the post or not
// post id is send in params and authication details is available in headers
export const canEditDeletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params._id);
    if (req.auth._id != post.postedBy) {
      return res.status(400).send("Unauthorized");
    } else {
      next();
    }
  } catch (e) {
    console.log(e);
  }
};
