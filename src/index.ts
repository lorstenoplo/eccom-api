import { ApolloServer } from "apollo-server-express";
import { __prod__, PORT } from "./constants";
import mongoose from "mongoose";
import express from "express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { ProductResolver } from "./resolvers/products";
import { config } from "dotenv";
import { UserResolver } from "./resolvers/user";
import cors from "cors";

const main = async () => {
  config();
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_URL || "", {
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
      origin: "http://localhost:3000",
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
};

main().catch((err) => console.dir(err));
