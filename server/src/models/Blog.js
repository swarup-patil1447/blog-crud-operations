import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 140 },
    content: { type: String, required: [true, "Content is required"], trim: true },
    author: { type: String, required: [true, "Author is required"], trim: true, maxlength: 80 },
    category: { type: String, required: [true, "Category is required"], trim: true, maxlength: 50 }
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
