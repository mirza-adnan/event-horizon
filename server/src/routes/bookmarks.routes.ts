import { Router } from "express";
import { requireUser } from "../middleware/requireUser";
import { toggleBookmark, getMyBookmarks } from "../controllers/bookmarks.controller";

const router = Router();

router.post("/toggle", requireUser, toggleBookmark);
router.get("/my", requireUser, getMyBookmarks);

export default router;
