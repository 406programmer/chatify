import express from "express";
import ENV from "./lib/env.js"
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser"
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

const _dirname = path.resolve();

const PORT = ENV.PORT || 3001;

app.use(express.json({limit : "15mb"}));
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(_dirname, "../frontend/dist")));
}

app.get("*", (req, res) =>
  res.sendFile(path.join(_dirname, "../frontend/dist/index.html")),
);

server.listen(PORT, () => {
  console.log("server running... on port", PORT);
  connectDB();
});
