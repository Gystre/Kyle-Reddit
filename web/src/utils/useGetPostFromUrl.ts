import { resolveHref } from "next/dist/next-server/lib/router/router";
import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

//convert id in the url to an int
export const useGetPostFromUrl = () => {
    const intId = useGetIntId();

    return usePostQuery({
        skip: intId === -1,
        variables: {
            id: intId,
        },
    });
};
