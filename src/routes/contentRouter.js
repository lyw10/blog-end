import Router from "koa-router";
import contentController from "../api/contentController";

const router = new Router();

router.prefix("/content");

router.post("/upload", contentController.uploadImg);

router.post("/add", contentController.addPost);

export default router;
