import { initDoms, resetDoms } from "../../views/game.js";
import { store, useState } from "../../../mini-framework/index.js";

export function startGame(data) {
  store.set({
    map: { grid: data.grid, tiles: data.tiles, classes: data.classes },
  });
  store.set({
    players: data.players.map((p) => {
      return {
        id: p.id,
        nickname: p.nickname,
        x: p.x,
        y: p.y,
        life: p.remaininglife,
        maxlife: p.maxlife,
        direction: p.direction,
        number: p.number,
        ismooving: false,
        isdead: false,
        haslostlife: false,
        isvisible: true,
        speed: 0,
      };
    }),
  });
  store.set({ dyingAnimation: data.dyingAnimationDuration });
  store.set({ lostLifeAnimation: data.losingLifeAnimationDuration });

  store.set({ bombs: [] });
  store.set({ powerups: [] });
  store.set({ explosions: [] });
  store.set({ winner: null });

  const [, setScreen] = useState("screen");
  setScreen("game");

  requestAnimationFrame(() => initDoms());
}

export function endGame(data) {
  store.set({ winner: data.winner });
  resetDoms();
  const [, setScreen] = useState("screen");
  setScreen("result");
}
