import mongoose from "../config/DBHelper";

const Schema = mongoose.Schema;

const LinksSchema = new Schema({
  title: { type: String, default: "" },
  sort: { type: String, default: "" },
  link: { type: String, default: "" },
  isTop: { type: String, default: "" },
  created: { type: Date },
  type: { type: String, default: "links" },
});

LinksSchema.pre("save", function (next) {
  this.created = new Date();
  next();
});

const Links = mongoose.model("links", LinksSchema);

export default Links;
