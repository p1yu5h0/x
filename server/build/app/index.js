"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = void 0;
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const user_1 = require("./user");
const tweet_1 = require("./tweet");
const jwt_1 = __importDefault(require("../services/jwt"));
async function initServer() {
    const app = (0, express_1.default)();
    app.use(body_parser_1.default.json());
    app.use(express_1.default.json());
    const graphqlServer = new server_1.ApolloServer({
        typeDefs: `
        ${user_1.User.types} 
        ${tweet_1.Tweet.types}
        type Query {
          ${user_1.User.queries}
          ${tweet_1.Tweet.queries}
        }
        type Mutation {
          ${tweet_1.Tweet.mutations}
          ${user_1.User.mutations}
        }
    `,
        resolvers: Object.assign(Object.assign({ Query: Object.assign(Object.assign({}, user_1.User.resolvers.queries), tweet_1.Tweet.resolvers.queries), Mutation: Object.assign(Object.assign({}, tweet_1.Tweet.resolvers.mutations), user_1.User.resolvers.mutations) }, tweet_1.Tweet.resolvers.extraResolvers), user_1.User.resolvers.extraResolvers),
    });
    await graphqlServer.start();
    app.use("/graphql", (0, cors_1.default)(), (0, express4_1.expressMiddleware)(graphqlServer, {
        context: async ({ req, res }) => {
            return {
                user: req.headers.authorization
                    ? jwt_1.default.decodeToken(req.headers.authorization.split("Bearer ")[1])
                    : undefined,
            };
        },
    }));
    return app;
}
exports.initServer = initServer;
