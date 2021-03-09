import { ApolloServer } from "apollo-server-express";
import cors from "cors";
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
  app.use(
    "/graphql",
    cors({
      origin: process.env.FRONTEND_URL!,
      credentials: true,
    }),
    (req, res, next) => {
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Headers",
        "content-type, authorization, content-length, x-requested-with, accept, origin"
      );
      res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      res.header("Allow", "POST, GET, OPTIONS");
      res.header("Access-Control-Allow-Origin", "https://goloop.vercel.app/");
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
        next();
      }
    }
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, ProductResolver, UserResolver],
      validate: false,
    }),
  });

  app.get("/", (_, res) => {
    res.send("welcome to the products api");
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}`);
  });
  module.exports = app;
};

main().catch((err) => console.dir(err));
