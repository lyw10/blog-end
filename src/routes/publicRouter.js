import Router from "koa-router";
import publicController from "../api/publicController";
import contentController from "../api/contentController";
import userController from "../api/userController";

const router = new Router();

router.prefix("/public");
// 获取图形验证码
router.get("/getCaptcha", publicController.getCaptcha);

// 获取文章列表
router.get("/list", contentController.getPostList);

// 友情链接
router.get("/links", contentController.getLinks);

// 友情链接
router.get("/tips", contentController.getTips);

// 本周热议
router.get("/topWeek", contentController.getTopWeek);

// 确认修改邮件
router.get("/reset-email", userController.updateUsername);

// 获取文章详情
router.get("/content/detail", contentController.getPostDetail);

export default router;
