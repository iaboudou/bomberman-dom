import { store } from "../../../mini-framework/index.js";

export function moovePlayer(data) {
    const players = store.get("players") || [];

    store.set({
        players: players.map((p) =>
            p.id === data.id
                ? {
                    ...p,
                    x: data.x,
                    y: data.y,
                    direction: data.direction.toLowerCase().slice(5),
                    life : data.remaininglife,
                    haslostlife : p.life === data.remaininglife ? false: true,
                    ismooving: p.life === data.remaininglife ? true: false,
                    speed: data.duration,
                }
                : p,
        ),
    });

    if (data.takenPowerup) {
        const powerups = store.get("powerups")
        store.set({ powerups: powerups.filter(pu => pu.id !== data.takenPowerup.id) });
    }
}