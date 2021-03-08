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
    cors({
      origin: FRONTEND_URL!,
      credentials: true,
    })
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
