import Koa from "koa";
import JWT from "koa-jwt";
import path from "path";
import Cors from "@koa/cors";
import KoaBody from "koa-body";
import Json from "koa-json";
import helmet from "koa-helmet";
import statics from "koa-static";
import compose from "koa-compose";
import compress from "koa-compress";

import router from "./routes/routes";
import config from "./config/index";
import errorHandle from "./common/errorHandle";

const app = new Koa();

const isDevMode = process.env.NODE_ENV === "production" ? false : true;

//定义公共的路径，不需要jwt鉴权
const jwt = JWT({ secret: config.JWT_SECRET }).unless({
  path: [/^\/public/, /\/login/],
});

const middleware = compose([
  KoaBody({
    multipart: true,
    formidable: {
      keepExtensions: true,
      maxFieldsSize: 5 * 1024 * 1024,
    },
    onError: (err) => {
      console.log("koabody TCL: err", err);
    },
  }), //处理request的body
  statics(path.join(__dirname, "../public")),
  Cors(),
  Json({ pretty: false, param: "pretty" }),
  helmet(),
  errorHandle,
  jwt,
]);

if (!isDevMode) {
  app.use(compress());
}

app.use(middleware);
app.use(router());
app.listen(3000);
