import { El } from "../../mini-framework/index.js";

export function renderGrid(map) {
  return El(
    "div",
    { class: "grid" },
    ...map.grid.flat().map((cell, i) =>
      El("div", {
        key: i,
        class: `cell ${map.classes[cell]}`,
      }),
    ),
  );
}
