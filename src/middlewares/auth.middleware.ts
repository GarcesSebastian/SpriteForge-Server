import { NextFunction, Request, Response } from "express";
import { Utils } from "../lib/utils";

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "No token provided",
            });
        }

        if (!Utils.verifyToken(token)) {
            return res.status(401).json({
                message: "Invalid token",
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while logging out",
        });
    }
}