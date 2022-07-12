const colorArr = [
  "#7bf1a8",
  "#ff7e50",
  "#9acd32",
  "#daa520",
  "#ff69b4",
  "#c085f6",
  "#1e90ff",
  "#5f9da0",
];

export function getColorByString(string: string) {
  return colorArr[Math.floor(string.charCodeAt(0) % colorArr.length)];
}
