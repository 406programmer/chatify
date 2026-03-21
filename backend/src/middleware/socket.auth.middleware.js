import jwt from "jsonwebtoken";
import ENV from "../lib/env.js";
import User from "../models/User.js";

export async function socketAuthMiddleware(socket, next) {
    try {
        //extract token from http-only cookies
        const token = socket.handshake.headers.cookie?.split("; ").find(row=>row.startsWith("jwt="))?.split("=")[1];
        if(!token) {
            console.log('Socket connection rejected: No token provided');
            return next(new Error("Unauthorized - No token provided"));
        }
        //verify the token
        const decoded = jwt.verify(token,ENV.JWT_SECRET)
        if(!decoded) {
            console.log('Socket connection rejected: Invalid token');
            return next(new Error("Unauthorized - Invalid token"));
        }
        //find the user from db
        const user = await User.findById(decoded.userId).select("-password");
        if(!user) {
            console.log('Socket connection rejected: User not found');
            return next(new Error("User not found"));
        }
        //attach the user info to the socket request
        socket.user = user;
        socket.userId = user._id.toString()
        console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`)
        next();

    } catch (error) {
       console.log('Error in socket authentication:',error.messsage);
       next(new Error("Unauthorized - Authentication failed"));
        
    }
}