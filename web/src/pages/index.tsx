import {
    Box,
    Button,
    Flex,
    Heading,
    Image,
    Link,
    Stack,
    Text,
} from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import { Helmet } from "react-helmet";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { convertStringToDate } from "../utils/convertStringToDate";
import { withApollo } from "../utils/withApollo";

const Index = () => {
    //get the posts
    const { data, error, loading, fetchMore, variables } = usePostsQuery({
        variables: {
            limit: 15,
            cursor: null, //cursor will tell us at what point we want to fetch posts
        },
        notifyOnNetworkStatusChange: true, //loading will become true if click loadMore (enable the little spinning thing on load more button)
    });

    if (!loading && !data) {
        return (
            <div>
                <div>you got query failed for some reason</div>;
                <div>{error?.message}</div>
            </div>
        );
    }

    return (
        <Layout>
            <Helmet>
                <meta
                    http-equiv="Content-Type"
                    content="text/html; charset=UTF-8"
                />

                <meta http-equiv="x-ua-compatible" content="ie=edge" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                />

                <title>Kyle Reddit</title>
                <meta
                    name="description"
                    content="It's like reddit but cooler!!! かっこいい！！"
                />

                {/* Apple Stuff */}
                <link
                    rel="apple-touch-icon"
                    href="https://gystre.github.io/assets/favicon.ico"
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black"
                />
                <meta name="apple-mobile-web-app-title" content="Kyle Reddit" />

                {/*  MS Tile - for Microsoft apps */}
                <meta
                    name="msapplication-TileImage"
                    content="https://gystre.github.io/assets/profile.jpg"
                />

                {/*  Facebook Meta Tags */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Kyle Reddit" />
                <meta
                    property="og:description"
                    content="It's like reddit but cooler!!! かっこいい！！"
                />
                <meta property="og:url" content="https://kylegodly.com" />
                <meta
                    property="og:image"
                    content="https://gystre.github.io/assets/profile.jpg"
                />
                <meta name="theme-color" content="#1affd1" />

                {/* Twitter Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Kyle Reddit" />
                <meta
                    name="twitter:description"
                    content="It's like reddit but cooler!!! かっこいい！！"
                />
                <meta
                    name="twitter:image"
                    content="https://gystre.github.io/assets/profile.jpg"
                />

                <link
                    rel="icon"
                    type="image/ico"
                    href="https://gystre.github.io/assets/favicon.ico"
                ></link>
            </Helmet>

            {!data && loading ? (
                <div>loading...</div>
            ) : (
                <Stack spacing={8}>
                    {data!.posts.posts.map((p) =>
                        !p ? null : (
                            <Flex
                                key={p.id}
                                p={5}
                                shadow="md"
                                borderWidth="1px"
                            >
                                <UpdootSection post={p} />
                                <Box flex={1}>
                                    <NextLink
                                        href="/post/[id]"
                                        as={`/post/${p.id}`}
                                    >
                                        <Link>
                                            <Heading fontSize="xl">
                                                {p.title}
                                            </Heading>
                                        </Link>
                                    </NextLink>
                                    <Text>
                                        posted by {p.creator.username} on{" "}
                                        {convertStringToDate(p.createdAt)}
                                    </Text>
                                    <Flex align="center">
                                        <Text flex={1} mt={4}>
                                            {p.textSnippet}
                                        </Text>

                                        <Box ml="auto" pl={4}>
                                            <EditDeletePostButtons
                                                id={p.id}
                                                creatorId={p.creator.id}
                                            />
                                        </Box>
                                    </Flex>
                                    {p.imageLink !== "" ? (
                                        <Image
                                            mt={4}
                                            objectFit="cover"
                                            src={p.imageLink}
                                            alt="broken image lmao"
                                        />
                                    ) : null}
                                    <br />
                                    <Box color="grey" fontSize={18}>
                                        {p.commentsCount == 1 ? (
                                            <i>{p.commentsCount} comment</i>
                                        ) : (
                                            <i>{p.commentsCount} comments</i>
                                        )}
                                    </Box>
                                </Box>
                            </Flex>
                        )
                    )}
                </Stack>
            )}
            {data && data.posts.hasMore ? (
                <Flex>
                    <Button
                        onClick={() =>
                            fetchMore({
                                variables: {
                                    limit: variables?.limit,
                                    cursor:
                                        data.posts.posts[
                                            data.posts.posts.length - 1
                                        ].createdAt, //get all items after the last item in the list
                                },
                            })
                        }
                        isLoading={loading}
                        m="auto"
                        my={8}
                    >
                        Load more
                    </Button>
                </Flex>
            ) : null}
        </Layout>
    );
};
export default withApollo({ ssr: true })(Index);
