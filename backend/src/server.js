import express from "express";
import ENV from "./lib/env.js"
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const app = express();
const _dirname = path.resolve();

const PORT = ENV.PORT || 3001;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(_dirname, "../frontend/dist")));
}

app.get("*", (req, res) =>
  res.sendFile(path.join(_dirname, "../frontend/dist/index.html")),
);

app.listen(PORT, () => {
  console.log("server running... on port", PORT);
  connectDB();
});
