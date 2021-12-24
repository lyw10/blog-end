import User from "./User";

// 增
const user = {
  name: "lyw",
  age: 12,
  email: "lyw@123.com",
};

const run = async () => {
  const data = new User(user);
  const result = await data.save();
  console.log("result", result);
};

// 查
const run1 = async () => {
  const result = await User.find();
  console.log("result1", result);
};

// 改
const run2 = async () => {
  const result = await User.updateOne(
    { name: "lyw" },
    { email: "lnj@748.com" }
  );
  console.log("result2", result);
};

// 删
const run3 = async () => {
  const result = await User.deleteOne({ name: "lyw" });
  console.log("result3", result);
};

run3();
