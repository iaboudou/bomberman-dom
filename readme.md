# Multiplayer Bomberman Framework (MF)

## Description
A multiplayer Bomberman game built using a custom JavaScript mini-framework. This project focuses on performance (60 FPS), real-time synchronization via WebSockets, and modern web aesthetics without using external game engines or Canvas.

## Features
- **Multiplayer**: 2 to 4 players.
- **Real-time Chat**: Integrated WebSocket-based chat.
- **Custom Framework**: Built entirely on top of a custom Virtual DOM framework.
- **Performance**: Optimized for 60 FPS using `requestAnimationFrame`.
- **Game Mechanics**: Power-ups (Bombs, Flames, Speed), 3 lives per player, random block generation.

## How to Run

1. **Setup**: Install the necessary backend dependencies.
   ```bash
   ./run.sh install
   ```

2. **Run**: Start both the server and the client with a single command.
   ```bash
   ./run.sh run
   ```

To do both (install and run) in one step:
```bash
./run.sh all
```

## Navigation Flow
1. **Welcome**: Enter your nickname.
2. **Lobby**: Waiting room for players (counter 2-4) and Chat.
3. **Game**: Battle on the map.
4. **Result**: Check if you won or lost.
