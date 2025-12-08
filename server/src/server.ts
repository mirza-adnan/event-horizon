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
    origin: ["*"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Routing
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from the server side");
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
