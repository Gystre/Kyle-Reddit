//this file has brackets in it's name b/c we need variable in url (it's a next.js convention)
import { Box, Button, Flex, Link } from "@chakra-ui/core";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import {
    MeDocument,
    MeQuery,
    useChangePasswordMutation,
} from "../../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import NextLink from "next/link";
import { withApollo } from "../../utils/withApollo";

const ChangePassword: NextPage = () => {
    const router = useRouter();
    const [changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState("");
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({
                        variables: {
                            newPassword: values.newPassword,
                            token:
                                typeof router.query.token === "string"
                                    ? router.query.token
                                    : "",
                        },

                        //log the user in once they finish resetting password
                        update: (cache, { data }) => {
                            cache.writeQuery<MeQuery>({
                                query: MeDocument, //MeDocument = query in a gql string
                                data: {
                                    __typename: "Query",
                                    me: data?.changePassword.user,
                                },
                            });
                        },
                    });
                    if (response.data?.changePassword.errors) {
                        //there was error
                        //transform the returned message error array into a map that formik understands
                        const errorMap = toErrorMap(
                            response.data.changePassword.errors
                        );

                        if ("token" in errorMap) {
                            //pass in error msg for token
                            setTokenError(errorMap.token);
                        }

                        setErrors(errorMap);
                    } else if (response.data?.changePassword.user) {
                        //worked, redirect them to homepage
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="newPassword"
                            placeholder="new password"
                            label="New Password"
                            type="password"
                        />
                        {tokenError ? (
                            <Flex>
                                <Box mr={4} style={{ color: "red" }}>
                                    {tokenError}
                                </Box>
                                <NextLink href="/forgot-password">
                                    <Link>click here to get a new link</Link>
                                </NextLink>
                            </Flex>
                        ) : null}
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Change password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withApollo({ ssr: false })(ChangePassword);
