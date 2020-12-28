import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false);
    const [forgotPassword] = useForgotPasswordMutation();
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    await forgotPassword({ variables: values });
                    setComplete(true);
                }}
            >
                {({ isSubmitting }) =>
                    complete ? (
                        <Box>
                            if an account with that email exists, check your
                            inbox for the email!
                        </Box>
                    ) : (
                        <Form>
                            <Box mt={4}>
                                <InputField
                                    name="email"
                                    placeholder="email"
                                    label="Email"
                                />
                            </Box>

                            <Button
                                mt={4}
                                type="submit"
                                isLoading={isSubmitting}
                                variantColor="teal"
                            >
                                Forgot password
                            </Button>
                        </Form>
                    )
                }
            </Formik>
        </Wrapper>
    );
};

export default withApollo({ ssr: false })(ForgotPassword);
