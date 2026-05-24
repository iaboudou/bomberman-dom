import { collectPowerUp, spawnPowerUp } from "./PowerUp.js";

export const sendJoinSuccess = (socket, players, newPlayer, messages) => {
    socket.send(
    JSON.stringify({
      type: "JOIN_SUCCESS",
      data: {
        nickname: newPlayer.nickname,
        players: players.map(p => p.nickname),
        messages : messages,
      },
    }),
  );
}

export const broadcastNewPlayer = (players, newPlayer) => {
    players.forEach((p)=> {
    if (p.nickname === newPlayer.nickname) return
    
    p.socket.send(
      JSON.stringify({
        type : "NEW_PLAYER",
        data : {newPlayer : newPlayer.nickname}
      })
    )
  })
}

export const broadCastPlayerLeft = (players,playerLeft) => {
players.forEach((p) => {
if (p.socket && p.socket.readyState === 1)
    p.socket.send(JSON.stringify({
     type: "PLAYER_LEFT",
     data : {left : playerLeft,}
  }));
});
}

export const sendRoomIsFull = (socket)=> {
socket.send(
  JSON.stringify({
    type: "ERROR",
    data: { message: "Room is full" },
  }),
);
}

export const removeAllTimer = (ROOM) => {
if (ROOM.setInterval_waitingTimer) {
  clearInterval(ROOM.setInterval_waitingTimer);
  ROOM.setInterval_waitingTimer = null;
}
if (ROOM.setInterval_countdownTimer) {
  clearInterval(ROOM.setInterval_countdownTimer);
  ROOM.setInterval_countdownTimer = null;
}
ROOM.waitingTime = 0;
ROOM.countdown = 0;
ROOM.status = "INGAME";
      
}

export const sendMapInfo = (players, map) => {
players.forEach((p) => {
  if (p.socket && p.socket.readyState === 1) {
    p.socket.send(JSON.stringify({
      type: "MAP_INIT",
      data: {
        grid: map.grid,
        tiles: map.TILES,
        classes : map.classes,
        players: players.map((player) => ({
          id: player.id,
          nickname: player.nickname,
          x: player.x,
          y: player.y,
          direction: player.direction,
          remaininglife: player.remaininglife,
          maxlife: player.maxlife,
        })),
      },
    }));
  }
});

}

export const MoovePlayer = (direction, player, map, ROOM) => {
  if (!player || !player.canMove()) return;

  let nx = player.x;
  let ny = player.y;

  if (direction === "ArrowUp") ny--;
  if (direction === "ArrowDown") ny++;
  if (direction === "ArrowLeft") nx--;
  if (direction === "ArrowRight") nx++;

  if (map.isWalkable(ny, nx)) {
    player.moove(nx, ny, direction);

    const prevPowerups = ROOM.powerups;
    ROOM.powerups = collectPowerUp(player, ROOM.powerups);
    const powerupsChanged = ROOM.powerups.length !== prevPowerups.length;

    const everyone = [...ROOM.players, ...ROOM.spectators];
    everyone.forEach((p) => {
      if (p.socket && p.socket.readyState === 1) {
        p.socket.send(JSON.stringify({
          type: "PLAYER_MOVED",
          data: {
            id: player.id,
            x: player.x,
            y: player.y,
            direction: player.direction,
        ...(powerupsChanged && { powerups: ROOM.powerups }),
        },
      }));
    }
  });
}
};

export const triggerExplosion = (bomb, map, ROOM) => {
  const cellsAffected = bomb.explode(map);
  const removedBlocks = [];
  const spawnedPowerups = [];
  const deadPlayers = [];
  const affectedPlayers = [];

  cellsAffected.forEach(({ x, y }) => {
    if (map.grid[y][x] === map.TILES.block) {
      map.removeBlock(y, x);
      removedBlocks.push({ x, y });
      const pu = spawnPowerUp(x, y);
      if (pu) {
        ROOM.powerups.push(pu);
        spawnedPowerups.push(pu);
      }
    }

    ROOM.players.forEach((p) => {
      if (p.x === x && p.y === y) {
        p.loseLife();
        if (p.isDead()) {
          deadPlayers.push(p.id);
        } else {
          affectedPlayers.push({ id: p.id, remaininglife: p.remaininglife });
        }
      }
    });
  });

  ROOM.bombs = ROOM.bombs.filter((b) => b.id !== bomb.id);

  // Déplace les morts en spectateurs
  deadPlayers.forEach((deadId) => {
    const dead = ROOM.players.find((p) => p.id === deadId);
    if (dead?.socket?.readyState === 1) {
      dead.socket.send(JSON.stringify({ type: "YOU_DIED" }));
      ROOM.spectators.push(dead);
    }
  });

  // Filtre AVANT de vérifier le gagnant
  ROOM.players = ROOM.players.filter((p) => !p.isDead());

  const everyone = [...ROOM.players, ...ROOM.spectators];

  if (ROOM.players.length <= 1) {
    const winner = ROOM.players[0] || null;
    everyone.forEach((p) => {
      if (p.socket && p.socket.readyState === 1) {
        p.socket.send(JSON.stringify({
          type: "GAME_OVER",
          data: { winner: winner ? { id: winner.id, nickname: winner.nickname } : null },
        }));
      }
    });
  } else {
    everyone.forEach((p) => {
      if (p.socket && p.socket.readyState === 1) {
        p.socket.send(JSON.stringify({
          type: "BOMB_EXPLODED",
          data: { bombId: bomb.id, removedBlocks, spawnedPowerups, deadPlayers, affectedPlayers },
        }));
      }
    });
  }
};