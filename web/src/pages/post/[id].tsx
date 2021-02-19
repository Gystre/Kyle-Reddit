import { useApolloClient } from "@apollo/client";
import { Box, Button, FormLabel, Heading, Image, Text } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import React, { useMemo, useState } from "react";
import { createEditor, Node } from "slate";
import { stringifyVariables } from "urql";
import { CommentSection } from "../../components/CommentSection";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { InputField } from "../../components/InputField";
import { Layout } from "../../components/Layout";
import {
    RichTextEditor,
    RichTextViewer,
} from "../../components/RichTextEditor";
import { useCreateCommentMutation, useMeQuery } from "../../generated/graphql";
import { isServer } from "../../utils/isServer";
import { isSlateObject } from "../../utils/isSlateObject";
import { slateObjectCharacterLength } from "../../utils/slateObjectCharacterLength";
import { toErrorMap } from "../../utils/toErrorMap";
import { useGetIntId } from "../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { withApollo } from "../../utils/withApollo";

export const Post = ({}) => {
    const apolloClient = useApolloClient();
    const postId = useGetIntId();

    const { data, error, loading } = useGetPostFromUrl();
    const meResponse = useMeQuery({ skip: isServer() });
    const [createComment] = useCreateCommentMutation();

    let [commentBody, setCommentBodyValue] = useState<Node[]>([
        { type: "paragraph", children: [{ text: "" }] },
    ]);

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

    const commentLength = slateObjectCharacterLength(commentBody);

    return (
        <Layout>
            {/* flex buttons to right later */}
            <EditDeletePostButtons
                id={data.post.id}
                creatorId={data.post.creator.id}
            />
            <Heading mb={4}>{data.post.title}</Heading>
            <Box mb={4}>
                {isSlateObject(data.post.text) ? (
                    <RichTextViewer textBody={JSON.parse(data.post.text)} />
                ) : (
                    <Text>{data.post.text}</Text>
                )}
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
            {/* empty div to jump to */}
            <div id="comments"></div>
            {/* this should go in the comment section component but not sure how heheheh */}
            <Formik
                initialValues={{ text: "" }}
                onSubmit={async (values, { setErrors }) => {
                    values.text = JSON.stringify(commentBody);

                    const response = await createComment({
                        variables: {
                            postId,
                            text: JSON.stringify(commentBody),
                        },
                        update: (cache) => {
                            apolloClient.resetStore();
                        },
                    });

                    if (response.data?.createComment.errors) {
                        setErrors(
                            toErrorMap(response.data.createComment.errors)
                        );
                    } else {
                        setCommentBodyValue([
                            { type: "paragraph", children: [{ text: "" }] },
                        ]);
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <FormLabel>
                            {"Comment as " + meResponse.data?.me?.username}
                        </FormLabel>

                        <Box border="1px solid #E2E8F0" borderRadius="5px">
                            <RichTextEditor
                                textBody={commentBody}
                                setTextBodyValue={setCommentBodyValue}
                                placeholder="(1-250 characters pls) write stuff here, what did you expect!??!"
                            />
                        </Box>
                        {/* <InputField
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
                        /> */}
                        <Text color={commentLength > 250 ? "red.500" : ""}>
                            Characters: {commentLength} / 250
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
