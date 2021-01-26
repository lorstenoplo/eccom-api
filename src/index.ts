import mongoose from "mongoose";
import { __prod__ } from "./constants";

const main = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://admin:admin@cluster0.s9xcu.mongodb.net/users?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );

    if (!__prod__) {
      console.log("db connected");
    }
  } catch (err) {
    console.log("could connect", err);
  }
};

main();
