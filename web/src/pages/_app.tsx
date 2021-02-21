import { CSSReset, ThemeProvider } from "@chakra-ui/core";
import { SEO } from "../components/SEO";
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
