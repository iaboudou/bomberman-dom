import { El, useState } from "../../mini-framework/index.js";
import { sendChatMessage } from "../services/ws.js";

// this is the lobby page where players wait for the game to start
export function LobbyView() {
  const [lobbyTimer] = useState("lobbyTimer");
  const [roomMates] = useState("roomMates"); // list of players in the lobby
  const [chatMessages] = useState("chatMessages"); // chat messages in the lobby

  const waitingTime = lobbyTimer.type === "waitingTime" ? lobbyTimer.value : 0;
  const countdown = lobbyTimer.type === "countdown" ? lobbyTimer.value : 0;
  const hasTimer = (waitingTime > 0 && roomMates.length >= 2) || countdown > 0;
  const timerLabel =
    waitingTime > 0 && roomMates.length >= 2
      ? "Waiting time"
      : "Game starts in ";
  const timerValue =
    waitingTime > 0 && roomMates.length >= 2 ? waitingTime : countdown;

  return El(
    "div",
    { class: "lobby-screen" },
    El(
      "div",
      { class: "lobby-container" },

      El(
        "div",
        {},
        El("h1", {}, "BOMBERMAN"),
        El("p", {}, `Players: ${roomMates.length}/4`),
        El(
          "p",
          { class: `status-label ${hasTimer ? "" : "is-hidden"}` },
          timerLabel
        ),
        El(
          "div",
          { class: `status-box ${hasTimer ? "" : "is-hidden"}` },
          hasTimer ? `${timerValue}s` : "0s"
        ),
        El(
          "p",
          {
            class: `waiting-message ${roomMates.length < 2 ? "" : "is-hidden"}`,
          },
          "Waiting for more players to join..."
        ),
        El(
          "div",
          { class: "players-list" },
          El("h3", {}, "Connected Players"),
          roomMates.map((player, i) =>
            El(
              "div",
              { key: player.nickname, class: "player-item" },
              El("span", { class: "player-status" }),
              El("span", { class: "player-name" }, player.nickname),
              El("span", { class: "player-number" }, ` (player ${i + 1})`)
            )
          )
        )
      ),
      El(
        "div",
        {},
        El("h3", {}, "Lobby Chat"),
        El(
          "div",
          { class: "chat-messages" },
          chatMessages.map((msg) =>
            El(
              "div",
              { key: msg.id, class: "chat-message" },
              El("strong", { class: "chat-author" }, `${msg.nickname}`),
              El("span", { class: "chat-text" }, msg.message)
            )
          )
        ),
        El(
          "form",
          {
            // Handle chat message submission
            onsubmit: (e) => {
              e.preventDefault();
              const input = e.target.message;
              const message = input.value.trim();
              if (message) {
                sendChatMessage(message);
                input.value = "";
              }
            },
          },
          El("input", {
            type: "text",
            name: "message",
            class: "chat-input",
            placeholder: "Type a message...",
            maxlength: "100",
            required: true,
          }),
          El("button", { type: "submit" }, "Send")
        )
      )
    )
  );
}
