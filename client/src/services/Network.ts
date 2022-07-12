import { Client, Room } from "colyseus.js";
import { IComputer, IOfficeState, IPlayer, IWhiteboard } from "./types";
import { Message } from "./types";
import { IRoomData, RoomType } from "./types";
import { ItemType } from "./types";
import WebRTC from "../web/WebRTC";
import { phaserEvents, Event } from "../events/EventCenter";
import store from "../stores";
import {
  setSessionId,
  setPlayerNameMap,
  removePlayerNameMap,
} from "../stores/UserStore";
import {
  setLobbyJoined,
  setJoinedRoomData,
  setAvailableRooms,
  addAvailableRooms,
  removeAvailableRooms,
} from "../stores/RoomStore";
import {
  pushChatMessage,
  pushPlayerJoinedMessage,
  pushPlayerLeftMessage,
} from "../stores/ChatStore";
import { setWhiteboardUrls } from "../stores/WhiteboardStore";

export default class Network {
  private client: Client;
  private room?: Room<IOfficeState>;
  private lobby!: Room;
  webRTC?: WebRTC;

  mySessionId!: string;

  constructor() {
    const protocol = window.location.protocol.replace("http", "ws");
    const endpoint = `${protocol}//${window.location.hostname}:3001`;
    this.client = new Client(endpoint);
    this.joinLobbyRoom().then(() => {
      store.dispatch(setLobbyJoined(true));
    });

    phaserEvents.on(Event.MY_PLAYER_NAME_CHANGE, this.updatePlayerName, this);
    phaserEvents.on(Event.MY_PLAYER_TEXTURE_CHANGE, this.updatePlayer, this);
    phaserEvents.on(
      Event.PLAYER_DISCONNECTED,
      this.playerStreamDisconnect,
      this
    );
  }

  /**
   * method to join Colyseus' built-in LobbyRoom, which automatically notifies
   * connected clients whenever rooms with "realtime listing" have updates
   */
  async joinLobbyRoom() {
    this.lobby = await this.client.joinOrCreate(RoomType.LOBBY);

    this.lobby.onMessage("rooms", (rooms) => {
      store.dispatch(setAvailableRooms(rooms));
    });

    this.lobby.onMessage("+", ([roomId, room]) => {
      store.dispatch(addAvailableRooms({ roomId, room }));
    });

    this.lobby.onMessage("-", (roomId) => {
      store.dispatch(removeAvailableRooms(roomId));
    });
  }

  async joinOrCreatePublic() {
    this.room = await this.client.joinOrCreate(RoomType.PUBLIC);
    this.initialize();
  }

  async joinCustomById(roomId: string, password: string | null) {
    this.room = await this.client.joinById(roomId, { password });
    this.initialize();
  }

  async createCustom(roomData: IRoomData) {
    const { name, description, password, autoDispose } = roomData;
    this.room = await this.client.create(RoomType.CUSTOM, {
      name,
      description,
      password,
      autoDispose,
    });
    this.initialize();
  }

