import { ArraySchema, SetSchema, MapSchema } from "@colyseus/schema";
import { Room } from "colyseus";

export interface IPlayer extends Room {
  name: string;
  x: number;
  y: number;
  anim: string;
  readyToConnect: boolean;
  videoConnected: boolean;
}

export interface IComputer extends Room {
  connectedUser: SetSchema<string>;
}

export interface IWhiteboard extends Room {
  roomId: string;
  connectedUser: SetSchema<string>;
}

export interface IChatMessage extends Room {
  author: string;
  createdAt: number;
  content: string;
}

export interface IOfficeState extends Room {
  players: MapSchema<IPlayer>;
  computers: MapSchema<IComputer>;
  whiteboards: MapSchema<IWhiteboard>;
  chatMessages: ArraySchema<IChatMessage>;
}
