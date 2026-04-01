import ENV from "../lib/env.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
export async function protectRoute(req, res, next) {
  try {
    const token = req.cookies.jwt;
    if (!token)
      return res
        .status(401)
        .json({ messsage: "Unauthorized - No token provided" });

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ messsage: "Unauthorized - Invalid token" });
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(404).json({ messsage: "User not found" });
    req.user = user;
   
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    res.status(500).json({ messsage: "Internal server error" });
  }
}
