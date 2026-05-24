import { El, useState, router } from "../../mini-framework/index.js";
import { playerColor } from "./game.js";

export function ResultView() {
  const [winner] = useState("winner", null);
  const [nickname] = useState("nickname");

  const isWinner = winner && winner.nickname === nickname;
  const isDraw = !winner;

  return El(
    "div",
    { class: "result-container" },

    El("p", { class: "result-title" }, isDraw ? "DRAW" : isWinner ? "VICTORY" : "DEFEAT"),

    !isDraw
      ? El("div", {
          class: "winner-card",
          style: `--player-color: ${playerColor(winner.nickname)}`
        },
          El("div", { class: "winner-avatar" }, winner.nickname[0].toUpperCase()),
          El("span", { class: "winner-nickname" }, winner.nickname),
          El("span", { class: "winner-label" }, "WINNER")
        )
      : El("p", {}, "Everyone died in the explosion."),

    El("button", {
      class: "result-btn",
      style: `--player-color: ${isWinner ? playerColor(nickname) : "aliceblue"}`,
      onclick: () => {}
    }, "PLAY AGAIN"),
  );
}