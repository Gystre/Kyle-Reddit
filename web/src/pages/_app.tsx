import { CSSReset, ThemeProvider } from "@chakra-ui/core";
import { SEO } from "../components/SEO";
import theme from "../theme";
import "./_app.css";

function MyApp({ Component, pageProps }: any) {
    return (
        <ThemeProvider theme={theme}>
            <SEO
                url={window.location.href}
                description="It's like reddit, but cooler!!!"
            />
            <CSSReset />
            <Component {...pageProps} />
        </ThemeProvider>
    );
}

export default MyApp;
