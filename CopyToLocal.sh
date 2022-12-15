#!/bin/bash

cp index.html vscode/vscode-web
cd vscode/vscode-web
# sed -i -e 's|"scheme":"https"|"scheme":"http"|g' index.html
sed -i -e 's|siv3d.dev|localhost:8080|g' index.html

if [ ! -e key.pem ]; then
    openssl genrsa 2048 > key.pem
    openssl req -new -key key.pem > cert.csr
    openssl x509 -days 3650 -req -sha256 -signkey key.pem < cert.csr > cert.pem
fi
