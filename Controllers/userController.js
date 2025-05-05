import { uploadToCloudinary } from "../config/cloudinary.js";
import userModel from "../Models/userModel.js"; // Import user model
import path from "path"
export const getUserData = async (req, res) => {
    try {
      const userId = req.user.id; // Access from req.user instead of req.body
  
      const user = await userModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      return res.status(200).json({
        success: true,
        userData: {
          profileImage:user.profileImage,
          name: user.name,
          email:user.email,
          isAccountVerified: user.isAccountVerified,
          address:user.address,
          country:user.country

        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

  export const updateUserProfile = async (req, res) => {
    try {
        let { name, email, address, country, profileImage } = req.body;

        // If there is an uploaded file, upload it to Cloudinary
        if (req.file) {
            profileImage = await uploadToCloudinary(req.file.buffer, 'userProfiles'); // 'userProfiles' is the folder name in Cloudinary
        }

        // Make sure the fields have values, if not they should be set to their current values
        name = name || '';  // If name is not provided, use an empty string
        email = email || '';  // Same for email
        address = address || '';  // Same for address
        country = country || '';  // Same for country

        // Update user profile in the database
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id, // Use req.user.id (as set by userAuth middleware)
            {
                name,
                email,
                address,
                country,
                profileImage, // Store the Cloudinary image URL in the DB
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
