import { PrismaClient, User } from "@prisma/client";
import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { GraphQLContext } from "../../interfaces";

interface GoogleTokenResult {
  iss?: string;
  azp?: string;
  aud?: string;
  sub?: string;
  email: string;
  email_verified?: string;
  nbf?: string;
  name?: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale?: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const googleToken = token;
    const googleOAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleOAuthURL.searchParams.set("id_token", googleToken);

    const { data } = await axios.get<GoogleTokenResult>(
      googleOAuthURL.toString(),
      {
        responseType: "json",
      }
    );

    console.log(data);

    const user = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageURL: data.picture,
        },
      });
    }

    const userInDB = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!userInDB) throw new Error("user not found in the db");

    const jwtToken = JWTService.generateTokenForUser(userInDB);

    return jwtToken;
  },
  getCurrentUser: async (parent: any, args: any, ctx: GraphQLContext) => {
    const id = ctx.user?.id;
    if (!id) {
      return null;
    }
    const user = await prismaClient.user.findUnique({ where: { id: id } });
    return user;
  },
  getUserById: async (
    parent: any,
    { id }: { id: string },
    ctx: GraphQLContext
  ) => prismaClient.user.findUnique({ where: { id } }),
};

const extraResolvers = {
  User: {
    tweets: (parent: User) =>
      prismaClient.tweet.findMany({ where: { author: { id: parent.id } } }),
    followers: async (parent: User) => {
      const result = await prismaClient.follows.findMany({
        where: { following: { id: parent.id } },
        include: { follower: true, following: true },
      });
      return result.map((el) => el.follower);
    },
    following: async (parent: User) => {
      const result = await prismaClient.follows.findMany({
        where: { follower: { id: parent.id } },
        include: { follower: true, following: true },
      });
      return result.map((el) => el.following);
    },
  },
};

const mutations = {
  followUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphQLContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("unauthorized access");
    await prismaClient.follows.create({
      data: {
        follower: { connect: { id: ctx.user.id } },
        following: { connect: { id: to } },
      },
    });
    return true;
  },
  unFollowUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphQLContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("unauthorized access");
    await prismaClient.follows.delete({
      where: {
        followerId_followingId: { followerId: ctx.user.id, followingId: to },
      },
    });
    return true;
  },
};

export const resolvers = { queries, extraResolvers, mutations };
