import express from "express";

import mongoose from "mongoose";
import Idea from "../models/Ideas.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

//@route        GET /api/ideas
//@description  Get all ideas
//@access       public
//@query        _limit (optional limit for ideas returned)
router.get("/", async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit);
    const query = Idea.find().sort({ createdAt: -1 });

    if (!isNaN(limit)) {
      query.limit(limit);
    }
    const ideas = await query.exec();
    res.json(ideas);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//@route        GET /api/ideas/:id
//@description  Get single Idea
//@access       public

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not found");
    }
    const idea = await Idea.findById(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea Not found");
    }
    res.json(idea);
  } catch (err) {
    console.log(err);
    next(err);
  }
});
//@route        POST /api/ideas
//@description  Create a new idea
//@access       public
router.post("/", protectRoute, async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body || {};
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary and description are required");
    }
    const newIdea = new Idea({
      title,
      summary,
      description,
      tags:
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : [],
      user: req.user._id,
    });
    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (err) {
    console.log(err);
    next(err);
  }
});
//@route        DELETE /api/ideas/:id
//@description  Delete idea
//@access       public

router.delete("/:id", protectRoute, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    //find the idea from the database by id
    const idea = await Idea.findById(id);
    //Handle missing idea
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }

    //Check if the logged-in user owns the idea
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User not authorized to delete this idea");
    }
    //delete the idea document from the database
    await idea.deleteOne();

    res.json({
      message: "Idea successfully deleted",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});
//@route        PUT /api/ideas/:id
//@description  Update idea
//@access       public
router.put("/:id", protectRoute, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    //find the idea by id
    const idea = await Idea.findById(id);
    //handle missing idea
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }
    //Check if the logged-in owns this idea
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("This is user is not authorized to update this idea");
    }

    //Extract the field from the request body
    const { title, summary, description, tags } = req.body || {};
    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title, summary and description are required");
    }
    //mutate the existing idea document in the database
    idea.title = title;
    idea.summary = summary;
    idea.description = description;
    idea.tags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(boolean)
      : [];
    //save the changes to database
    const updatedIdea = await idea.save();

    res.json(updatedIdea);
  } catch (err) {
    console.log(err);
    next(err);
  }
});
export default router;
