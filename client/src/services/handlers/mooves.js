import { store } from "../../../mini-framework/index.js";
import { animateMove } from "../../views/game.js";

export function moovePlayer(data) {
  const players = store.get("players") || [];

  const updatedPlayers = players.map((p) => {
    if (p.id === data.id) {
      animateMove(p, players, data.direction);
      return {
        ...p,
        x: (data.x - 1) * 3,
        y: (data.y - 1) * 3,
        direction: data.direction,
        life: data.remaininglife,
        haslostlife: p.life === data.remaininglife ? false : true,
        ismooving: p.life === data.remaininglife ? true : false,
        isdead: data.remaininglife === 0,
        speed: data.duration,
      };
    } else {
      return p;
    }
  });

  store.set({
    players: updatedPlayers,
    playersLife: updatedPlayers,
  });

  if (data.takenPowerup) {
    const powerups = store.get("powerups") || [];
    store.set({
      powerups: powerups.filter((pu) => pu.id !== data.takenPowerup.id),
    });
  }
}
