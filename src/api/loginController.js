import send from "../config/MailConfig";
import bcrypt from "bcrypt";
import moment from "moment";
import jsonwebtoken from "jsonwebtoken";
import config from "../config";
import { checkCode } from "../common/utils";
import User from "../model/User";
import SignRecord from "../model/SignRecord";

class LoginController {
  constructor() {}
  async forget(ctx) {
    const { body } = ctx.request;
    try {
      // body.username -> database -> email
      // 发送邮件
      let result = await send({
        code: "1234",
        expire: moment().add(30, "minutes").format("YYYY-MM-DD HH:mm:ss"),
        email: body.username,
        user: "Brian",
      });
      ctx.body = {
        code: 200,
        data: result,
        msg: "邮件发送成功",
      };
    } catch (e) {
      console.log(e);
    }
  }

  async login(ctx) {
    // 接收用户的数据
    const { body } = ctx.request;
    let sid = body.sid;
    let code = body.code;
    // 验证图片验证码的时效性，正确性
    if (await checkCode(sid, code)) {
      // 验证用户账号密码是否正确
      // mongoDB查库
      let checkUserPasswd = false;
      let user = await User.findOne({ username: body.username });
      if (await bcrypt.compare(body.password, user.password)) {
        checkUserPasswd = true;
      }
      if (checkUserPasswd) {
        const userObj = user.toJSON();
        const arr = ["password", "username", "roles"];
        arr.map((item) => delete userObj[item]);
        // 返回token
        let token = jsonwebtoken.sign({ _id: userObj._id }, config.JWT_SECRET, {
          expiresIn: "1d", // 一天有效期
        });
        // 加入isSign属性
        const signRecord = await SignRecord.findByUid(userObj._id);
        if (signRecord) {
          if (
            moment(signRecord.created).format("YYYY-MM-DD") ===
            moment().format("YYYY-MM-DD")
          ) {
            userObj.isSign = true;
          } else {
            userObj.isSign = false;
          }
          userObj.lastSign = signRecord.created;
        } else {
          // 用户无签到记录
          userObj.isSign = false;
        }
        ctx.body = {
          code: 200,
          data: userObj,
          token: token,
        };
      } else {
        // 用户名，密码验证失败，返回提示
        ctx.body = {
          code: 404,
          msg: "用户名或密码错误",
        };
      }
    } else {
      ctx.body = {
        code: 401,
        msg: "图片验证码错误",
      };
    }
  }

  async reg(ctx) {
    // 接受客户端的数据
    const { body } = ctx.request;
    // 校验验证码（时效性，有效性）
    let sid = body.sid;
    let code = body.code;
    let msg = {};
    let check = true;
    if (await checkCode(sid, code)) {
      // 查库，看username是否被注册
      let user1 = await User.findOne({ username: body.username });
      if (user1 !== null && typeof user1.username !== "undefined") {
        msg.username = ["此邮箱已经注册！"];
        check = false;
      }
      // 查库，看name是否被注册
      let user2 = await User.findOne({ name: body.name });
      if (user2 !== null && typeof user2.name !== "undefined") {
        msg.name = ["此昵称已经注册！"];
        check = false;
      }
      if (check) {
        // 写入数据库
        body.password = await bcrypt.hash(body.password, 5);
        let user = new User({
          username: body.username,
          name: body.name,
          // 密码加密
          password: body.password,
          created: moment().format("YYYY-MM-DD HH:mm:ss"),
        });
        let result = await user.save();
        ctx.body = {
          code: 200,
          data: result,
          msg: "注册成功",
        };
        return;
      }
      ctx.body = {
        code: 500,
        msg: msg,
      };
    } else {
      msg.code = ["验证码已失效，请重新获取！"];
      ctx.body = {
        code: 500,
        msg: msg,
      };
    }
  }
}

export default new LoginController();
