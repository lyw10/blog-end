import SignRecord from "../model/SignRecord";
import { getJWTPayload } from "../common/utils";
import User from "../model/User";
import moment from "dayjs";
import send from "../config/MailConfig";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getValue, setValue } from "../config/RedisConfig";
import config from "../config";

class UserController {
  // 用户签到
  async userSignRecord(ctx) {
    // 取用户的id
    const obj = await getJWTPayload(ctx.header.authorization);
    // 查用户上次签到记录
    const record = await SignRecord.findByUid(obj._id);
    const user = await User.findByID(obj._id);
    let result = "";
    let newRecord = {};
    // 判断签到逻辑
    if (record) {
      // 有历史签到数据
      // 判断上次签到是否与今天相同
      if (
        moment(record.created).format("YYYY-MM-DD") ===
        moment().format("YYYY-MM-DD")
      ) {
        // 用户今日已经签到
        ctx.body = {
          code: 500,
          fav: user.fav,
          count: user.count,
          lastSign: record.created,
          msg: "您今日已签到！",
        };
        return;
      } else {
        // 用户今日未签到
        let count = user.count;
        let fav = 0;
        if (
          moment(record.created).format("YYYY-MM-DD") ===
          moment().subtract(1, "days").format("YYYY-MM-DD")
        ) {
          count += 1;
          // 用户连续签到
          if (count < 5) fav = 5;
          else if (count >= 5 && count < 15) fav = 10;
          else if (count >= 15 && count < 30) fav = 15;
          else if (count >= 30 && count < 100) fav = 20;
          else if (count >= 100 && count < 365) fav = 30;
          else if (count >= 365) fav = 50;
          // 更新user表
          await User.updateOne(
            { _id: obj._id },
            {
              $inc: {
                fav: fav, // user.fav += fav
                count: 1, // user.count += 1
              },
            }
          );
          result = {
            fav: user.fav + fav,
            count: user.count + 1,
          };
        } else {
          // 用户中断签到
          fav = 5;
          // 更新user表
          await User.updateOne(
            { _id: obj._id },
            {
              $set: { count: 1 },
              $inc: { fav: fav },
            }
          );
          result = {
            fav: user.fav + fav,
            count: 1,
          };
        }
        // 更新sign_record表
        newRecord = new SignRecord({
          uid: obj._id,
          fav: fav,
        });
        await newRecord.save();
      }
    } else {
      // 用户初次签到, 保存用户签到数据 - users表
      await User.updateOne(
        {
          _id: obj._id,
        },
        {
          $set: { count: 1 },
          $inc: { fav: 5 },
        }
      );
      // 保存签到记录 sign_record表
      newRecord = new SignRecord({
        uid: obj._id,
        fav: 5,
      });
      await newRecord.save();
      result = {
        fav: user.fav + 5,
        count: 1,
      };
    }
    ctx.body = {
      code: 200,
      msg: "签到成功",
      ...result,
      lastSign: newRecord.created,
    };
  }

  // 更新用户基本信息
  async updateUserInfo(ctx) {
    const { body } = ctx.request;
    const obj = await getJWTPayload(ctx.header.authorization);
    // 判断用户是否修改了邮箱
    const user = await User.findOne({ _id: obj._id });
    let msg = "";
    if (body.username && body.username !== user.username) {
      // 用户修改了邮箱
      // 发送reset邮件
      // 判断用户的新邮箱是否已被注册
      const tempUser = await User.findOne({ username: body.username });
      if (tempUser && tempUser.password) {
        ctx.body = {
          code: 501,
          msg: "邮箱已经注册！",
        };
        return;
      }
      const key = uuidv4();
      setValue(
        key,
        jwt.sign({ _id: obj._id }, config.JWT_SECRET, {
          expiresIn: "30m",
        })
      );
      // const result =
      await send({
        type: "email",
        data: {
          key: key,
          username: body.username,
        },
        code: "",
        expire: moment().add(30, "minutes").format("YYYY-MM-DD HH:mm:ss"),
        email: user.username,
        user: user.name,
      });
      // ctx.body = {
      //   code: 500,
      //   data: result,
      //   msg: "发送验证邮件成功，请点击链接确认修改邮件账号！",
      // };
      msg = "基本资料已更新，修改邮箱需邮件确认，请查收邮件！";
    }
    const arr = ["username", "mobile", "password"];
    arr.map((item) => delete body[item]);
    const result = await User.updateOne({ _id: obj._id }, body);
    console.log(result);
    // result.modifiedCount === 1 &&
    if (result.matchedCount === 1) {
      ctx.body = {
        code: 200,
        msg: msg === "" ? "更新成功！" : msg,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: "更新失败！",
      };
    }
  }

  // 更新用户名-邮箱
  async updateUsername(ctx) {
    const body = ctx.query;
    console.log("body", ctx.query);
    if (body.key) {
      const token = await getValue(body.key);
      const obj = getJWTPayload("Bearer " + token);
      await User.updateOne({ _id: obj._id }, { username: body.username });
      ctx.body = {
        code: 200,
        msg: "更新用户名成功",
      };
    }
  }

  // 修改密码
  async changePassword(ctx) {
    const { body } = ctx.request;
    const obj = await getJWTPayload(ctx.header.authorization);
    const user = await User.findOne({ _id: obj._id });
    if (await bcrypt.compare(body.oldpwd, user.password)) {
      const newPassword = await bcrypt.hash(body.newpwd, 5);
      await User.updateOne(
        { _id: obj._id },
        {
          $set: { password: newPassword },
        }
      );
      ctx.body = {
        code: 200,
        msg: "更新密码成功",
      };
    } else {
      ctx.body = {
        code: 500,
        msg: "更新密码错误，请检查！",
      };
    }
  }
}

export default new UserController();
