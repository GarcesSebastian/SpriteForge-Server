import { Request, Response } from "express";
import { Users } from "../models/users.model";
import jwt from "jsonwebtoken";

/**
 * 
 * @param req 
 * @param res 
 * @param email // email of the user to share with
 * @param sharer // email of the user sharing
 * @returns 
 */
export const _Share = async (req: Request, res: Response) => {
    try {
        const { email, sharer } = req.body;

        if (!email || !sharer) {
            return res.status(400).json({
                message: "Email and sharer are required",
            });
        }

        if (email === sharer) {
            return res.status(400).json({
                message: "You cannot share with yourself",
            });
        }

        const user = await Users.getUserByEmail(email);
        const userSharer = await Users.getUserByEmail(sharer);

        if (!user || !userSharer) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "User shared successfully",
            user,
            userSharer,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "An error occurred while sharing",
        });
    }
}

export const _Auth = async (req: Request, res: Response) => {
    try {
        const { email, username, avatar, context } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        let user = await Users.getUserByEmail(email);

        if (!user) {
            user = await Users.createUser({
                username,
                email,
                avatar,
                context,
            });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
        
        res.status(200).json({
            message: "User logged in successfully",
            token,
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "An error occurred while logging in",
        });
    }
}

export const _Logout = (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "No token provided",
            });
        }

        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: "Invalid token",
                });
            }
        });

        res.status(200).json({
            message: "User logged out successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while logging out",
        });
    }
}