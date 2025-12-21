import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const destDir = path.join(process.cwd(), "uploads", "organizers");
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        console.log("in storage");
        cb(null, destDir);
    },
    filename: (req, file, cb) => {
        const unqSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);

        if (!req.body.name) {
            return cb(new Error("Organizer name is missing"), "");
        }

        cb(null, `org-proof-${req.body.name}-${unqSuffix}${extension}`);
    },
});

// allowed formats
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowed = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/msword",
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Only PDF, images and documents are allowed."
            )
        );
    }
};

export const uploadProof = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 mb
    },
});

// Event image upload configuration
const eventDestDir = path.join(process.cwd(), "uploads", "events");
if (!fs.existsSync(eventDestDir)) {
    fs.mkdirSync(eventDestDir, { recursive: true });
}

const eventStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, eventDestDir);
    },
    filename: (req, file, cb) => {
        const unqSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, `event-cover-${unqSuffix}${extension}`);
    },
});

const imageFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedImages = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
    ];

    if (allowedImages.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images are allowed."));
    }
};

export const uploadEventImage = multer({
    storage: eventStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 mb
    },
});
