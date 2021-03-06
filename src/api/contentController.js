import Post from "../model/Post";
import User from "../model/User";
import qs from "qs";
import Links from "../model/Links";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import moment from "dayjs";
import config from "../config";
import { checkCode, getJWTPayload } from "../common/utils";
// 方法1:
// import { dirExists } from "../common/utils";
// 方法2:
import mkdir from "make-dir";

class ContentController {
  // 获取文章列表
  async getPostList(ctx) {
    const body = qs.parse(ctx.query);

    const sort = body.sort ? body.sort : "created";
    const page = body.page ? parseInt(body.page) : 0;
    const limit = body.limit ? parseInt(body.limit) : 20;
    const options = {};

    if (body.title) {
      options.title = { $regex: body.title };
    }
    if (body.catalog && body.catalog.length > 0) {
      options.catalog = { $in: body.catalog };
    }
    if (body.isTop) {
      options.isTop = body.isTop;
    }
    if (body.isEnd) {
      options.isEnd = body.isEnd;
    }
    if (body.status) {
      options.status = body.status;
    }
    if (typeof body.tag !== "undefined" && body.tag !== "") {
      options.tags = { $elemMatch: { name: body.tag } };
    }
    const result = await Post.getList(options, sort, page, limit);
    const total = await Post.countList(options);
    ctx.body = {
      code: 200,
      data: result,
      msg: "获取文章列表成功",
      total: total,
    };
  }

  // 查询友情链接
  async getLinks(ctx) {
    const result = await Links.find({ type: "links" });
    ctx.body = {
      code: 200,
      data: result,
    };
  }

  // 查询温馨提醒
  async getTips(ctx) {
    const result = await Links.find({ type: "tips" });
    ctx.body = {
      code: 200,
      data: result,
    };
  }

  // 本周热议
  async getTopWeek(ctx) {
    const result = await Post.getTopWeek();
    ctx.body = {
      code: 200,
      data: result,
    };
  }

  // 上传图片
  async uploadImg(ctx) {
    const file = ctx.request.files.file;
    const ext = file.name.split(".").pop();
    const dir = `${config.uploadPath}/${moment().format("YYYYMMDD")}`;
    console.log("dir", dir);
    // 判断路径是否存在，不存在则创建
    // 方法1:
    // await dirExists(dir);
    // 方法2:
    await mkdir(dir);
    // 给文件唯一名称
    const picname = uuidv4();
    const destPath = `${dir}/${picname}.${ext}`;
    const reader = fs.createReadStream(file.path);
    const upStream = fs.createWriteStream(destPath);
    const filePath = `/${moment().format("YYYYMMDD")}/${picname}.${ext}`;
    // 存储文件到指定路径
    // 方法1:
    reader.pipe(upStream);
    // 方法2:
    // let totalLength = 0;
    // reader.on('data', (chunk) => {
    //   totalLength += chunk.length
    //   if (upStream.write(chunk) === false) {
    //     reader.pause()
    //   }
    // })
    // reader.on('drain', () => {
    //   reader.resume()
    // })
    // reader.on('end', () => {
    //   upStream.end()
    // })
    ctx.body = {
      code: 200,
      msg: "图片上传成功！",
      data: filePath,
    };
  }

  // 添加新贴
  async addPost(ctx) {
    const { body } = ctx.request;
    const code = body.code;
    const sid = body.sid;
    // 验证图片验证码的时效性、正确性
    const result = await checkCode(sid, code);
    if (result) {
      const obj = await getJWTPayload(ctx.header.authorization);
      // 判断用户的积分数是否 > fav，否则，提示用户积分不足发贴
      // 用户积分足够的时候，新建Post，减除用户对应的积分
      const user = await User.findByID({ _id: obj._id });
      if (user.fav < body.fav) {
        ctx.body = {
          code: 501,
          msg: "积分不足",
        };
        return;
      } else {
        await User.updateOne({ _id: obj._id }, { $inc: { fav: -body.fav } });
      }
      const newPost = new Post(body);
      newPost.uid = obj._id;
      const result = await newPost.save();
      ctx.body = {
        code: 200,
        msg: "成功的保存的文章",
        data: result,
      };
    } else {
      // 图片验证码验证失败
      ctx.body = {
        code: 500,
        msg: "图片验证码验证失败",
      };
    }
  }

  // 获取文章详情
  async getPostDetail(ctx) {
    const params = ctx.query;
    if (!params.tid) {
      ctx.body = {
        code: 500,
        msg: "文章id为空",
      };
      return;
    }
    const post = await Post.findByTid(params.tid);
    if (!post) {
      ctx.body = {
        code: 200,
        data: {},
        msg: "查询文章详情成功",
      };
      return;
    }
    // let isFav = 0;
    // 判断用户是否传递Authorization的数据，即是否登录
    // if (ctx.header.authorization) {
    //   const obj = await getJWTPayload(ctx.header.authorization)
    //   // const userCollect = await
    // }
    // const newPost = post.toJSON()
    // newPost.isFav = 0;
    // 更新文章阅读计数
    const result = await Post.updateOne(
      { _id: params.tid },
      { $inc: { reads: 1 } }
    );
    if (post._id && result.modifiedCount === 1) {
      ctx.body = {
        code: 200,
        data: post,
        msg: "查询文章详情成功",
      };
    } else {
      ctx.body = {
        code: 500,
        msg: "获取文章详情失败",
      };
    }
  }
}

export default new ContentController();
