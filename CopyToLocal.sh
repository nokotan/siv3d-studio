#!/bin/bash

cd dist

sed -i -e 's|siv3d.dev|localhost:8080|g' index.html
sed -i -e 's|siv3d.dev|localhost:8080|g' config.js
sed -i -e "s|https://siv3d.dev/callback|https://localhost:8080/callback|g" extensions/github-authentication/dist/browser/extension.js
