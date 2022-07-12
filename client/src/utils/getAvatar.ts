export function getAvatarString(name: string) {
  const part = name.split(" ");
  return part.length < 2 ? part[0][0] : part[0][0] + part[1][0];
}
