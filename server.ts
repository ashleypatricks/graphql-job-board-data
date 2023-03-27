import cors from "cors";
import express from "express";
import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { readFile } from "fs/promises";
import { resolvers } from "./resolvers";
import http from "http";
import { User } from "./db";
import bodyParser from "body-parser";

const PORT = 9000;
const JWT_SECRET = Buffer.from("Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt", "base64");

interface MyContext {
  auth?: String;
}

(async () => {
  const app = express();
  const httpServer = http.createServer(app);
  const typeDefs = await readFile("./schema.graphql", "utf8");
  const apolloServer = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();
  app.use(cors<cors.CorsRequest>());
  app.use(bodyParser.json());

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressjwt({
      algorithms: ["HS256"],
      credentialsRequired: false,
      secret: JWT_SECRET,
    }),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        //@ts-ignore
        if (req.auth) {
          //@ts-ignore
          const user = await User.findById(req.auth.sub);
          return { user };
        }
        return {};
      },
    })
  );

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne((user) => user.email === email);

    if (user && user.password === password) {
      const token = jwt.sign({ sub: user.id }, JWT_SECRET);
      res.json({ token });
    } else {
      res.sendStatus(401);
    }
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(`🚀  Server ready at ${PORT}`);
})();
