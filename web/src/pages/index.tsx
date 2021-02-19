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
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { RichTextViewer } from "../components/RichTextEditor";
import { SEO } from "../components/SEO";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { convertStringToDate } from "../utils/convertStringToDate";
import { isSlateObject } from "../utils/isSlateObject";
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
            <SEO
                url={window.location.href}
                description="The homepage of Kyle Reddit. I mean what were u expecting bruh"
            />
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
                                    <Text color="grey">
                                        <em>
                                            posted by {p.creator.username} on{" "}
                                            {convertStringToDate(p.createdAt)}
                                        </em>
                                    </Text>
                                    <Flex align="center" mt="4px">
                                        {isSlateObject(p.textSnippet) ? (
                                            <RichTextViewer
                                                textBody={JSON.parse(
                                                    p.textSnippet
                                                )}
                                            />
                                        ) : (
                                            <Text flex={1} mt={4}>
                                                {p.textSnippet}
                                            </Text>
                                        )}

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
                                        <NextLink
                                            href="/post/[id]/#comments"
                                            as={`/post/${p.id}/#comments`}
                                        >
                                            <Link>
                                                {p.commentsCount == 1 ? (
                                                    <i>
                                                        {p.commentsCount}{" "}
                                                        comment
                                                    </i>
                                                ) : (
                                                    <i>
                                                        {p.commentsCount}{" "}
                                                        comments
                                                    </i>
                                                )}
                                            </Link>
                                        </NextLink>
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
