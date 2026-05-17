import { El } from "../../mini-framework/index.js";
import { CELL } from "../core/Map.js";

export function renderGrid(grid) {
  return El(
    "div",
    { class: "grid" },
    ...grid.flat().map((cell, i) =>
      El("div", {
        key: i,
        class: cellClass(cell),
      }),
    ),
  );
}

function cellClass(cell) {
  switch (cell) {
    case CELL.WALL:
      return "cell wall";
    case CELL.BLOCK:
      return "cell block";
    default:
      return "cell empty";
  }
}
