import { El, useState, router, store } from "../../mini-framework/index.js";
import { sendResetGame } from "../services/ws.js";
import { playerColor } from "./game.js";

export function ResultView() {
  const [winner] = useState("winner", null);
  const [nickname] = useState("nickname");
  const players = store.get("players") || [];

  const isWinner = winner && winner.nickname === nickname;
  const isDraw = !winner;

  return El(
    "div",
    { class: "result-container" },

    El(
      "p",
      { class: "result-title" },
      isDraw ? "DRAW" : isWinner ? "VICTORY" : "DEFEAT"
    ),

    !isDraw
      ? El(
          "div",
          {
            class: "winner-card",
            style: `--player-color: ${playerColor(winner.nickname)}`,
          },
          El(
            "div",
            { class: "winner-avatar" },
            winner.nickname[0].toUpperCase()
          ),
          El("span", { class: "winner-nickname" }, winner.nickname),
          El("span", { class: "winner-label" }, "WINNER")
        )
      : El("p", {}, "Everyone died in the explosion."),
    players.length > 1
      ? El(
          "button",
          {
            class: "result-btn",
            style: `--player-color: ${
              isWinner ? playerColor(nickname) : "aliceblue"
            }`,
            onclick: () => {
              sendResetGame();
            },
          },
          "PLAY AGAIN"
        )
      : El(
          "button",
          {
            class: "result-btn",
            style: `--player-color: ${
              isWinner ? playerColor(nickname) : "aliceblue"
            }`,
            onclick: () => {
              const [, setScreen] = useState("screen");
              sendResetGame();
              store.reset();
              setScreen("welcome");
            },
          },
          "BACK TO HOME PAGE"
        )
  );
}
