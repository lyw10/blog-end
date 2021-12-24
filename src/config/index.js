import path from "path";
const DB_URL = "mongodb://root:root@47.96.40.132:27018/admin";

const REDIS = {
  host: "47.96.40.132",
  port: 15002,
  password: "123456",
};

const JWT_SECRET = "hahaha!";

const baseUrl =
  process.env.NODE_ENV === "production" ? "xxx" : "http://localhost:8080";

const uploadPath =
  process.env.NODE_ENV === "production"
    ? "app/public"
    : path.join(path.resolve(__dirname), "../../public");

export default {
  DB_URL,
  REDIS,
  JWT_SECRET,
  baseUrl,
  uploadPath,
};
