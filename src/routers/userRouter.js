import express from "express";
import { get } from "express/lib/response";
import { getEdit, postEdit, remove, logout, see, startGithubLogin, finishGithubLogin, postChangePassword, getChangePassword } from "../controllers/userController";
import { protectorMiddleware, publicOnlyrMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/github/start", publicOnlyrMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyrMiddleware, finishGithubLogin);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/:id", see);

export default userRouter;