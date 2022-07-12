export enum RoomType {
  LOBBY = "lobby",
  PUBLIC = "office",
  CUSTOM = "custom",
}

export enum BackgroundMode {
  DAY,
  NIGHT,
}

export interface IChatMessage extends Schema {
  author: string;
  createdAt: number;
  content: string;
}
