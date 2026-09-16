export const SWATCHES = [
  { name: "brass", value: "#c98a3f" },
  { name: "click red", value: "#b5423a" },
  { name: "steel", value: "#4d7ea8" },
  { name: "moss", value: "#5c8a5c" },
  { name: "plum", value: "#8a5a8a" },
  { name: "slate", value: "#6b7280" },
] as const;

export function randomSwatch(): string {
  return SWATCHES[Math.floor(Math.random() * SWATCHES.length)].value;
}
