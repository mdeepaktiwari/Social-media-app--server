import User from "../models/user";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { comparePassword, hashPassword } from "../helpers/auth";

// user related controllers
export const register = async function (req, res) {
  const { name, email, password, secret } = req.body;

  // server side validation check
  if (!name) {
    return res.json({
      error: "Name is required",
    });
  }
  if (!password || password.length < 6) {
    return res.json({
      error: "Password is required and should atleast 6 character long",
    });
  }
  if (!secret) {
    return res.json({
      error: "Security question is required",
    });
  }
  const exist = await User.findOne({ email });
  if (exist) {
    return res.json({
      error: "Email already exist",
    });
  }
  const hashedPassword = await hashPassword(password);
  const user = new User({
    name,
    email,
    password: hashedPassword,
    secret,
    username: nanoid(6),
  });
  try {
    await user.save();
    // console.log("Registered user ", user);
    return res.json({
      ok: true,
    });
  } catch (e) {
    console.log("Registration failed => ", e);
    return res.json({
      error: "Some went wrong! Try again later.",
    });
  }
};

export const login = async function (req, res) {
  try {
    // check if our db has user with that email
    // for unique email
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "No user found",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({
        error: "Incorrect Username/Password",
      });
    }

    // create signed token
    // This is required so that user need not to signin again and again
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // Password queried from database will not be sent for security
    user.password = undefined;
    user.secret = undefined;
    return res.json({
      token,
      user,
    });
  } catch (e) {
    return res.json({
      error: "Error Try Again",
    });
  }
};

export const currentUser = async (req, res) => {
  console.log(req.auth);
  try {
    const user = await User.findById(req.auth._id);
    res.json({
      ok: true,
    });
  } catch (e) {
    console.log("Error in finding the current user", e);
    res.sendStatus(400);
  }
};

export const forgetPassword = async (req, res) => {
  const { email, newPassword, secret } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.json({
      error: "New password is required and should be 6 character long",
    });
  }
  if (!secret) {
    return res.json({
      error: "Secret is required",
    });
  }
  const user = await User.findOne({ email, secret });
  if (!user) {
    return res.json({
      error: "Cannot verify",
    });
  }

  // once user details is verified then we again have to save new password in hashed form
  try {
    const hashedPassword = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });
    return res.json({
      success: "Password reset successfully",
    });
  } catch (e) {
    console.log("Error in forget password controller", e);
    return res.json({
      error: "Something went wrong",
    });
  }
};

export const profileUpdate = async (req, res) => {
  try {
    const data = {};
    if (req.body.username) {
      data.username = req.body.username;
    }
    if (req.body.about) {
      data.about = req.body.about;
    }
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.json({
          error: "Password is required and should be 6 character long",
        });
      }
      data.password = req.body.password;
    }
    if (req.body.about) {
      data.about = req.body.about;
    }
    if (req.body.image) {
      data.image = req.body.image;
    }
    if (req.body.secret) {
      data.secret = await hashPassword(req.body.secret);
    }
    let user = await User.findByIdAndUpdate(req.auth._id, data, { new: true });
    if (!user) {
      return res.json({
        error: "Something went wrong. Please Try again later",
      });
    }
    user.password = undefined;
    user.secret = undefined;
    return res.json(user);
  } catch (e) {
    if (e.code == 11000) {
      return res.json({
        error: "User name already taken",
      });
    }
    console.log("Error in updating the profile", e);
  }
};

// to suggest people
export const findPeople = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id);
    let following = user.following;
    following.push(user._id);
    // we dont want to suggest user to follow himself and people he has alreadt followed
    // $nin not including
    const people = await User.find({ _id: { $nin: following } })
      // remove password and secret
      .select("-password -secret")
      .limit(10);
    return res.json(people);
  } catch (e) {
    console.log("Error in finding people", e);
  }
};

// to add following in current user list
export const userFollow = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.auth._id,
      {
        $addToSet: {
          following: req.body._id,
        },
      },
      // to return updated user object
      { new: true }
    ).select("-password -secret");
    res.json(user);
  } catch (e) {
    console.log("Error in following the user in userFollow controller", e);
  }
};

// middleware
// to add follower in list of follower which current user has followed
export const addFollower = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.body._id, {
      $addToSet: { followers: req.auth._id },
    });
    next();
  } catch (e) {
    console.log("Error in adding followers", e);
  }
};

// to get all user which current user has followed
export const userFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id);
    const following = await User.find({ _id: user.following }).limit(100);
    res.json(following);
  } catch (e) {
    console.log(
      "Error in finding the following list in userFollowing controller",
      e
    );
  }
};

// middleware
// to remove follower in list of followers which current user has unfollowed
export const removeFollower = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.body._id, {
      $pull: { followers: req.auth._id },
    });
    next();
  } catch (e) {
    console.log("Error in removing the current user from list of followers", e);
  }
};

export const userUnfollow = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.auth._id,
      {
        $pull: {
          following: req.body._id,
        },
      },
      { new: true }
    );
    return res.json(user);
  } catch (e) {
    console.log("Error in unfollowing the user in userUnfollow controller", e);
  }
};
