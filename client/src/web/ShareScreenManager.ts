import Peer from "peerjs";
import store from "../stores";
import {
  setMyStream,
  addVideoStream,
  removeVideoStream,
} from "../stores/ComputerStore";
import phaserGame from "../PhaserGame";
import Game from "../scenes/Game";

export default class ShareScreenManager {
  private myPeer: Peer;
  myStream?: MediaStream;

  constructor(private userId: string) {
    const sanatizedId = this.makeId(userId);
    this.myPeer = new Peer(sanatizedId);
    this.myPeer.on("error", (err) => {
      console.log("ShareScreenWebRTC err.type", err);
      console.error("ShareScreenWebRTC", err);
    });

    this.myPeer.on("call", (call) => {
      call.answer();

      call.on("stream", (userVideoStream) => {
        store.dispatch(
          addVideoStream({ id: call.peer, call, stream: userVideoStream })
        );
      });
    });
  }

  onOpen() {
    if (this.myPeer.disconnected) {
      this.myPeer.reconnect();
    }
  }

  onClose() {
    this.stopScreenShare(false);
    this.myPeer.disconnect();
  }

  private makeId(id: string) {
    return `${id.replace(/[^0-9a-z]/gi, "G")}-ss`;
  }

  startScreenShare() {
    navigator.mediaDevices
      ?.getDisplayMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        const track = stream.getVideoTracks()[0];
        if (track) {
          track.onended = () => {
            this.stopScreenShare();
          };
        }

        this.myStream = stream;
        store.dispatch(setMyStream(stream));

        const game = phaserGame.scene.keys.game as Game;
        const computerItem = game.computerMap.get(
          store.getState().computer.computerId!
        );
        if (computerItem) {
          for (const userId of computerItem.currentUsers) {
            this.onUserJoined(userId);
          }
        }
      });
  }

  stopScreenShare(shouldDispatch = true) {
    this.myStream?.getTracks().forEach((track) => track.stop());
    this.myStream = undefined;
    if (shouldDispatch) {
      store.dispatch(setMyStream(null));

      const game = phaserGame.scene.keys.game as Game;
      game.network.onStopScreenShare(store.getState().computer.computerId!);
    }
  }

  onUserJoined(userId: string) {
    if (!this.myStream || userId === this.userId) return;

    const sanatizedId = this.makeId(userId);
    this.myPeer.call(sanatizedId, this.myStream);
  }

  onUserLeft(userId: string) {
    if (userId === this.userId) return;

    const sanatizedId = this.makeId(userId);
    store.dispatch(removeVideoStream(sanatizedId));
  }
}
