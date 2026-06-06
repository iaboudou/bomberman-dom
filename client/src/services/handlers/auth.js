import { useState } from "../../../mini-framework/index.js";

export function initLobby(data) {
    useState("nickname", data.nickname);
    useState("roomMates", data.roomMates);
    useState("chatMessages", []);
    useState("lobbyTimer", { type: null, value: 0 });
    const [, setScreen] = useState("screen");
    setScreen("lobby");
}

export function addPlayer(data) {
    const [players, setPlayers] = useState("roomMates");
    setPlayers([...players, { nickname: data.nickname }]);
}

export function removePlayer(data) {
    const [players, setPlayers] = useState("roomMates");
    setPlayers(players.filter((p) => p.nickname !== data.left));
}

export function showError(data) {
    const [, setError] = useState("error", null);
    setError(data.message);
}