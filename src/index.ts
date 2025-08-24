import express from "express";
import { config } from "dotenv";
import http from "http";
import chalk from "chalk";
import { SocketManager } from "./managers/socket.manager";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

config();

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 4000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    handler: (req, res) => {
        res.status(429).json({
            message: "Too many requests from this IP, please try again later.",
        });
    },
}));
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(",") || "*",
    credentials: true,
}));

SocketManager.getInstance(server).start();

app.get("/", (req, res) => {
    res.json({ message: "ok" });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(chalk.green(`Server is running on port ${PORT}`));
});
