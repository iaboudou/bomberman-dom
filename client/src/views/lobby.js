import { El, useState } from "../../mini-framework/index.js";
import { sendSwitchToGameMap } from "../services/ws.js";

// this is the lobby page where players wait for the game to start
export function LobbyView(props) {
  const [waitingTime] = useState("waitingTime", 0); // waiting time before game starts (after 2 players joined)
  const [countdown] = useState("countdown", 0); // countdown before game starts (after waiting time is over)
  const [playersList] = useState("players", []); // list of players in the lobby
  const [chatMessages] = useState("chatMessages", []); // chat messages in the lobby

  // Handle chat message submission
  function handleChatSubmit(e) {
    e.preventDefault();
    const input = e.target.message;
    const message = input.value.trim();
    if (message && props.onChatSubmit) {
      props.onChatSubmit(message);
      input.value = "";
    }
  }

  return El(
    "div",
    { class: "lobby-screen" },
    El(
      "div",
      { class: "lobby-container" },

      El(
        "div",
        {},
        El("h1", {}, "Waiting for Players"),
        El("p", {}, `Players: ${playersList.length}/4`),
        (waitingTime > 0 && playersList.length >= 2) || countdown > 0
          ? El("p", { class: "status-label" }, (waitingTime > 0 && playersList.length >= 2) ? "Waiting time" : "Game starts in ")
          : null,
        waitingTime > 0 && playersList.length >= 2
          ? El("div", { class: "status-box" }, `${waitingTime}s`)
          : null,
        countdown > 0 ? El("div", { class: "status-box" }, `${countdown}s`) : null,
        playersList.length < 2
          ? El("p", {}, "Waiting for more players to join...")
          : null,
        El(
          "div",
          { class: "players-list" },
          El("h3", {}, "Connected Players"),
          ...(playersList || []).map((player) =>
            El(
              "div",
              { key: player.id, class: "player-item" },
              El("span", {}),
              ` ${player.nickname}`,
            ),
          ),
        ),
      ),

      El("div", {}),

      El(
        "div",
        {},
        El("h3", {}, "Lobby Chat"),
        El(
          "div",
          { class: "chat-messages" },
          ...chatMessages
            .slice(-20)
            .map((msg) =>
              El(
                "div",
                { key: msg.id, class: "chat-message" },
                El("strong", { class: "chat-author" }, `${msg.nickname}`),
                El("span", { class: "chat-text" }, msg.message),
              ),
            ),
        ),
        El(
          "form",
          { onsubmit: handleChatSubmit },
          El("input", {
            type: "text",
            name: "message",
            class: "chat-input",
            placeholder: "Type a message...",
            maxlength: "100",
            required: true,
          }),
          El("button", { type: "submit" }, "Send"),
        ),
        El(
          "button",
          {
            onclick: () => {
              sendSwitchToGameMap();
            },
          },
          "start game",
        ),
      ),
    ),
  );
}
