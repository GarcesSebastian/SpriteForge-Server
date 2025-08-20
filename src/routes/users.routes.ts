import { Router } from "express";
import { _Auth, _Logout, _Share } from "../controllers/users.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const app = Router();

app.post("/auth", _Auth);
app.post("/share", AuthMiddleware, _Share);
app.post("/logout", _Logout);

export default app;