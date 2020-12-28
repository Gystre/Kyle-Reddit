SERVER STUFF
//start redis up
redis-server

//compiles typescript -> javascript
yarn watch

//checks for changes in typescript files and recompiles
yarn dev

//update entities fields (do after adding something new to the entities)
yarn createMigration


express-session is responsible for setting the cookies





CLIENT STUFF
//start workspace
yarn dev

//add a mutation or query, use the hook that is auto generated for TYPE COMPLETION YAAAAY
yarn gen




NOTES:
serverside rendering is good for seo b/c google doesn't need to evaluate the js to see the resulting html
ssr works like this:
user -> goes to site
-> site contacts server
-> server fetches graphql, builds HTML, and sends to client
-> client receives page

initial page is loaded with ssr -> every page load after that is browser loaded