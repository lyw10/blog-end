import combineRoutes from "koa-combine-routers";

import publicRouter from "./publicRouter";
import loginRouter from "./loginRouter";
import userRouter from "./userRouter";
import contentRouter from "./contentRouter";

export default combineRoutes(
  publicRouter,
  loginRouter,
  userRouter,
  contentRouter
);
