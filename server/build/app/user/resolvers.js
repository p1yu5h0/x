"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../../clients/db");
const jwt_1 = __importDefault(require("../../services/jwt"));
const redis_1 = require("../../clients/redis");
const queries = {
    verifyGoogleToken: async (parent, { token }) => {
        const googleToken = token;
        const googleOAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleOAuthURL.searchParams.set("id_token", googleToken);
        const { data } = await axios_1.default.get(googleOAuthURL.toString(), {
            responseType: "json",
        });
        console.log(data);
        const user = await db_1.prismaClient.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            await db_1.prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImageURL: data.picture,
                },
            });
        }
        const userInDB = await db_1.prismaClient.user.findUnique({
            where: { email: data.email },
        });
        if (!userInDB)
            throw new Error("user not found in the db");
        const jwtToken = jwt_1.default.generateTokenForUser(userInDB);
        return jwtToken;
    },
    getCurrentUser: async (parent, args, ctx) => {
        var _a;
        const id = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!id) {
            return null;
        }
        const user = await db_1.prismaClient.user.findUnique({ where: { id: id } });
        return user;
    },
    getUserById: async (parent, { id }, ctx) => {
        db_1.prismaClient.user.findUnique({ where: { id } });
    }
};
const extraResolvers = {
    User: {
        tweets: (parent) => db_1.prismaClient.tweet.findMany({ where: { author: { id: parent.id } } }),
        followers: async (parent) => {
            const result = await db_1.prismaClient.follows.findMany({
                where: { following: { id: parent.id } },
                include: { follower: true, following: true },
            });
            return result.map((el) => el.follower);
        },
        following: async (parent) => {
            const result = await db_1.prismaClient.follows.findMany({
                where: { follower: { id: parent.id } },
                include: { follower: true, following: true },
            });
            return result.map((el) => el.following);
        },
        recommendedUsers: async (parent, {}, ctx) => {
            if (!ctx.user)
                return [];
            const cachedValue = await redis_1.redisClient.get(`RECOMMENDED_USERS:${ctx.user.id}`);
            if (cachedValue) {
                console.log('cache found');
                return JSON.parse(cachedValue);
            }
            const myFollowings = await db_1.prismaClient.follows.findMany({
                where: {
                    follower: { id: ctx.user.id },
                },
                include: {
                    following: {
                        include: { followers: { include: { following: true } } },
                    },
                },
            });
            const users = [];
            for (const followings of myFollowings) {
                // console.log(followings, "followings")
                for (const followingOfFollowedUser of followings.following.followers) {
                    // console.log(followingOfFollowedUser, "followingOfFollowedUser1")
                    // console.log(followingOfFollowedUser.following.id, "followingOfFollowedUser2")
                    if (followingOfFollowedUser.following.id !== ctx.user.id &&
                        myFollowings.findIndex((e) => (e === null || e === void 0 ? void 0 : e.followingId) === followingOfFollowedUser.following.id) < 0) {
                        // console.log(followingOfFollowedUser.following, "followingOfFollowedUser.following")
                        users.push(followingOfFollowedUser.following);
                    }
                }
            }
            console.log('cache not found');
            await redis_1.redisClient.setex(`RECOMMENDED_USERS:${ctx.user.id}`, 20, JSON.stringify(users));
            return users;
        },
    },
};
const mutations = {
    followUser: async (parent, { to }, ctx) => {
        if (!ctx.user || !ctx.user.id)
            throw new Error("unauthorized access");
        await db_1.prismaClient.follows.create({
            data: {
                follower: { connect: { id: ctx.user.id } },
                following: { connect: { id: to } },
            },
        });
        await redis_1.redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
        return true;
    },
    unFollowUser: async (parent, { to }, ctx) => {
        if (!ctx.user || !ctx.user.id)
            throw new Error("unauthorized access");
        await db_1.prismaClient.follows.delete({
            where: {
                followerId_followingId: { followerId: ctx.user.id, followingId: to },
            },
        });
        return true;
    },
};
exports.resolvers = { queries, extraResolvers, mutations };
