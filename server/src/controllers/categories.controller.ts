import { Request, Response } from "express";
import db from "../db";
import { categoriesTable } from "../db/schema";

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await db
            .select({
                name: categoriesTable.name,
                slug: categoriesTable.slug,
                createdAt: categoriesTable.createdAt,
            })
            .from(categoriesTable);

        res.status(200).json({
            categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
