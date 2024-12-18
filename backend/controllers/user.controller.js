import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs'
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res)=>{
    const {username} = req.params;
    try {
        const user = await User.findOne({username}).select('-password')
        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        res.status(200).json(user)
    } catch (error) {
        console.log("Error in getting the profile")
        res.status(500).json({error: error.message})
    }
}
export const followUnfollowUser = async (req, res)=>{
    
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser =  await User.findById(req.user._id)
        if(id === req.user._id.toString()){
            return res.status(400).json({error: "you cant follow yourself"})
        }
        if(!userToModify || !currentUser){
            return res.status(400).json({error: "user not found"})
        }
        const isFollowing = currentUser.following.includes(id)
        if(isFollowing){
            //unfollow the user
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}})
            res.status(200).json({message: "useres unfollowed"})
        }else{
            //follow the user
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}})
            res.status(200).json({message: "useres followed"})


            //send notifcation to the user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id   
            })
            await newNotification.save()
            //todo : return the id  of the id response
            res.status(200).json({message: "user followed succesfully"})
        }
    } catch (error) {
        console.log("error in user controller", error.message);
        res.status(500).json({ error: "Error occurred while following/unfollowing" });
    }
}
export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const userFollowedByme = await User.findById(userId).select('following');
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            {
                $sample: { size: 10 }
            }
        ]);
        const filteredUser = users.filter(user => !userFollowedByme.following.includes(user._id));
        const suggestedUsers = filteredUser.slice(0, 4);
        
        suggestedUsers.forEach((user) => {
            user.password = null;
        });

        res.status(200).json(suggestedUsers); // send suggested users as response
    } catch (error) {
        console.log("Error in getSuggestedUser:", error.message);
        res.status(500).json({ error: error.message });
    }
}
export const updateUserProfile = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Handle password update logic
        if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide both current and new password" });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcryptjs.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters" });
            }

            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(newPassword, salt);
        }

        // Handle profile image upload
        if (profileImg) {
            if (user.profileImg) {
                const publicId = user.profileImg.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadedProfileImg = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedProfileImg.secure_url;
        }

        // Handle cover image upload
        if (coverImg) {
            const uploadedCoverImg = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedCoverImg.secure_url;
        }

        // Update user fields
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        // Save updated user details
        await user.save();
        user.password = undefined; // Ensure password is not sent back in response

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error in updateUserProfile:", error.message);
        res.status(500).json({ error: error.message });
    }
};
