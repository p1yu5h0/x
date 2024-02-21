import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import cors from 'cors';
import { prismaClient } from "../clients/db";
import { User } from "./user";

export async function initServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use(express.json());

  const graphqlServer = new ApolloServer({
    typeDefs: `
        ${User.types} 
        type Query {
          ${User.queries}
        }
    `,
    resolvers: {
        Query: {
          ...User.resolvers.queries,
        },

        // Mutation: {}
    },
  });

  await graphqlServer.start();

  app.use('/graphql', cors<cors.CorsRequest>(), expressMiddleware(graphqlServer));

  return app
}


