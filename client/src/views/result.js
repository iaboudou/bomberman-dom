import { El, useState, store } from "../../mini-framework/index.js";
import { send } from "../services/ws.js";
import { getPlayerPosition } from "./utils.js";

export function ResultView() {
  const winner = store.get("winner");
  const [nickname] = useState("nickname");
  const players = store.get("players") || [];
  const isWinner = winner && winner.nickname === nickname;
  const isDraw = !winner;

  return El(
    "div",
    { class: "result-container" },
    El("div", {id: "logo"}, "BOMBERMAN"),
    El(
      "h1",
      { class: "game-title" },
      isDraw ? "DRAW" : isWinner ? "VICTORY" : "DEFEAT",
    ),
    El(
      "div",
      { class: "result-players" },
      players.map((p) =>
        El(
          "div",
          {
            key: p.id,
            class: `${winner && p.id === winner.id ? "playerWinner" : "playerLoser"}`,
            style: `--player: ${getPlayerPosition(p, winner && p.id === winner.id)};`,
          },
          El("div", { class: "result-nickname" }, p.nickname),
        ),
      ),
    ),
    El(
      "button",
      {
        class: "welcome-btn",
        onclick: () => {
          store.reset();
          send("JOIN", { nickname });
        },
      },
      "PLAY AGAIN",
    ),
  );
}
