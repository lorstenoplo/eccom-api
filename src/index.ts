import { ApolloServer } from "apollo-server-express";
import express from "express";
import mongoose from "mongoose";
import { buildSchema } from "type-graphql";
import { PORT, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { ProductResolver } from "./resolvers/products";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  if (!__prod__) {
    require("dotenv").config();
  }
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_URL!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (!__prod__) {
      console.log("db connected");
    }
  } catch (err) {
    console.log("could connect", err);
  }

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, ProductResolver, UserResolver],
      validate: false,
    }),
  });

  app.get("/", (_, res) => {
    res.send(`welcome to the products api, ${__prod__}`);
  });

  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: __prod__ ? "https://goloop.netlify.app" : "http://localhost:3000",
      credentials: true,
    },
  });

  app.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}`);
  });
  module.exports = app;
};

main().catch((err) => console.dir(err));
