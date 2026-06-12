export const playerPosition = {
  1: 568,
  2: 668,
  3: 768,
  4: 868,
};

export const playerDirection = {
  down0: "0px",
  down1: "-50px",
  down2: "-110px",
  up0: "-300px",
  up1: "-350px",
  up2: "-410px",
  left0: "-156px",
  left1: "-206px",
  left2: "-256px",
  right0: "-156px",
  right1: "-206px",
  right2: "-256px",
};

export const getPlayerClass = (player) => {
  let base = `player`;

  if (player.isdead) return `${base} dying`;
  if (player.haslostlife) base += " lostlife";
  if (player.ismooving) base += ` walking ${player.direction}`;

  return base;
};

export const getPlayerPosition = (player, iswinner = true) => {
  if (player.isdead || !iswinner)
    return `-${playerPosition[player.number] + 50}px`;
  return `-${playerPosition[player.number]}px`;
};
