import {
  El,
  Dom,
  events,
  store,
  getEl,
  useState,
  bodyDOM,
  router,
} from "./mini-framework/index.js";
import {
  getPlayerClass,
  getPlayerPosition,
  playerDirection,
} from "./src/views/utils.js";

export const DEFAULT_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const classes = {
  0: "empty",
  1: "wall",
  2: "block",
};

const player = useState("player", {
  id: "a",
  number: 1,
  x: 1,
  y: 1,
  direction: "down",
  isdead: false,
  haslostlife: false,
  isvisible: true,
  ismooving: false,
  speed: 400,
});

const walkStartX = {
  down: 0,
  up: -300,
  left: -156,
  right: -156,
};

export function GameView() {
  const [p] = useState("player");
  const dyingAnim = 1.5;
  const lostLifeAnim = 1.5;

  return El(
    "div",
    {
      id: "app",
      tabindex: "0",
      autofocus: true,
      onkeydown: (e) => {
        const [player, setPlayer] = useState("player");
        if (
          !player.isvisible ||
          player.isdead ||
          player.ismooving ||
          player.haslostlife
        )
          return;

        const key = e.key;
        const validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

        if (!validKeys.includes(key)) return;

        const newDirection = key.toLocaleLowerCase().slice(5);
        if (key === "ArrowUp")
          setPlayer({
            ...player,
            y: player.y - 1,
            ismooving: true,
            direction: newDirection,
          });
        else if (key === "ArrowDown")
          setPlayer({
            ...player,
            y: player.y + 1,
            ismooving: true,
            direction: newDirection,
          });
        else if (key === "ArrowLeft")
          setPlayer({
            ...player,
            x: player.x - 1,
            ismooving: true,
            direction: newDirection,
          });
        else if (key === "ArrowRight")
          setPlayer({
            ...player,
            x: player.x + 1,
            ismooving: true,
            direction: newDirection,
          });
      },
    },
    El("div", {}, El("h1", { class: "game-title" }, "BOMBERMAN")),
    El("div", { id: "ui" }),
    El(
      "div",
      { id: "map" },
      El(
        "div",
        { class: "grid" },
        DEFAULT_GRID.flat().map((cell, i) =>
          El("div", { key: i, class: `cell ${classes[cell]}` }),
        ),
      ),
      El(
        "div",
        { id: "players" },
        p.isvisible &&
          El("div", {
            key: p.id,
            class: getPlayerClass(p),
            style: `
                    --sx: ${walkStartX[p.direction]}px;
                    --sy: ${getPlayerPosition(p)};
                    --px: ${p.x * 48}px;
                    --py: ${p.y * 48}px;
                    --flip: ${p.direction === "right" ? -1 : 1};
                    --speed: ${p.speed}ms;
                    --diying: ${dyingAnim}s;
                    --lostlife: ${lostLifeAnim}s`,
            onanimationend: () => {
              const [currentP, setP] = useState("player");
              setP({ ...currentP, ismooving: false });
            },
          }),
      ),
      El("div", { id: "bombs" }),
      El("div", { id: "powerups" }),
      El("div", { id: "explosions" }),
    ),
  );
}

router.register("#", () => GameView());
router.init();
