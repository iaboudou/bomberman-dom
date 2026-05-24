import { El, Dom, events, useState, router } from "../../mini-framework/index.js";
import { renderGrid } from "../components/Grid.js";
import { GameMap } from "../core/Map.js";
import { map, sendMove, sendBomb, ws } from "../services/ws.js";

export const playerColor = (nickname) => {
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
};

export function GameView() {
  const gameMap = new GameMap(map.grid, map.tiles);

  const [Map, setMap] = useState("map", gameMap, () => {
    router.render();
  });
  const [currentPlayer] = useState("currentPlayer");
  const [players] = useState("players");
  if (!currentPlayer || !players || !gameMap) return router.navigate("#");
  if (players.length === 1) {
    // useState("winner", players[0])
    // const [, setScreen] = useState("screen")
    // setScreen("result")
    return
  }

  const [bombs] = useState("bombs", []);
  const [powerups] = useState("powerups", []);



  const handleMove = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      sendBomb();
      return;
    }

    const validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

    if (validKeys.includes(e.key)) {
      e.preventDefault();
      sendMove(e.key);
    }
  };


  return El(
    "div",
    {
      id: "app",
      tabindex: "0",
      autofocus: true,
      onKeydown: (e) => handleMove(e, currentPlayer),
    },
    El(
      "div",
      { id: "ui" }
    ),
    El(
      "div",
      { id: "map" },
      El(
        "div",
        { class: "grid" },
        Map.grid
          .flat()
          .map((cell, i) =>
            El("div", { key: i, class: `cell ${Map.classes[cell]}` }),
          ),
      ),
      El(
        "div",
        { id: "players" },
        players.map((p) =>
          El(
            "div",
            {
              key: p.id,
              class: "player",
              style: `--player-color: ${playerColor(p.nickname)}; --px: ${p.x * 48}px; --py: ${p.y * 48}px`,
            },
            El("span", { class: "player-label" }, p.nickname[0].toUpperCase()),
          ),
        ),
      ),
      El(
        "div",
        { id: "bombs" },
        bombs.map((b) =>
          El(
            "div",
            {
              key: b.id,
              class: "bomb",
              style: `--px: ${b.x * 48}px; --py: ${b.y * 48}px`,
            },
            El("span", null, "💣"),
          ),
        ),
      ),
      El(
        "div",
        { id: "powerups" },
        powerups.map((pw) =>
          El(
            "div",
            {
              key: pw.id,
              class: "powerup",
              style: `--px: ${pw.x * 48}px; --py: ${pw.y * 48}px`,
            },
            El("span", { class: `${pw.type}` }, pw.icones[pw.type]),
          ),
        ),
      ),
    ),
  );
}