  initialize() {
    if (!this.room) return;

    this.lobby.leave();
    this.mySessionId = this.room.sessionId;
    store.dispatch(setSessionId(this.room.sessionId));
    this.webRTC = new WebRTC(this.mySessionId, this);

    this.room.state.players.onAdd = (player: IPlayer, key: string) => {
      if (key === this.mySessionId) return;

      player.onChange = (changes) => {
        changes.forEach((change) => {
          const { field, value } = change;
          phaserEvents.emit(Event.PLAYER_UPDATED, field, value, key);

          if (field === "name" && value !== "") {
            phaserEvents.emit(Event.PLAYER_JOINED, player, key);
            store.dispatch(setPlayerNameMap({ id: key, name: value }));
            store.dispatch(pushPlayerJoinedMessage(value));
          }
        });
      };
    };

    this.room.state.players.onRemove = (player: IPlayer, key: string) => {
      phaserEvents.emit(Event.PLAYER_LEFT, key);
      this.webRTC?.deleteVideoStream(key);
      this.webRTC?.deleteOnCalledVideoStream(key);
      store.dispatch(pushPlayerLeftMessage(player.name));
      store.dispatch(removePlayerNameMap(key));
    };

    this.room.state.computers.onAdd = (computer: IComputer, key: string) => {
      computer.connectedUser.onAdd = (item, index) => {
        phaserEvents.emit(Event.ITEM_USER_ADDED, item, key, ItemType.COMPUTER);
      };
      computer.connectedUser.onRemove = (item, index) => {
        phaserEvents.emit(
          Event.ITEM_USER_REMOVED,
          item,
          key,
          ItemType.COMPUTER
        );
      };
    };

    this.room.state.whiteboards.onAdd = (
      whiteboard: IWhiteboard,
      key: string
    ) => {
      store.dispatch(
        setWhiteboardUrls({
          whiteboardId: key,
          roomId: whiteboard.roomId,
        })
      );

      whiteboard.connectedUser.onAdd = (item, index) => {
        phaserEvents.emit(
          Event.ITEM_USER_ADDED,
          item,
          key,
          ItemType.WHITEBOARD
        );
      };
      whiteboard.connectedUser.onRemove = (item, index) => {
        phaserEvents.emit(
          Event.ITEM_USER_REMOVED,
          item,
          key,
          ItemType.WHITEBOARD
        );
      };
    };

    this.room.state.chatMessages.onAdd = (item, index) => {
      store.dispatch(pushChatMessage(item));
    };

    this.room.onMessage(Message.SEND_ROOM_DATA, (content) => {
      store.dispatch(setJoinedRoomData(content));
    });

    this.room.onMessage(Message.ADD_CHAT_MESSAGE, ({ clientId, content }) => {
      phaserEvents.emit(Event.UPDATE_DIALOG_BUBBLE, clientId, content);
    });

    this.room.onMessage(Message.DISCONNECT_STREAM, (clientId: string) => {
      this.webRTC?.deleteOnCalledVideoStream(clientId);
    });

    this.room.onMessage(Message.STOP_SCREEN_SHARE, (clientId: string) => {
      const computerState = store.getState().computer;
      computerState.shareScreenManager?.onUserLeft(clientId);
    });
  }

  onChatMessageAdded(
    callback: (playerId: string, content: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.UPDATE_DIALOG_BUBBLE, callback, context);
  }

  onItemUserAdded(
    callback: (playerId: string, key: string, itemType: ItemType) => void,
    context?: any
  ) {
    phaserEvents.on(Event.ITEM_USER_ADDED, callback, context);
  }

  onItemUserRemoved(
    callback: (playerId: string, key: string, itemType: ItemType) => void,
    context?: any
  ) {
    phaserEvents.on(Event.ITEM_USER_REMOVED, callback, context);
  }

  onPlayerJoined(
    callback: (Player: IPlayer, key: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.PLAYER_JOINED, callback, context);
  }

  onPlayerLeft(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_LEFT, callback, context);
  }

  onMyPlayerReady(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.MY_PLAYER_READY, callback, context);
  }

  onMyPlayerVideoConnected(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.MY_PLAYER_VIDEO_CONNECTED, callback, context);
  }

  onPlayerUpdated(
    callback: (field: string, value: number | string, key: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.PLAYER_UPDATED, callback, context);
  }

  updatePlayer(currentX: number, currentY: number, currentAnim: string) {
    this.room?.send(Message.UPDATE_PLAYER, {
      x: currentX,
      y: currentY,
      anim: currentAnim,
    });
  }

  updatePlayerName(currentName: string) {
    this.room?.send(Message.UPDATE_PLAYER_NAME, { name: currentName });
  }

  readyToConnect() {
    this.room?.send(Message.READY_TO_CONNECT);
    phaserEvents.emit(Event.MY_PLAYER_READY);
  }

  videoConnected() {
    this.room?.send(Message.VIDEO_CONNECTED);
    phaserEvents.emit(Event.MY_PLAYER_VIDEO_CONNECTED);
  }

  playerStreamDisconnect(id: string) {
    this.room?.send(Message.DISCONNECT_STREAM, { clientId: id });
    this.webRTC?.deleteVideoStream(id);
  }

  connectToComputer(id: string) {
    this.room?.send(Message.CONNECT_TO_COMPUTER, { computerId: id });
  }

  disconnectFromComputer(id: string) {
    this.room?.send(Message.DISCONNECT_FROM_COMPUTER, { computerId: id });
  }

  connectToWhiteboard(id: string) {
    this.room?.send(Message.CONNECT_TO_WHITEBOARD, { whiteboardId: id });
  }

  disconnectFromWhiteboard(id: string) {
    this.room?.send(Message.DISCONNECT_FROM_WHITEBOARD, { whiteboardId: id });
  }

  onStopScreenShare(id: string) {
    this.room?.send(Message.STOP_SCREEN_SHARE, { computerId: id });
  }

  addChatMessage(content: string) {
    this.room?.send(Message.ADD_CHAT_MESSAGE, { content: content });
  }
}
