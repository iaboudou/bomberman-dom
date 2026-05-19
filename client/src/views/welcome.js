import { El, store, useState, router, Dom, events } from "../../mini-framework/index.js";

export function WelcomeView(props) {
    const appDiv = document.getElementById("app");
    if (appDiv) {
        const appDOM = new Dom(appDiv, events);
        appDOM.mount(null);
    }

    // State to manage error messages
    const [error, setError] = useState("error", null, () => {
        if (store.get("screen") === "welcome") {
            router.render();
        }
    });

    // handle form submission
    function handleSubmit(e) {
        e.preventDefault();
        const nickname = e.target.nickname.value.trim();
        if (nickname.length > 0 && nickname.length <= 10) {
            if (props.onJoin) props.onJoin(nickname);
        } else {
            setError("Nickname must be between 1 and 10 characters.");
        }
    }

    return El(
        "div",
        { class: "welcome-screen" },
        El(
            "div",
            { class: "welcome-card" },
            El("h1", { class: "welcome-title" }, "BOMBERMAN"),
            El("p", { class: "welcome-subtitle" }, "Enter your nickname to join the battle!"),
            error ? El("p", { class: "error-message" }, error) : null,
            El(
                "form",
                { class: "welcome-form", onsubmit: handleSubmit },
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



