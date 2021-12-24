import mongoose from "../config/DBHelper";

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: { type: String },
  name: { type: String },
  password: { type: String },
  created: { type: Date },
  update: { type: Date },
  gender: { type: String, default: "" },
  fav: { type: Number, default: 100 },
  roles: { type: Array, default: ["user"] },
  pic: { type: String, default: "/img/default.png" },
  mobile: { type: String, match: /^1[3-9](\d{9})$/, default: "" },
  status: { type: String, default: "0" },
  location: { type: String, default: "" },
  regmark: { type: String, default: "" },
  isVip: { type: String, default: "0" },
  count: { type: Number, default: 0 },
});

UserSchema.pre("save", function (next) {
  this.created = new Date();
  next();
});

UserSchema.pre("update", function (next) {
  this.updated = new Date();
  next();
});

UserSchema.statics = {
  findByID: function (id) {
    return this.findOne(
      { _id: id },
      {
        password: 0,
        username: 0,
        mobile: 0,
      }
    );
  },
  getList: function (options, sort, page, limit) {
    // 1. datepicker -> item: string, search -> array  startitme,endtime
    // 2. radio -> key-value $in
    // 3. select -> key-array $in
    let query = {};
    if (typeof options.search !== "undefined") {
      if (typeof options.search === "string" && options.search.trim() !== "") {
        if (["name", "username"].includes(options.item)) {
          // 模糊匹配
          query[options.item] = { $regex: new RegExp(options.search) };
          // =》 { name: { $regex: /admin/ } } => mysql like %admin%
        } else {
          // radio
          query[options.item] = options.search;
        }
      }
      if (options.item === "roles") {
        query = { roles: { $in: options.search } };
      }
      if (options.item === "created") {
        const start = options.search[0];
        const end = options.search[1];
        query = { created: { $gte: new Date(start), $lt: new Date(end) } };
      }
    }
    return this.find(query, { password: 0, mobile: 0 })
      .sort({ [sort]: -1 })
      .skip(page * limit)
      .limit(limit);
  },
  countList: function (options) {
    let query = {};
    if (typeof options.search !== "undefined") {
      if (typeof options.search === "string" && options.search.trim() !== "") {
        if (["name", "username"].includes(options.item)) {
          // 模糊匹配
          query[options.item] = { $regex: new RegExp(options.search) };
          // =》 { name: { $regex: /admin/ } } => mysql like %admin%
        } else {
          // radio
          query[options.item] = options.search;
        }
      }
      if (options.item === "roles") {
        query = { roles: { $in: options.search } };
      }
      if (options.item === "created") {
        const start = options.search[0];
        const end = options.search[1];
        query = { created: { $gte: new Date(start), $lt: new Date(end) } };
      }
    }
    return this.find(query).countDocuments();
  },
  // getTotalSign: function (page, limit) {
  //   return this.find({})
  //     .skip(page * limit)
  //     .limit(limit)
  //     .sort({ count: -1 })
  // },
  // getTotalSignCount: function (page, limit) {
  //   return this.find({}).countDocuments()
  // }
};

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
