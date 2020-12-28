import { ApolloClient, InMemoryCache } from "@apollo/client";
import { NextPageContext } from "next";
import { PaginatedPosts } from "../generated/graphql";
import { createWithApollo } from "./createWithApollo";

const createClient = (ctx: NextPageContext) =>
    new ApolloClient({
        uri: process.env.NEXT_PUBLIC_API_URL as string,
        credentials: "include", //this will send the cookie on login (needs to be constant)
        headers: {
            cookie:
                (typeof window === "undefined" && ctx
                    ? ctx.req?.headers.cookie
                    : undefined) || "", //only pass cookie if not on server
        },
        cache: new InMemoryCache({
            typePolicies: {
                //matches the query structure of graphql "Query" and "posts"
                Query: {
                    fields: {
                        posts: {
                            keyArgs: [], //no args we want to restrict by when paginating (get over 15 limit in vars in index.tsx)
                            merge(
                                //we know it's PaginatedPosts type b/c it's what's returned in posts query
                                existing: PaginatedPosts | undefined,
                                incoming: PaginatedPosts
                            ): PaginatedPosts {
                                return {
                                    ...incoming,
                                    posts: [
                                        ...(existing?.posts || []),
                                        ...incoming.posts,
                                    ],
                                };
                            },
                        },
                    },
                },
            },
        }),
    });

export const withApollo = createWithApollo(createClient);
