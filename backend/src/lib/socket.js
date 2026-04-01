import {Server} from "socket.io";
import http from "http";
import express from "express";
import ENV from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../models/Message.js";

const app=express()
const server = http.createServer(app)
const io = new Server(server,{
    cors:{
        origin: ENV.CLIENT_URL,
        credentials: true
    }
})

//apply authentication middleware to all socket connections 
io.use(socketAuthMiddleware);

//we will use this function to check if the user is online or not
export function getReceiverSocketId(userId){
    return userSocketMap[userId]
}

//this is for string online users
const userSocketMap={} //{userId:socketId}

io.on("connection",(socket)=>{
    console.log('A user connected :',socket.user.fullName)
    const userId = socket.userId
    userSocketMap[userId] = socket.id

    //io.emit() is used to send events to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
    
    //with socket.on() we can listen to events from clients
    socket.on("disconnect",()=>{
        console.log('A user disconnected',socket.user.fullName);
        delete userSocketMap[userId]
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })

    socket.on("mark-as-seen", async ({ senderId, userId }) => {
      try {
        // 1. Update all messages in this conversation as 'seen'
        await Message.updateMany(
          {
            senderId: senderId, // The person who sent the messages
            receiverId: userId, // The current user who just opened them
            status: { $ne: "seen" },
          },
          { $set: { status: "seen", seenAt: new Date().toISOString() } },
        );
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages-seen-update", {
            seenBy: userId, // The person who just read the messages
          });
        }

      } catch (error) {
        console.error("Error updating seen status:", error);
      }
    });
   
         
})

export {io,app,server}