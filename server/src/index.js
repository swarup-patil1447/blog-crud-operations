import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import blogRoutes from "./routes/blogs.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "blog-crud-api" }));
app.use("/api/blogs", blogRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(error.errors).map((e) => e.message).join(", ") });
  }
  if (error.name === "CastError") return res.status(400).json({ message: "Invalid value supplied." });
  res.status(500).json({ message: "An unexpected server error occurred." });
});

try {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blog_crud_app");
  console.log("Connected to MongoDB");
  app.listen(port, () => console.log(`API running at http://localhost:${port}`));
} catch (error) {
  console.error("Could not connect to MongoDB. Check MONGODB_URI in server/.env.", error.message);
  process.exit(1);
}
