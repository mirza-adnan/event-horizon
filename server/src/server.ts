import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

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

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from the server side");
});

app.listen(5050, () => {
    console.log("Server running on http://localhost:5050");
});
