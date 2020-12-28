import { Box, Button, Image, Text } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
    usePostQuery,
    useUpdatePostMutation,
} from "../../../generated/graphql";
import { toErrorMap } from "../../../utils/toErrorMap";
import { useGetIntId } from "../../../utils/useGetIntId";
import { withApollo } from "../../../utils/withApollo";

export const EditPost = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const { data, loading } = usePostQuery({
        skip: intId === -1,
        variables: {
            id: intId,
        },
    });

    const [link, setLink] = useState(data?.post?.imageLink);
    const [updatePost] = useUpdatePostMutation();

    if (loading) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        );
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
        <Layout variant="small">
            <Formik
                initialValues={{
                    title: data.post.title,
                    text: data.post.text,
                    imageLink: data.post.imageLink,
                }}
                onSubmit={async (values, { setErrors }) => {
                    values.imageLink = link as string;

                    //will automatically update the title, text, and textSnippet fields in the cache b/c we supply id
                    const response = await updatePost({
                        variables: { id: intId, input: { ...values } },
                    });

                    if (response.data?.updatePost?.errors) {
                        //there was error
                        setErrors(toErrorMap(response.data.updatePost.errors));
                    } else {
                        //go back to the page they were on before
                        router.back();
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Box mb={4}>
                            <Text>
                                Ur gonna have to refresh the page to see the
                                original image link cuz react is kinda hard
                            </Text>
                            <Button
                                onClick={() => {
                                    setLink(data.post?.imageLink);
                                }}
                            >
                                Refresh data
                            </Button>
                        </Box>
                        <InputField
                            name="title"
                            placeholder="title"
                            label="Title"
                        />
                        <Box mt={4}>
                            <InputField
                                textarea
                                name="text"
                                placeholder="text..."
                                label="Body"
                            />
                        </Box>
                        <Box mt={4}>
                            <InputField
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setLink(event.target.value);
                                }}
                                value={link}
                                name="imageLink"
                                placeholder="Image Link"
                                label="Image Link (optional)"
                            />
                        </Box>
                        {link !== "" ? (
                            <Box>
                                Preview:
                                <Image
                                    src={link}
                                    alt="image doesn't work lol"
                                />
                            </Box>
                        ) : null}
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Update post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withApollo({ ssr: false })(EditPost);
