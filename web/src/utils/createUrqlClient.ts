import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import Router from "next/router";
import {
    dedupExchange,
    Exchange,
    fetchExchange,
    stringifyVariables,
} from "urql";
import { pipe, tap } from "wonka";
import {
    DeletePostMutationVariables,
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
    VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import gql from "graphql-tag";
import { isServer } from "./isServer";

//this allows us to catch all errors (handling errors at a global level) no matter where they happen
export const errorExchange: Exchange = ({ forward }) => (ops$) => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            if (error?.message.includes("not authenticated")) {
                //replace = replaces the current route in the history instead of pushing a new one "redirects"
                Router.replace("/login");
            }
        })
    );
};

//read the data from the cache and return it
export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;

        //get all the fields in the cache that have name Query (basically all the queries in the cache)
        const allFields = cache.inspectFields(entityKey);

        //filter the fields that have the name fieldName (i.e. post)
        const fieldInfos = allFields.filter(
            (info) => info.fieldName === fieldName
        );
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const isItInTheCache = cache.resolve(
            cache.resolveFieldByKey(entityKey, fieldKey) as string,
            "posts"
        );
        info.partial = !isItInTheCache; //if it's not in the cache, the server needs to fetch it

        let hasMore = true;
        const results: string[] = [];
        fieldInfos.forEach((fi) => {
            //will increase as we load more and more items (paginate)
            //find the data in the cache with resolveFieldByKey
            const key = cache.resolveFieldByKey(
                entityKey,
                fi.fieldKey
            ) as string;
            const data = cache.resolve(key, "posts") as string[];

            //hasMore will default to true unless there isn't, i think there's a better way to do this logic but oh well...
            const _hasMore = cache.resolve(key, "hasMore");
            if (!_hasMore) {
                hasMore = _hasMore as boolean;
            }
            results.push(...data); //combine the paginations into a giant results array
        });

        return { __typename: "PaginatedPosts", hasMore, posts: results };
    };
};

function invalidateAllPosts(cache: Cache) {
    //get all queries in cache
    const allFields = cache.inspectFields("Query");

    //filter only to the queries that are type "posts"
    const fieldInfos = allFields.filter((info) => info.fieldName === "posts");

    //invalidate them all
    fieldInfos.forEach((fi) => {
        cache.invalidate("Query", "posts", fi.arguments || {});
    });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
    let cookie = "";
    if (isServer()) {
        cookie = ctx?.req?.headers?.cookie;
    }

    return {
        url: process.env.NEXT_PUBLIC_API_URL as string,
        fetchOptions: {
            credentials: "include" as const, //this will send the cookie on login (needs to be constant)
            headers: cookie ? { cookie } : undefined, //if user logged in, pass in what they liked on ssr
        },
        exchanges: [
            dedupExchange,
            cacheExchange({
                keys: {
                    PaginatedPosts: () => null, //this to solve error of "request id or _id fields for all selection sets"
                },
                //client side resolvers
                resolvers: {
                    //will run everytime a query is run
                    Query: {
                        posts: cursorPagination(),
                    },
                },
                updates: {
                    Mutation: {
                        deletePost: (_result, args, cache, info) => {
                            //invalidate the cache for the post at postId
                            //causing the client to refetch from the server
                            cache.invalidate({
                                __typename: "Post",
                                id: (args as DeletePostMutationVariables).id,
                            });
                        },
                        //everytime vote mutation is run, get the new point value using cache.readFragment and
                        //update the point counter
                        vote: (_result, args, cache, info) => {
                            const {
                                postId,
                                value,
                            } = args as VoteMutationVariables;
                            const data = cache.readFragment(
                                gql`
                                    fragment _ on Post {
                                        id
                                        points
                                        voteStatus
                                    }
                                `,
                                { id: postId } as any
                            );

                            if (data) {
                                if (data.voteStatus === value) {
                                    return;
                                }
                                //write the new value to the fragment already in cache, updating the value
                                const newPoints =
                                    (data.points as number) +
                                    (!data.voteStatus ? 1 : 2) * value; //haven't voted before should be 1 or -1 and if already voted should be 2 or -2
                                cache.writeFragment(
                                    gql`
                                        fragment __ on Post {
                                            points
                                            voteStatus
                                        }
                                    `,
                                    {
                                        id: postId,
                                        points: newPoints,
                                        voteStatus: value,
                                    } as any
                                );
                            }
                        },
                        //invalidate the cache and refetch from server once user created a post so the user
                        //can see it
                        createPost: (_result, args, cache, info) => {
                            invalidateAllPosts(cache);
                        },

                        //once we logout, clear the cache (setting me to null) so that logged out user can't stuff only logged in user
                        //suposed to see like your own posts and stuff
                        logout: (_result, args, cache, info) => {
                            betterUpdateQuery<LogoutMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                _result,
                                () => ({ me: null })
                            );
                        },
                        //going to run whenever register/login mutation runs
                        //and will update the cache (specifically the me query)
                        login: (_result, args, cache, info) => {
                            betterUpdateQuery<LoginMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                _result,
                                (result, query) => {
                                    if (result.login.errors) {
                                        return query;
                                    } else {
                                        return {
                                            me: result.login.user,
                                        };
                                    }
                                }
                            );

                            //invalidate all posts on login so user can see what they upvoted
                            invalidateAllPosts(cache);
                        },
                        register: (_result, args, cache, info) => {
                            betterUpdateQuery<RegisterMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                _result,
                                (result, query) => {
                                    if (result.register.errors) {
                                        return query;
                                    } else {
                                        return {
                                            me: result.register.user,
                                        };
                                    }
                                }
                            );
                        },
                    },
                },
            }),
            errorExchange,
            ssrExchange,
            fetchExchange,
        ],
    };
};
