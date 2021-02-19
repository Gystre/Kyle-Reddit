import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/core";
import React from "react";
import { useCommentsQuery } from "../generated/graphql";
import { convertStringToDate } from "../utils/convertStringToDate";
import { isSlateObject } from "../utils/isSlateObject";
import { useGetIntId } from "../utils/useGetIntId";
import { RichTextViewer } from "./RichTextEditor";

interface Props {
    postId: number;
}
export const CommentSection: React.FC<Props> = ({ postId }) => {
    const { data, error, loading, variables } = useCommentsQuery({
        variables: { postId },
    });

    if (loading) {
        return <div>Loading comments...</div>;
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    if (!data?.comments) {
        return <Box>Error getting comments</Box>;
    }

    if (data?.comments.length == 0) {
        return (
            <Box color="grey" fontSize={18}>
                <i>No comments, be the first to comment!</i>
            </Box>
        );
    } else {
        return (
            <Stack spacing={4}>
                {data!.comments.map((c) =>
                    !c ? null : (
                        <Flex key={c.id} p={5} shadow="md" borderWidth="1px">
                            <Box flex={1}>
                                <Heading fontSize="l">
                                    {c.creator.username} on{" "}
                                    {convertStringToDate(c.createdAt)}
                                </Heading>
                                {isSlateObject(c.text) ? (
                                    <RichTextViewer
                                        textBody={JSON.parse(c.text)}
                                    />
                                ) : (
                                    <Box mt={4}>
                                        <Text wordBreak="break-word">
                                            {c.text}
                                        </Text>
                                    </Box>
                                )}
                            </Box>
                        </Flex>
                    )
                )}
            </Stack>
        );
    }
};
