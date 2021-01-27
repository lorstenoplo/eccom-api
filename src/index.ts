import { ApolloServer } from "apollo-server-express";
import { __prod__, PORT } from "./constants";
import mongoose from "mongoose";
import express from "express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";

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

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`server listening at http://localhost:${PORT}`);
  });
};

main().catch((err) => console.dir(err));