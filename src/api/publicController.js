// 业务层
import svgCaptcha from "svg-captcha";
import { setValue, getValue } from "../config/RedisConfig";
import Post from "../model/Post";

class PublicController {
  constructor() {}
  // 获取图片验证码
  async getCaptcha(ctx) {
    const body = ctx.request.query;
    const newCaptcha = svgCaptcha.create({
      size: 4,
      ignoreChars: "0o1il",
      color: true,
      noise: Math.floor(Math.random() * 5),
      width: 150,
      height: 38,
    });
    // 图片有效期为 10 * 60 秒
    setValue(body.sid, newCaptcha.text, 10 * 60);
    ctx.body = {
      code: 200,
      data: newCaptcha.data,
    };
  }
  // 获取热门文章
  // async getHotPost (ctx) {

  // }
  // 获取热门评论/最新评论
  // async getHotComments (ctx) {

  // }
}

export default new PublicController();
