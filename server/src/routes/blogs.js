import { Router } from "express";
import mongoose from "mongoose";
import Blog from "../models/Blog.js";

const router = Router();

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get("/", async (req, res, next) => {
  try {
    const { search = "", category = "" } = req.query;
    const filter = {};
    if (search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { content: { $regex: safeSearch, $options: "i" } },
        { author: { $regex: safeSearch, $options: "i" } }
      ];
    }
    if (category.trim() && category !== "All categories") filter.category = category.trim();
    const blogs = await Blog.find(filter).sort({ updatedAt: -1 });
    res.json(blogs);
  } catch (error) { next(error); }
});

router.get("/categories", async (_req, res, next) => {
  try {
    const categories = await Blog.distinct("category");
    res.json(categories.sort((a, b) => a.localeCompare(b)));
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid blog ID." });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });
    res.json(blog);
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, content, author, category } = req.body;
    if (![title, content, author, category].every((v) => typeof v === "string" && v.trim())) {
      return res.status(400).json({ message: "Title, content, author, and category are required." });
    }
    const blog = await Blog.create({ title, content, author, category });
    res.status(201).json(blog);
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid blog ID." });
    const { title, content, author, category } = req.body;
    if (![title, content, author, category].every((v) => typeof v === "string" && v.trim())) {
      return res.status(400).json({ message: "Title, content, author, and category are required." });
    }
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title: title.trim(), content: content.trim(), author: author.trim(), category: category.trim() },
      { new: true, runValidators: true }
    );
    if (!blog) return res.status(404).json({ message: "Blog not found." });
    res.json(blog);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid blog ID." });
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found." });
    res.json({ message: "Blog deleted successfully.", id: blog._id });
  } catch (error) { next(error); }
});

export default router;
