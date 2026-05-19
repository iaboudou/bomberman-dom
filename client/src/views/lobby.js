import { El, store, useState, router } from "../../mini-framework/index.js";
import { getMap } from "../services/ws.js";

// this is the lobby page where players wait for the game to start
export function LobbyView(props) {
  const appDiv = document.getElementById("app");
  if (appDiv) {
    const appDOM = new Dom(appDiv, events);
    appDOM.mount(null);
  }

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

  // re-render lobby view (chat, player list, timer))
  const Cb = () => {
    if (store.get("screen") === "lobby") {
      router.render();
    }
  };

  // nbr of players in the lobby
  const [playerCount] = useState("playerCount", 1, Cb);

  // waiting time before game starts (after 2 players joined)
  const [waitingTime] = useState("waitingTime", 0, Cb);

  // countdown before game starts (after waiting time is over)
  const [countdown] = useState("countdown", 0, Cb);

  // list of players in the lobby
  const [players] = useState("players", {}, Cb);

  // chat messages in the lobby
  const [chatMessages] = useState("chatMessages", [], Cb);

  const playersList = Object.values(players || {});

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
          ? El("div", {}, `Waiting time: ${waitingTime}s`)
          : null,
        countdown > 0 ? El("div", {}, `Game starts in: ${countdown}s`) : null,
        playerCount < 2
          ? El("p", {}, "Waiting for more players to join...")
          : null,
        El(
          "div",
          {},
          El("h3", {}, "Connected Players"),
          ...playersList.map((player, index) =>
            El(
              "div",
              { key: player.id, class: "player-item" },
              El("span", {}),
              ` ${player.nickname}`,
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
          {},
          ...chatMessages
            .slice(-20)
            .map((msg, index) =>
              El("div", {}, El("strong", {}, `${msg.nickname}: `), msg.message),
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
