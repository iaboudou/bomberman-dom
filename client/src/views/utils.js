const colorCache = new Map();

const playerPosition = {
  1: 568,
  2: 668,
  3: 768,
  4: 868,
};

export const playerDirection = {
  down: "0px",
  up: "-300px",
  left: "-156px",
  right: "-156px",
};

export const playerColor = (nickname) => {
    if (colorCache.has(nickname)) return colorCache.get(nickname);
    let hash = 0;
    for (let i = 0; i < nickname.length; i++) {
        hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
    colorCache.set(nickname, color);
    return color;
};

export const getPlayerClass = (player) => {
    const base = `player player${player.number}`;

    if (player.isdead) return `${base} dying`;
    if (player.haslostlife) return `${base} lostlife`;
    if (player.ismooving) return `${base} walking ${player.direction}`;

    return base;
};

export const getPlayerPosition = (player) => {
    if (player.isdead) return `-${playerPosition[player.number] + 50}px`;
    return `-${playerPosition[player.number]}px`;
};