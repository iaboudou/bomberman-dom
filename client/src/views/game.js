import { El, Dom, events, useState } from "../../mini-framework/index.js";
import { generateMap } from "../core/Map.js";
import { renderGrid } from "../components/Grid.js";

export function GameView() {
  return El(
    "div",
    { id: "app" },
    El("div", { id: "ui" }),
    El("div", { id: "map" },
      El("div", { id: "grid" }),
      El("div", { id: "players" }),
      El("div", { id: "bombs" }),
      El("div", { id: "powerups" })
    )
  );
}

export function startGame() {
  let gridDOM = new Dom(document.getElementById("grid"), events);
  useState("map", generateMap(), (map) => gridDOM.scheduleMount(renderGrid(map)));
  // useState("players", [],            (players) => playersDOM.scheduleMount(renderPlayers(players)));
  // useState("ui",      {},            (ui)      => uiDOM.scheduleMount(renderUI(ui)));
}
