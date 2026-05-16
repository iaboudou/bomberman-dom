.PHONY: install server dev client run

# install server dependencies
install:
	cd server && npm install

# run the server
server:
	cd server && node src/index.js

# run in development mode (auto-restart)
dev:
	cd server && npm run dev

# run the live-server
client:
	cd client && npx live-server

# run both server and client
run:
	make server & make client
