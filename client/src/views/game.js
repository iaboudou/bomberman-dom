import { El, Dom, events, store, getEl } from "../../mini-framework/index.js";
import { GameMap } from "../entities/Map.js";
import { map, sendMove, sendBomb, ws } from "../services/ws.js";

const colorCache = new Map();

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

let uiDom, gridDom, playersDom, bombsDom, powerupsDom, explosionsDom;
let domsInitialized = false;

const subs = [];

export function initDoms() {
  if (domsInitialized) return;

  const uiEl         = getEl("#ui");
  const gridEl       = getEl(".grid");
  const playersEl    = getEl("#players");
  const bombsEl      = getEl("#bombs");
  const powerupsEl   = getEl("#powerups");
  const explosionsEl = getEl("#explosions");

  if (!uiEl || !gridEl || !playersEl || !bombsEl || !powerupsEl || !explosionsEl) return;

  domsInitialized = true;

  uiDom         = new Dom(uiEl,         events);
  gridDom       = new Dom(gridEl,       events);
  playersDom    = new Dom(playersEl,    events);
  bombsDom      = new Dom(bombsEl,      events);
  powerupsDom   = new Dom(powerupsEl,   events);
  explosionsDom = new Dom(explosionsEl, events);

  const onPlayers = () => playersDom.scheduleMount(renderPlayers());
  const onPlayersLife = () => uiDom.scheduleMount(renderUI()); 
  const onSpectator  = () => uiDom.scheduleMount(renderUI());
  const onBombs      = () => bombsDom.scheduleMount(renderBombs());
  const onPowerups   = () => powerupsDom.scheduleMount(renderPowerups());
  const onExplosions = () => explosionsDom.scheduleMount(renderExplosions());
  const onMap        = () => gridDom.scheduleMount(renderGrid());

  subs.push(["players",    onPlayers]);
  subs.push(["playersLife", onPlayersLife]);
  subs.push(["spectator",  onSpectator]);
  subs.push(["bombs",      onBombs]);
  subs.push(["powerups",   onPowerups]);
  subs.push(["explosions", onExplosions]);
  subs.push(["map",        onMap]);

  subs.forEach(([key, cb]) => store.subscribe(key, cb));

  uiDom.scheduleMount(renderUI());
  gridDom.scheduleMount(renderGrid());
  playersDom.scheduleMount(renderPlayers());
  bombsDom.scheduleMount(renderBombs());
  powerupsDom.scheduleMount(renderPowerups());
  explosionsDom.scheduleMount(renderExplosions());
}

export function resetDoms() {
  if (uiDom)         uiDom.container.innerHTML = "";
  if (gridDom)       gridDom.container.innerHTML = "";
  if (playersDom)    playersDom.container.innerHTML = "";
  if (bombsDom)      bombsDom.container.innerHTML = "";
  if (powerupsDom)   powerupsDom.container.innerHTML = "";
  if (explosionsDom) explosionsDom.container.innerHTML = "";

  subs.forEach(([key, cb]) => store.unsubscribe(key, cb));
  subs.length = 0;

  uiDom = gridDom = playersDom = bombsDom = powerupsDom = explosionsDom = null;
  domsInitialized = false;
}

function renderUI() {
  const players     = store.get("players")   || [];
  const isSpectator = store.get("spectator") || false;

  return El("fragment", {},
    El("div", { class: "ui-players" },
      players.map((p) =>
        El("div", { key: p.id, class: "ui-player", style: `--player-color: ${playerColor(p.nickname)}` },
          El("span", { class: "ui-avatar" }, p.nickname[0].toUpperCase()),
          El("div", { class: "ui-lives" },
            Array.from({ length: p.maxlife }, (_, i) =>
              El("span", { class: `ui-heart ${i < p.remaininglife ? "alive" : "lost"}` }, "♥")
            )
          )
        )
      )
    ),
  );
}

function renderGrid() {
  const Map = store.get("map");

  if (!Map) return El("fragment", {});


  return El("fragment",{},
    Map.grid
      .flat()
      .map((cell, i) =>
        El("div", { key: i, class: `cell ${Map.classes[cell]}` }),
    ),
  );
}

function renderPlayers() {
  const players = store.get("players") || [];

  return El("fragment", {},
    players.map((p) =>
      El("div", {
        key: p.id,
        class: "player",
        style: `--player-color: ${playerColor(p.nickname)}; --px: ${p.x * 48}px; --py: ${p.y * 48}px`,
      },
        El("span", { class: "player-label" }, p.nickname[0].toUpperCase()),
      )
    )
  );
}

function renderBombs() {
  const bombs = store.get("bombs") || [];

  return El("fragment", {},
    bombs.map((b) =>
      El("div", {
        key: b.id,
        class: "bomb",
        style: `--px: ${b.x * 48}px; --py: ${b.y * 48}px`,
      })
    )
  );
}

function renderPowerups() {
  const powerups = store.get("powerups") || [];

  return El("fragment", {},
    powerups.map((pu) =>
      El("div", {
        key: pu.id,
        class: `powerup ${pu.type}`,
        style: `--px: ${pu.x * 48}px; --py: ${pu.y * 48}px`,
      })
    )
  );
}

function renderExplosions() {
  const explosions = store.get("explosions") || [];

  return El("fragment", {},
    explosions.map((e) =>
      El("div", {
        key: e.id,
        class: `explosion ${e.position}`,
        style: `--px: ${e.x * 48}px; --py: ${e.y * 48}px`,
      })
    )
  );
}

export function GameView() {
  const isSpectator = store.get("spectator") || false;

  const handleMove = (e) => {
    if (isSpectator) return;
    e.preventDefault();

    if (e.key === " ") {
      sendBomb();
      return;
    }

    const validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (validKeys.includes(e.key)) sendMove(e.key);
  };

  return El("div", {
    id: "app",
    tabindex: "0",
    autofocus: true,
    onKeydown: (e) => handleMove(e),
  },
    El("div", { id: "ui" }),
    El("div", { id: "map" },
      El("div", { class: "grid" }),
      El("div", { id: "players" }),
      El("div", { id: "bombs" }),
      El("div", { id: "powerups" }),
      El("div", { id: "explosions" }),
    ),
  );
}