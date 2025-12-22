import { Router } from "express";
import { getAllCategories } from "../controllers/categories.controller";
import { requireAdmin } from "../middleware/requireAdmin";
import { categoriesTable } from "../db/schema";
import db from "../db";

const categoriesRouter = Router();

categoriesRouter.get("/all", getAllCategories);
categoriesRouter.post("/", requireAdmin, async (req, res) => {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            return res
                .status(400)
                .json({ message: "Name and slug are required" });
        }

        const [newCategory] = await db
            .insert(categoriesTable)
            .values({ name, slug })
            .returning();

        res.status(201).json({ category: newCategory });
    } catch (error) {
        res.status(500).json({ message: "Error creating category" });
    }
});

export default categoriesRouter;
