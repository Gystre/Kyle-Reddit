import React from "react";
import { Helmet } from "react-helmet";

interface Props {
    url?: string;
    description?: string;
    lang?: string;
    meta?: any[];
}
export const SEO: React.FC<Props> = ({
    url = "https://kylegodly.com",
    description = "",
    lang = "en",
    meta = [],
}) => {
    const title = "Kyle Reddit";
    const author = "Kyle Yu";
    const imageLink = "https://gystre.github.io/assets/profile.jpg";
    const faviconLink = "https://gystre.github.io/assets/favicon.ico";

    return (
        <Helmet
            htmlAttributes={{
                lang,
            }}
            title={title}
            titleTemplate={`%s | ${title}`}
            meta={[
                {
                    name: `description`,
                    content: description,
                },
                {
                    property: `og:title`,
                    content: title,
                },
                {
                    property: `og:description`,
                    content: description,
                },
                {
                    property: `og:url`,
                    content: url,
                },
                {
                    property: `og:type`,
                    content: `website`,
                },
                {
                    property: `og:image`,
                    content: imageLink,
                },
                {
                    property: `theme-color`,
                    content: "#1affd1",
                },
                {
                    name: `twitter:card`,
                    content: `summary_large_image`,
                },
                {
                    name: `twitter:creator`,
                    content: author || ``,
                },
                {
                    name: `twitter:title`,
                    content: title,
                },
                {
                    name: `twitter:image`,
                    content: imageLink,
                },
                {
                    name: `twitter:description`,
                    content: description,
                },
            ].concat(meta)}
        >
            <link rel="icon" type="image/ico" href={faviconLink}></link>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1, viewport-fit=cover"
            />
        </Helmet>
    );
};
