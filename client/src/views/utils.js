export const playerPosition = {
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

export const getPlayerClass = (player) => {
    const base = `player`;

    if (player.isdead) return `${base} dying`;
    if (player.haslostlife) return `${base} lostlife`;
    if (player.ismooving) return `${base} walking ${player.direction}`;

    return base;
};

export const getPlayerPosition = (player, iswinner = true) => {
    if (player.isdead || !iswinner) return `-${playerPosition[player.number] + 50}px`;
    return `-${playerPosition[player.number]}px`;
};