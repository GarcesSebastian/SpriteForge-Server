import express from "express";
import { config } from "dotenv";
import { Server } from "http";
import chalk from "chalk";
import { SocketManager } from "./managers/socket.manager";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import usersRoutes from "./routes/users.routes";

config();

const app = express();
const server = new Server(app);
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    handler: (req, res, next, options) => {
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

app.use("/users", usersRoutes);

server.listen(PORT, () => {
    console.log(chalk.green(`Server is running on port ${PORT}`));
});