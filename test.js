const odd = [
  [1, 3],
  [5, 7],
];

const clone = odd;

const even = clone.map((a) => a.map((n) => n + 1));

console.log("odd: ", odd);
console.log("even: ", even);
