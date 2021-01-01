import { useApolloClient } from "@apollo/client";
import { Box, Button, Heading, Image, Text } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { CommentSection } from "../../components/CommentSection";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { InputField } from "../../components/InputField";
import { Layout } from "../../components/Layout";
import { useCreateCommentMutation, useMeQuery } from "../../generated/graphql";
import { isServer } from "../../utils/isServer";
import { toErrorMap } from "../../utils/toErrorMap";
import { useGetIntId } from "../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { withApollo } from "../../utils/withApollo";

export const Post = ({}) => {
    const apolloClient = useApolloClient();
    const postId = useGetIntId();
    const [stateText, setText] = useState("");

    const { data, error, loading } = useGetPostFromUrl();
    const meResponse = useMeQuery({ skip: isServer() });
    const [createComment] = useCreateCommentMutation();

    if (loading || meResponse.loading) {
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
                    />
                </Box>
            ) : null}
            <br />
            {/* this should go in the comment section component but not sure how heheheh */}
            <Formik
                initialValues={{ text: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await createComment({
                        variables: { postId, text: stateText },
                        update: (cache) => {
                            apolloClient.resetStore();
                        },
                    });

                    if (response.data?.createComment.errors) {
                        setErrors(
                            toErrorMap(response.data.createComment.errors)
                        );
                    } else {
                        setText("");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="text"
                            placeholder="(1-250 characters pls) write stuff here, what did you expect!??!"
                            label={
                                "Comment as " + meResponse.data?.me?.username
                            }
                            textarea
                            value={stateText}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setText(event.target.value);
                            }}
                        />
                        <Text color={stateText.length > 250 ? "red.500" : ""}>
                            Characters: {stateText.length} / 250
                        </Text>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Post comment
                        </Button>
                    </Form>
                )}
            </Formik>
            <br />
            <CommentSection postId={postId} />
            <Box mb={10} />
        </Layout>
    );
};

export default withApollo({ ssr: true })(Post);
