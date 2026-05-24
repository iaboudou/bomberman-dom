import { El, Dom, events, useState, router } from "../../mini-framework/index.js";
import { GameMap } from "../entities/Map.js";
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

  const [Map, setMap] = useState("map", gameMap);
  
  const [currentPlayer] = useState("currentPlayer");
  const [players] = useState("players");
  const [screen, setScreen] = useState("screen", "welcome");

  const [bombs] = useState("bombs", []);
  const [powerups] = useState("powerups", []);
  const [isSpectator] = useState("spectator", false);

  const handleMove = (e) => {
    if (isSpectator) return;
    e.preventDefault();

    if (e.key === " ") {
      sendBomb();
      return;
    }

    const validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

    if (validKeys.includes(e.key)) {
      sendMove(e.key);
    }
  };


  return El(
    "div",
    {
      id: "app",
      tabindex: "0",
      autofocus: true,
      onKeydown: (e) => handleMove(e),
    },
   El(
  "div",
  { id: "ui" },
  El("div", { class: "ui-players" },
    players.map((p) =>
      El("div", { class: "ui-player", style: `--player-color: ${playerColor(p.nickname)}` },
        El("span", { class: "ui-avatar" }, p.nickname[0].toUpperCase()),
        El("div", { class: "ui-lives" },
          Array.from({ length: p.maxlife }, (_, i) =>
            El("span", { class: `ui-heart ${i < p.remaininglife ? "alive" : "lost"}` }, "♥")
          )
        )
      )
    )
  )),
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
