// server/src/middleware/eventUpload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const destDir = path.join(process.cwd(), "uploads", "events");
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, destDir);
    },
    filename: (req, file, cb) => {
        const unqSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);

        cb(null, `event-banner-${unqSuffix}${extension}`);
    },
});

// allowed formats
const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only image files are allowed."));
    }
};

export const uploadEventBanner = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
    },
});
