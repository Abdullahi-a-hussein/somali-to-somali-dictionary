export function customSplit(word, text) {
  if (!text) return [];
  text = text.replace(/\s1\.\s/g, " ");
  const pattern = new RegExp(`(?: [2-9]\\d?\\. |${word}: )`, "g");
  return text
    .split(pattern)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}
