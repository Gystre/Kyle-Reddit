FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# split up the copys to cache the stuff before and install the dependencies if anything changed
COPY package.json ./
COPY yarn.lock ./

RUN yarn

# copy all the files before building them
COPY . .
# production environment vars -> .env
COPY .env.production .env 

RUN yarn build

ENV NODE_ENV production

EXPOSE 8080
CMD [ "node", "dist/index.js" ]

# set the user to use when running this image
USER node