import { Room } from "colyseus";

export enum BackgroundMode {
  DAY,
  NIGHT,
}

export enum ItemType {
  CHAIR,
  COMPUTER,
  WHITEBOARD,
  VENDINGMACHINE,
}

export enum PlayerBehavior {
  IDLE,
  SITTING,
}

export interface IPlayer extends Room {
  name: string;
  x: number;
  y: number;
  anim: string;
  readyToConnect: boolean;
  videoConnected: boolean;
}
