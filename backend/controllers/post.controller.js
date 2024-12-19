import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js"; // Import Notification model

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        if (!text && !img) {
            return res.status(400).json({ message: "Please add some text or image" });
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            if (uploadedResponse?.secure_url) {
                img = uploadedResponse.secure_url;
            } else {
                return res.status(400).json({ message: "Failed to upload image" });
            }
        }

        const newPost = new Post({
            user: userId,
            text,
            img,
        });
        await newPost.save();

        res.status(200).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("Error in createPost:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "You are not authorized to delete this post" });
        }

        if (post.img) {
            const imgId = post.img.split("/").at(-1).split(".").at(0);
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error in deletePost:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id.toString();
        const postId = req.params.id;

        if (!text) {
            return res.status(400).json({ message: "Please add some text" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = { user: userId, text };
        post.comments.push(comment);
        await post.save();

        res.status(200).json({ message: "Comment added successfully", post });
    } catch (error) {
        console.error("Error in commentPost:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { id: postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            // Unliking post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            return res.status(200).json({ message: "Post disliked successfully", post });
        } else {
            // Liking post
            await Post.updateOne({ _id: postId }, { $push: { likes: userId } });

            // Creating notification for like
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
            });
            await notification.save();

            return res.status(200).json({ message: "Post liked successfully", post });
        }
    } catch (error) {
        console.error("Error in likeUnlikePost:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const allPost = async (req, res) => {
    try {
        const post = await Post.find().sort({createdAt: -1})
        if(post.length === 0){
            return res.status(200).json([])
        }
        res.status(200).json(post)
    } catch (error) {
        console.log("Error in allPost:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
}