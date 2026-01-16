import "dotenv/config";

import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import router from "./routes";

// Middleware
const app = express();
app.use(express.json());
app.use(cookieParser());
const corsOptions: cors.CorsOptions = {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use("/uploads", express.static("uploads"));

// Routing
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from the server side");
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
