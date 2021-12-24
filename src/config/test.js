import { setValue, getValue } from "./RedisConfig";

// setValue("newRedis", "newRedis1");

getValue("newRedis").then((res) => {
  console.log("result", res);
});
