import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';


// generate jwt token

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// registerUser
const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl = "" } = req.body;
    // check user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exist" });

    }
    // Determine user role:admin is correct

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // create new user
    const user = await User.create({
      name, email, password: hashPassword, profileImageUrl
    });
    // Return user data with jwt
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,

      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id)

    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });

  }
}
// loginuser
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });


    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });

  } catch (error) {

    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });

    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });

  }
}

// update profile
const updateUserProfile = async (req, res) => {
  try {
    // const{name,email,profileImageUrl}=req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });

    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.profileImageUrl = req.body.profileImageUrl || user.profileImageUrl;

    if (req.body.passsword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImageUrl: updatedUser.profileImageUrl,

      token: generateToken(updatedUser.token),
      message: "Profile update Successfully",

    });


  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });

  }
}

// changed password
const changePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check old password
    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    // Update to new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword };