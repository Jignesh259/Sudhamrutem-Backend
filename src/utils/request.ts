export const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;
