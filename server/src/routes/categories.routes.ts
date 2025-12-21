import { Router } from "express";
import { getAllCategories } from "../controllers/categories.controller";

const categoriesRouter = Router();

categoriesRouter.get("/all", getAllCategories);

export default categoriesRouter;
