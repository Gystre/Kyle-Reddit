import { Box, Heading, Image, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { withApollo } from "../../utils/withApollo";

export const Post = ({}) => {
    const { data, error, loading } = useGetPostFromUrl();

    if (loading) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        );
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    //couldn't find a post with that id
    if (!data?.post) {
        return (
            <Layout>
                <Box>Couldn't find post</Box>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* flex buttons to right later */}
            <EditDeletePostButtons
                id={data.post.id}
                creatorId={data.post.creator.id}
            />
            <Heading mb={4}>{data.post.title}</Heading>
            <Box mb={4}>
                <Text>{data.post.text}</Text>
            </Box>
            {data.post.imageLink != "" ? (
                <Box>
                    <Image
                        src={data.post.imageLink}
                        alt="broken image lmao"
                        objectFit="cover"
                    ></Image>
                </Box>
            ) : null}
        </Layout>
    );
};

export default withApollo({ ssr: true })(Post);
