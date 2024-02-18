import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import cors from 'cors';

export async function initServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use(express.json());

  const graphqlServer = new ApolloServer({
    typeDefs: `
        type Query {
            sayHello: String
            sayHelloToMe(name: String!): String
        }
    `,
    resolvers: {
        Query: {
            sayHello: () => `hello from graphql server`,
            sayHelloToMe: (parent: any, {name}: {name: string}) => name,
        },

        // Mutation: {}
    },
  });

  await graphqlServer.start();

  app.use('/graphql', cors<cors.CorsRequest>(), expressMiddleware(graphqlServer));

  return app
}


