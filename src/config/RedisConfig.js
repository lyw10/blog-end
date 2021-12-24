import { createClient } from "redis";
import config from "./index";

// (async () => {
const client = createClient({
  url: `redis://:${config.REDIS.password}@${config.REDIS.host}:${config.REDIS.port}`,
});

client.on("error", (err) => console.log("Redis Client Error", err));

client.connect();

const setValue = async (key, value, time) => {
  if (time) return await client.set(key, value, { EX: time });
  else return await client.set(key, value);
};

const getValue = async (key) => {
  return await client.get(key);
};

export { setValue, getValue };
