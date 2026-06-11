import { El, useState } from "../../mini-framework/index.js";
import { send } from "../services/ws.js";

export function WelcomeView() {
  // State to manage error messages
  const [error, setError] = useState("error", null);

  return El(
    "div",
    { class: "welcome-screen" },
    El("div", {id: "logo"}, "BOMBERMAN"),
    El(
      "div",
      { class: "welcome-card" },
      El("span", { class: "welcome-badge" }, "Multiplayer"),
      El(
        "p",
        { class: "welcome-subtitle" },
        "Enter your nickname to join the battle!"
      ),
      El("div", { class: "welcome-divider" }),
      error ? El("p", { class: "welcome-error" }, error) : null,
      El(
        "form",
        {
          class: "welcome-form",
          onsubmit: (e) => {
            // handle form submission
            e.preventDefault();
            const nickname = e.target.nickname.value.trim();
            if (nickname.length > 0 && nickname.length <= 10) {
              send("JOIN", { nickname });
            } else {
              setError("Nickname must be between 1 and 10 characters.");
            }
          },
        },
        El("input", {
          type: "text",
          name: "nickname",
          class: "welcome-input",
          placeholder: "Enter nickname...",
          maxlength: "10",
          required: true,
          autofocus: true,
        }),
        El("button", { type: "submit", class: "btn welcome-btn" }, "Join Game")
      )
    )
  );
}
