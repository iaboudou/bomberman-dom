#!/bin/bash
ROOT=$PWD

install() {
	cd $ROOT/server && npm install
	cd $ROOT
}

server() {

	echo "Server running at ws://localhost:8080"
	cd $ROOT/server && node index.js
}

client() {
	echo "Client running at ws://localhost:3000"
	npx live-server $ROOT/client --port=3000 --quiet
}

run() {
	server & client
}

all() {
	install
	server & client
}

$1