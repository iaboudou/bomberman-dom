import { useState, store } from "../../../mini-framework/index.js";

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
  const [roomMates, setRoomMates] = useState("roomMates", []);
  setRoomMates(roomMates.filter((p) => p.nickname !== data.left));

  const [players] = useState("players", []);

  const updatedPlayers = players.map((p) =>
    p.nickname === data.left
      ? { ...p, isdead: true, disconnected: true, life: 0, haslostlife: true }
      : p
  );

  store.set({
    players: updatedPlayers,
    playersLife: updatedPlayers,
  });
}

export function showError(data) {
  const [, setError] = useState("error", null);
  setError(data.message);
}
