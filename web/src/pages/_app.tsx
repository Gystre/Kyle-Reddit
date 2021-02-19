import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import { PaginatedPosts } from "../generated/graphql";
import theme from "../theme";
import "./_app.css";

function MyApp({ Component, pageProps }: any) {
    return (
        <ThemeProvider theme={theme}>
            <CSSReset />
            <Component {...pageProps} />
        </ThemeProvider>
    );
}

export default MyApp;
