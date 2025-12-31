import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next(); // continue to next middleware or route
    }else{

     res.status(401).json({ message: "Not authorized, no token" });
    }


  } catch (error) {
    return res.status(401).json({ 
      message: "Token failed or invalid", 
      error: error.message 
    });

}
};



export default protect;