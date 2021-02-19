import { Box, Button, FormLabel, Image } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Node } from "slate";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { RichTextEditor } from "../components/RichTextEditor";
import { SEO } from "../components/SEO";
import { useCreatePostMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";

// will need to add validation on the submit form (checking if user is logged in and what not)
const CreatePost: React.FC<{}> = () => {
    const router = useRouter();
    useIsAuth();

    const [createPost] = useCreatePostMutation();

    const [link, setLink] = useState("");

    let [textBody, setTextBodyValue] = useState<Node[]>([
        { type: "paragraph", children: [{ text: "" }] },
    ]);

    return (
        <Layout variant="small">
            <SEO
                url={window.location.href}
                description="Create a post on KYLE REDDIT!!!!!"
            />
            <Formik
                initialValues={{ title: "", text: "", imageLink: "" }}
                onSubmit={async (values, { setErrors }) => {
                    values.text = JSON.stringify(textBody);
                    //weird how hooking onChange removes the auto fill in for values...
                    values.imageLink = link;

                    const response = await createPost({
                        variables: { input: values },
                        update: (cache) => {
                            //invalidate all posts queries
                            cache.evict({ fieldName: "posts:{}" });
                            cache.gc();
                        },
                    });

                    if (response.data?.createPost.errors) {
                        //there was error
                        setErrors(toErrorMap(response.data.createPost.errors));
                    } else if (response.data?.createPost.post) {
                        router.push("/");
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
                            <FormLabel>Body</FormLabel>
                            <Box border="1px solid #E2E8F0" borderRadius="5px">
                                <RichTextEditor
                                    textBody={textBody}
                                    setTextBodyValue={setTextBodyValue}
                                    placeholder="text..."
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
                            Create post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withApollo({ ssr: false })(CreatePost);
