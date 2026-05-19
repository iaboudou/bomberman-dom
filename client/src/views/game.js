import { El, Dom, events, useState, router } from "../../mini-framework/index.js";
import { renderGrid } from "../components/Grid.js";
import { GameMap } from "../core/Map.js";
import { map } from "../services/ws.js";

export function GameView() {
  const gameMap = new GameMap(map.grid, map.tiles);

  const [currentMap, setMap] = useState("map", gameMap, () => {
    router.render();
  });

  return El(
    "div",
    { id: "app" },
    El("div", { id: "ui" }),
    El(
      "div",
      { id: "map" },
      renderGrid(currentMap),
      El("div", { id: "players" }),
      El("div", { id: "bombs" }),
      El("div", { id: "powerups" }),
    ),
  );
}
