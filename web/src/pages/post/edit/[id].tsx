import { Box, Button, Image } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Node } from "slate";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { RichTextEditor } from "../../../components/RichTextEditor";
import { SEO } from "../../../components/SEO";
import {
    usePostQuery,
    useUpdatePostMutation,
} from "../../../generated/graphql";
import { isSlateObject } from "../../../utils/isSlateObject";
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

    const [link, setLink] = useState<string | undefined>("");
    const [updatePost] = useUpdatePostMutation();

    let [textBody, setTextBodyValue] = useState<Node[]>([
        { type: "paragraph", children: [{ text: "" }] },
    ]);

    useEffect(() => {
        //set the values after we fetch the data
        setLink(data?.post?.imageLink);

        if (data?.post?.text) {
            //check whether or not the text is plain or formatted from slate
            //provides backwards compability with old style and new style text
            if (!isSlateObject(data.post.text as string)) {
                console.log("parsing as text");

                setTextBodyValue([
                    {
                        type: "paragraph",
                        children: [
                            {
                                text: data.post.text as string,
                            },
                        ],
                    },
                ]);
            } else {
                console.log("parsing as json object");

                setTextBodyValue(JSON.parse(data.post.text as string));
            }
        }
    }, [data]);

    if (loading) {
        console.log("loading...");

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
            <SEO description={data.post.title} />
            <Formik
                initialValues={{
                    title: data.post.title,
                    text: data.post.text,
                    imageLink: data.post.imageLink,
                }}
                onSubmit={async (values, { setErrors }) => {
                    values.imageLink = link as string;
                    values.text = JSON.stringify(textBody);

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
                        <InputField
                            name="title"
                            placeholder="title"
                            label="Title"
                        />
                        <Box mt={4}>
                            <Box border="1px solid #E2E8F0" borderRadius="5px">
                                <RichTextEditor
                                    textBody={textBody}
                                    setTextBodyValue={setTextBodyValue}
                                />
                            </Box>
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
