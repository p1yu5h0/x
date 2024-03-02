import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphQLContext } from "../../interfaces";
import { S3Client, PutObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { redisClient } from "../../clients/redis";

dotenv.config();

interface CreateTweetPayload {
  content: string;
  imageURL?: string;
}

const s3ClientConfig: S3ClientConfig = {
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
};

const s3Client = new S3Client(s3ClientConfig);

const queries = {
  getAllTweets: async () => {
    const cachedTweets = await redisClient.get("ALL_TWEETS");
    if (cachedTweets?.length) return JSON.parse(cachedTweets);

    const tweets = await prismaClient.tweet.findMany({
      orderBy: { createdAt: "desc" },
    });
    await redisClient.set("ALL_TWEETS", JSON.stringify(tweets));
    return tweets;
  },

  getSignedURLForTweet: async (
    parent: any,
    { imageName, imageType }: { imageName: string; imageType: string },
    cxt: GraphQLContext,
  ) => {
    if (!cxt.user || !cxt.user?.id) {
      throw new Error("you are unauthenticated");
    }
    const allowedImageType = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowedImageType.includes(imageType))
      throw new Error("unsupported image type");
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `uploads/${cxt.user.id}/tweets/${imageName}-${Date.now().toString()}.${imageType}`,
    });
    const signedUrl = await getSignedUrl(s3Client, putObjectCommand);
    return signedUrl;
  },
};

const mutations = {
  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphQLContext,
  ) => {
    if (!ctx.user) throw new Error("You are not authenticated");
    const rateLimitFlag = await redisClient.get(
      `RATE_LIMIT:TWEET:${ctx.user.id}`,
    );
    if (rateLimitFlag) {
      throw new Error("please wait.......");
    }
    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageURL: payload.imageURL,
        author: { connect: { id: ctx.user.id } },
      },
    });
    await redisClient.setex(`RATE_LIMIT:TWEET:${ctx.user.id}`, 10, 1);
    await redisClient.del("ALL_TWEETS");
    return tweet;
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) =>
      prismaClient.user.findUnique({ where: { id: parent.authorId } }),
  },
};

export const resolvers = { mutations, extraResolvers, queries };
