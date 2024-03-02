import { graphql } from "../../gql";

export const getAllTweetsQuery = graphql(`
  #graphql
  query GetAllTweets {
    getAllTweets {
      id
      imageURL
      content
      author {
        firstName
        lastName
        profileImageURL
      }
    }
  }
`);

export const getSignedURLforTweetQuery = graphql(`
  #graphql
  query GetSignedURL($imageName: String!, $imageType: String!) {
    getSignedURLForTweet(imageName: $imageName, imageType: $imageType)
  }
`);
