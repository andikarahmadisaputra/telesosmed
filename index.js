import "dotenv/config";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { authResolvers, authTypeDefs } from "./schemas/authSchema.js";
import { userResolvers, userTypeDefs } from "./schemas/userSchema.js";
import { postResolvers, postTypeDefs } from "./schemas/postSchema.js";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const server = new ApolloServer({
  typeDefs: [userTypeDefs, authTypeDefs, postTypeDefs],
  resolvers: [userResolvers, authResolvers, postResolvers],
  introspection: true,
});

const { url } = await startStandaloneServer(server, {
  context: async ({ req, res }) => {
    const authentication = async () => {
      const token = req.headers.authorization;
      if (!token) throw new Error("Unauthorized");

      const accessToken = token.split(" ")[1];

      const payload = jwt.verify(accessToken, "rahasia");

      const user = await User.findById(payload._id);
      if (!user) throw new Error("Unauthorized");

      return user;
    };

    return {
      authentication,
    };
  },
  listen: { port: process.env.PORT },
});

console.log(`🚀  Server ready at: ${url}`);
