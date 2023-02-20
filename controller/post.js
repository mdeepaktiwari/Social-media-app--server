import Post from "../models/post";
import cloudinary from "cloudinary";
import User from "../models/user";
// config cloudinary- we will save uploaded image to some cloud service provider
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const createPost = async (req, res) => {
  const { content, image } = req.body;
  if (!content) {
    return res.json({
      error: "Content is required",
    });
  }
  try {
    const post = new Post({ content, image, postedBy: req.auth._id });
    await post.save();
    const postWithUser = await Post.findById(post._id).populate(
      "postedBy",
      "-password -secret"
    );
    res.json(postWithUser);
  } catch (e) {
    console.log("Error in creating the post", e);
    res.sendStatus(400);
  }
};

export const uploadImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.files.image.path);
    return res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (e) {
    console.log("Error in uploading image to cloudinary", e);
  }
};

export const postByUser = async (req, res) => {
  try {
    // populate beacuse we dont want to show _id
    // sort to show the latest post
    // limit because we dont want to show all data to user at once
    const posts = await Post.find()
      .populate("postedBy", "_id name image")
      .sort({ createdAt: -1 })
      .limit(10);
    console.log(posts);
    return res.json(posts);
  } catch (e) {
    console.log("Error in finding the post the user", e);
  }
};

export const userPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params._id)
      .populate("postedBy", "_id name image")
      .populate("comments.postedBy", "_id name image");
    return res.json(post);
  } catch (e) {
    console.log(e);
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params._id, req.body, {
      new: true,
    });
    res.json(post);
  } catch (e) {
    console.log("Error in updating the post", e);
  }
};

export const deletePost = async (req, res) => {
  try {
    // take id from params passed from client side
    const post = await Post.findByIdAndDelete(req.params._id);

    // remove image from cloudinary
    if (post.image && post.image.public_id) {
      const image = cloudinary.uploader.destroy(post.image.public_id);
    }
    res.json({ ok: true });
  } catch (e) {
    console.log("Error in deleting the post", e);
  }
};

export const newsFeed = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id);
    let following = user.following;
    following.push(req.auth._id);

    // pagination
    // either new page but if nothing is there then show first page as default
    const currentPage = req.params.page || 1;
    const perPage = 3;

    const post = await Post.find({ postedBy: { $in: following } })
      .skip((currentPage - 1) * perPage)
      .populate("postedBy", "_id name image")
      .populate("comments.postedBy", "_id name image")
      .sort({ createdAt: -1 })
      .limit(perPage);
    res.json(post);
  } catch (e) {
    console.log("Error in finding the post in news feed controller", e);
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      // $addToSet not push because we want unique items
      req.body._id,
      {
        $addToSet: { likes: req.auth._id },
      },
      { new: true }
    );
    res.json(post);
  } catch (e) {
    console.log("Error in liking the post", e);
  }
};

export const unlikePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.body._id,
      {
        $pull: { likes: req.auth._id },
      },
      { new: true }
    );
    res.json(post);
  } catch (e) {
    console.log("Error in unliking the post", e);
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId, comment } = req.body;
    console.log(postId);
    const post = await Post.findByIdAndUpdate(
      postId,
      // $push not $addToSet because comment need not be unique
      {
        $push: { comments: { text: comment, postedBy: req.auth._id } },
      },
      { new: true }
    )
      .populate("postedBy", "_id name image")
      .populate("comments.postedBy", "_id name image");

    return res.json(post);
  } catch (e) {
    console.log("Error in adding comment to the post", e);
  }
};

export const removeComment = async (req, res) => {
  try {
    const { postId, comment } = req.body;
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: { _id: comment._id } },
      },
      { new: true }
    );

    res.json(post);
  } catch (e) {
    console.log("Error in removing the comment", e);
  }
};

// total number of post
// required for pagination
export const totalPost = async (req, res) => {
  try {
    const total = await Post.find().estimatedDocumentCount();
    return res.json(total);
  } catch (e) {
    console.log(e);
  }
};

export const posts = async (req, res) => {
  try {
    const user = await Post.find()
      .populate("postedBy", "_id name image")
      .populate("comments.postedBy", "_id name image")
      .sort({ createdAt: -1 })
      .limit(10);
    return res.json(user);
  } catch (e) {
    console.log("Error in fetching post", e);
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params._id)
      .populate("postedBy", "_id name image")
      .populate("comments.postedBy", "_id name image");

    return res.json(post);
  } catch (e) {
    console.log("Error in getting the post ", e);
  }
};
