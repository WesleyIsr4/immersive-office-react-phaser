import { Schema, ArraySchema, SetSchema, MapSchema } from "@colyseus/schema";

export enum ItemType {
  CHAIR,
  COMPUTER,
  WHITEBOARD,
  VENDINGMACHINE,
}

export enum Message {
  UPDATE_PLAYER,
  UPDATE_PLAYER_NAME,
  READY_TO_CONNECT,
  DISCONNECT_STREAM,
  CONNECT_TO_COMPUTER,
  DISCONNECT_FROM_COMPUTER,
  STOP_SCREEN_SHARE,
  CONNECT_TO_WHITEBOARD,
  DISCONNECT_FROM_WHITEBOARD,
  VIDEO_CONNECTED,
  ADD_CHAT_MESSAGE,
  SEND_ROOM_DATA,
}

export enum RoomType {
  LOBBY = "lobby",
  PUBLIC = "office",
  CUSTOM = "custom",
}

export interface IRoomData {
  name: string;
  description: string;
  password: string | null;
  autoDispose: boolean;
}

export interface IComputer extends Schema {
  connectedUser: SetSchema<string>;
}

export interface IPlayer extends Schema {
  name: string;
  x: number;
  y: number;
  anim: string;
  readyToConnect: boolean;
  videoConnected: boolean;
}

export interface IWhiteboard extends Schema {
  roomId: string;
  connectedUser: SetSchema<string>;
}

export interface IChatMessage extends Schema {
  author: string;
  createdAt: number;
  content: string;
}

export interface IOfficeState extends Schema {
  players: MapSchema<IPlayer>;
  computers: MapSchema<IComputer>;
  whiteboards: MapSchema<IWhiteboard>;
  chatMessages: ArraySchema<IChatMessage>;
}
