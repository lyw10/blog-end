import Router from "koa-router";
import userController from "../api/userController";

const router = new Router();

router.prefix("/user");

// 用户签到
router.get("/fav", userController.userSignRecord);

// 更新用户基本信息
router.post("/basic", userController.updateUserInfo);

// 修改密码
router.post("/changePassword", userController.changePassword);

export default router;
