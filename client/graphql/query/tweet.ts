import { graphql } from "../../gql";

export const getAllTweetsQuery = graphql(`#graphql
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
`)