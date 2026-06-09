import { store } from "../../../mini-framework/index.js";

export function moovePlayer(data) {
    const players = store.get("players") || [];

    const updatedPlayers = players.map((p) =>
        p.id === data.id
            ? {
                ...p,
                x: data.x,
                y: data.y,
                direction: data.direction,
                life: data.remaininglife,
                haslostlife: p.life === data.remaininglife ? false : true,
                ismooving: p.life === data.remaininglife ? true : false,
                isdead: data.remaininglife === 0,
                speed: data.duration,
            }
            : p,
    );

    store.set({
        players: updatedPlayers,
        playersLife: updatedPlayers,
    });

    if (data.takenPowerup) {
        const powerups = store.get("powerups") || [];
        store.set({ powerups: powerups.filter((pu) => pu.id !== data.takenPowerup.id) });
    }
}