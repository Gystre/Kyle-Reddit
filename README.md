# Kyle-Reddit

This project is a way for me to learn the full stack development experience, from server -> web -> domain registration -> vps -> deploy. Followed a YouTube tutorial to get the gist of things and started building off it once I wanted more features. Sort of a spiritual successor to Kylegram. Super cool!!!

## Showcase:

![really cool picture of the website](https://cdn.discordapp.com/attachments/200994742782132224/814019365128634389/unknown.png)

## How to setup:

Before installation you need to install: postgres and redis

1. go into each directory (common, server, and web) and run `yarn install`
2. cd into common and run `tsc --watch`
3. cd into server and run `yarn watch` and `yarn dev`
4. cd into web and run `yarn dev`

Webserver is hosted on http://localhost:3000/
Graphql is hosted on http://localhost:4000/graphql

Note: If you are getting wrong type error in server/index.tsx, make sure to delete the extra node_modules folder that is created inside of server/@types/connect-redis

## Todo

## Finished

-   created at on post
-   image link for each post
-   comments on each post
-   rich text formatting (display rich text, edit post's rich text, and display post rich text on landing page) (2/18/2021)

## Where to improve

-   need to find reliable way to upload, store, and serve images
-   edit and delete comments
-   paginate comments

## To deploy:

-   need putty to ssh into vps when using deploy.sh
