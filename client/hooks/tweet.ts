import { graphQLClient } from "@/clients/api"
import { CreateTweetData } from "@/gql/graphql"
import { createTweetMutation } from "@/graphql/mutations/tweet"
import { getAllTweetsQuery } from "@/graphql/query/tweet"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

// export const useCreateTweet = () => {
//     const queryClient = useQueryClient();
//     const mutation = useMutation({
//         mutationKey: ['create-tweet'],
//         mutationFn: (payload: CreateTweetData) => graphQLClient.request(createTweetMutation, {payload}),
//         onMutate: () => toast.loading("Creating tweet"),
//         onSuccess: () => queryClient.invalidateQueries({queryKey: ['all-tweets']}),
//     })
//     return mutation
// }

export const useGetAllTweets = () => {
    const query = useQuery({
        queryKey: ['all-tweets'],
        queryFn: () => graphQLClient.request(getAllTweetsQuery)
    })
    return { ...query, tweets: query.data?.getAllTweets}
}