#!/bin/bash

echo What should the version be?
read VERSION
echo $VERSION

docker build -t xaist/kyle-reddit:$VERSION .
docker push xaist/kyle-reddit:$VERSION

cd ../web

vercel --prod

plink.exe -load "kyle-reddit-ssh" "docker pull xaist/kyle-reddit:$VERSION && docker tag xaist/kyle-reddit:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"

yes " " | head -2 |
