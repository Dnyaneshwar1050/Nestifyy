import { User } from "../models/user.model.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import fs from "fs"

const registerUser = async (req, res) => {
  try {

    console.log('Request body:', req.body); // Debug
    console.log('Request file:', req.file);

    const {
      name,
      email,
      password,
      role,
      phone,
      profession,
      gender,
      age,
      photo,
      location
    } = req.body;


    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    let photoUrl = '';
    if (req.file) {
      console.log('Uploading file:', req.file);
      try {
        photoUrl = await uploadImage(req.file);
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }

    const user = new User ({
      name,
      email,
      password:hashedPassword,
      role,
      age:Number(age),
      phone,
      profession,
      location,
      gender,
      photo:photoUrl,
    });
    await user.save();

    res.status(201).json({ user: { id: user._id, name, email, photo: photoUrl, phone, age, profession, location, gender } });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "1ba3d7872fad1fe2",
      { expiresIn: process.env.JWT_EXPIRATION || "1d" }
    );
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({
      user: userResponse,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Server error, please try again later',error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };
    delete updateData.password; 
    
    // Handle photo upload if present
    if (req.file) {
      // Delete old photo if exists
      const user = await User.findById(userId);
      if (user && user.photo) {
        // Extract public_id from the URL (assuming Cloudinary)
        const publicId = user.photo.split('/').pop().split('.')[0];
        await deleteImage(publicId);
      }
      
      const result = await uploadImage(req.file.path);
      updateData.photo = result.secure_url;
      // Remove the temp file
      fs.unlinkSync(req.file.path);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: 'Server error, please try again later',error: error.message });
  }
};
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

const updateUser = async (req, res) => {
  try {
    // Verify admin status
    const requestingUserId = req.user.id;
    const requestingUser = await User.findById(requestingUserId);
    
    if (!requestingUser || !requestingUser.isAdmin) {
      return res.status(403).json({ message: 'Only admins can modify user data' });
    }
    
    const userId = req.params.id;
    const updateData = { ...req.body };
    
    // If password is provided, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error in updateUser:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Server error, please try again later', error: error.message });
  }
};

const   deleteUser = async (req, res) => {
  try {
    // Verify admin status
    const requestingUserId = req.user.id;
    const requestingUser = await User.findById(requestingUserId);
    
    if (!requestingUser || !requestingUser.isAdmin) {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }
    
    const userId = req.params.id;
    
    // Don't allow admins to delete themselves
    if (userId === requestingUserId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user had a photo, delete it from storage
    if (deletedUser.photo) {
      const publicId = deletedUser.photo.split('/').pop().split('.')[0];
      await deleteImage(publicId);
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    res.status(500).json({ message: 'Server error, please try again later',error: error.message });
  }
};


export { registerUser, loginUser, updateUserProfile, deleteUser, updateUser, getUserProfile, getUserById };
