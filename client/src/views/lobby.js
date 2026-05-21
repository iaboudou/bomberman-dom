import { El, store, useState, router } from "../../mini-framework/index.js";
import { getMap } from "../services/ws.js";

// this is the lobby page where players wait for the game to start
export function LobbyView(props) {
  const appDiv = document.getElementById("app");
  if (appDiv) {
    const appDOM = new Dom(appDiv, events);
    appDOM.mount(null);
  }
  
  // re-render lobby view (chat, player list, timer))
  const Cb = () => {
    if (store.get("screen") === "lobby") {
      router.render();
    }
  };
  
  const [playerCount] = useState("playerCount", 1, Cb); // nbr of players in the lobby
  const [waitingTime] = useState("waitingTime", 0, Cb); // waiting time before game starts (after 2 players joined)
  const [countdown] = useState("countdown", 0, Cb); // countdown before game starts (after waiting time is over)
  const [playersList] = useState("players", [], Cb); // list of players in the lobby
  const [chatMessages] = useState("chatMessages", [], Cb); // chat messages in the lobby
  
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
        El("p", {}, `Players: ${playerCount}/4`),
        waitingTime > 0 && playerCount >= 2
          ? El("div", { class: "status-box" }, `Waiting time: ${waitingTime}s`)
          : null,
        countdown > 0 ? El("div", { class: "status-box" }, `Game starts in: ${countdown}s`) : null,
        playerCount < 2
          ? El("p", {}, "Waiting for more players to join...")
          : null,
        El(
          "div",
          { class: "players-list" },
          El("h3", {}, "Connected Players"),
          ...(playersList || []).map((player) =>
            El(
              "div",
              { class: "player-item" },
              El("span", {}),
              ` ${player}`,
            ),
          ),
        ),
      ),
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
                { class: "chat-message" },
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
              getMap();
            },
          },
          "start game",
        ),
      ),
    ),
  );
}
