import { El, gridDOM, playersDOM, uiDOM, useState } from "../index.js";
import { generateMap } from "../core/Map.js";
import { renderGrid } from "../components/Grid.js";

export function startGame() {
  useState("map",     generateMap(), (map)     => gridDOM.scheduleMount(renderGrid(map)));
  // useState("players", [],            (players) => playersDOM.scheduleMount(renderPlayers(players)));
  // useState("ui",      {},            (ui)      => uiDOM.scheduleMount(renderUI(ui)));
}