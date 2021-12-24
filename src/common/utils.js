import { getValue } from "../config/RedisConfig";
import config from "../config";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const getJWTPayload = (token) => {
  return jwt.verify(token.split(" ")[1], config.JWT_SECRET);
};

const checkCode = async (key, value) => {
  const redisData = await getValue(key);
  if (
    typeof redisData === "string" &&
    redisData.toLowerCase() === value.toLowerCase()
  ) {
    return true;
  } else {
    return false;
  }
};

// 判断该目录是否存在
const getStats = (path) => {
  return new Promise((resolve) => {
    fs.stat(path, (err, stats) => (err ? resolve(false) : resolve(stats)));
  });
};

// 新建文件夹
const mkdir = (dir) => {
  return new Promise((resolve) => {
    fs.mkdir(dir, (err) => (err ? resolve(false) : resolve(true)));
  });
};

// 循环遍历，如果目录不存在，需要该目录
const dirExists = async (dir) => {
  const isExists = await getStats(dir);
  // 如果该路径存在且不是文件，返回true
  if (isExists && isExists.isDirectory()) {
    return true;
  } else if (isExists) {
    // 路径存在，但是是文件，返回 false
    return false;
  }
  // 如果该路径不存在，需要创建
  const tempDir = path.parse(dir).dir;
  // 循环遍历， 递归判断
  const status = await dirExists(tempDir);

  if (status) {
    const result = await mkdir(dir);
    return result;
  } else {
    return false;
  }
};

export { getJWTPayload, checkCode, dirExists };
