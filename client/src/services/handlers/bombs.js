import { store } from "../../../mini-framework/index.js";

export function addBomb(data) {
    const bombs = store.get("bombs") || [];
    store.set({ bombs: [...bombs, data.bomb] });
}

export function explodeBomb(data) {
    const bombs = store.get("bombs") || [];

    store.set({ bombs: bombs.filter((b) => b.id !== data.bombId) });

    if (data.removedBlocks.length > 0) {
        const currentMap = store.get("map");
        data.removedBlocks.forEach(({ x, y }) => {
            currentMap.grid[y][x] = currentMap.tiles.empty;
        });
        store.set({ map: { ...currentMap } });
    }

    if (data.spawnedPowerups.length > 0) {
        const powerups = store.get("powerups") || [];
        store.set({ powerups: [...powerups, ...data.spawnedPowerups] });
    }

    if (data.explosionCells.length > 0) {
        const explosions = store.get("explosions") || [];
        store.set({ explosions: [...explosions, ...data.explosionCells] });
    }

    const players = store.get("players") || [];

    const updatedPlayers = players.map((p) => {
        if (data.deadPlayers.includes(p.id))
            return { ...p, life: 0, isdead: true };
        const hit = data.affectedPlayers.find((ap) => ap.id === p.id);
        if (hit) return { ...p, life: hit.remaininglife, haslostlife: true };
        return p;
    });

    store.set({ players: updatedPlayers });
    store.set({ playersLife: updatedPlayers });
}

export function removeExplosions(data) {
    const explosions = store.get("explosions") || [];
    const idsToRemove = new Set(data.explosionCells.map((e) => e.id));
    store.set({
        explosions: explosions.filter((exp) => !idsToRemove.has(exp.id)),
    });
}
