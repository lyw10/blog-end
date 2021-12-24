import mongoose from "../config/DBHelper";
import moment from "dayjs";

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  uid: { type: String, ref: "users" },
  title: { type: String },
  content: { type: String },
  catalog: { type: String },
  isEnd: { type: String, default: "0" },
  isTop: { type: String, default: "0" },
  reads: { type: String, default: 0 },
  answer: { type: Number, default: 0 },
  status: { type: String, default: "0" },
  topNum: { type: String },
  tags: { type: Array, default: [] },
  fav: { type: Number },
  created: { type: Date },
  sort: { type: String, default: 100 },
});

PostSchema.virtual("user", {
  ref: "users",
  localField: "uid",
  foreignField: "_id",
});

PostSchema.pre("save", function (next) {
  this.created = new Date();
  next();
});

PostSchema.statics = {
  /**
   * 获取文章列表数据
   * @param {Object} options 筛选条件
   * @param {String} sort 排序方式
   * @param {Number} page 分页页数
   * @param {Number} limit 分页条数
   */
  getList: function (options, sort, page, limit) {
    return this.find(options)
      .sort({ [sort]: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate({
        path: "uid",
        select: "name isVip pic",
      });
  },
  countList: function (options) {
    return this.find(options).countDocuments();
  },
  getTopWeek: function () {
    return this.find(
      {
        // $gte 大于等于
        created: {
          $gte: moment().subtract(7, "days"),
        },
      },
      {
        answer: 1,
        title: 1,
      }
    )
      .sort({ answer: -1 })
      .limit(15);
  },
};

const PostModel = mongoose.model("posts", PostSchema);

export default PostModel;
