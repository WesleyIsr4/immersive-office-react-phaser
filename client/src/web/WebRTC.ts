import Peer from "peerjs";
import Network from "../services/Network";
import store from "../stores";
import { setVideoConnected } from "../stores/UserStore";

export default class WebRTC {
  private myPeer: Peer;
  // @ts-ignore
  peers = new Map<string, Peer.MediaConnection>();
  onCalledPeers = new Map<string, HTMLVideoElement>();
  private videoGrid = document.querySelector(".video-grid");
  private buttonGrid = document.querySelector(".button-grid");
  private myVideo = document.createElement("video");
  private myStream?: MediaStream;
  private network: Network;

  constructor(userId: string, network: Network) {
    const sanitizedId = this.replaceInvalidId(userId);
    this.myPeer = new Peer(sanitizedId);
    this.network = network;
    console.log("userId:", userId);
    console.log("sanitizedId:", sanitizedId);
    this.myPeer.on("error", (err) => {
      console.log(err);
      console.error(err);
    });

    this.myVideo.muted = true;

    this.initialize();
  }

  private replaceInvalidId(userId: string) {
    return userId.replace(/[^0-9a-z]/gi, "G");
  }

  initialize() {
    this.myPeer.on("call", (call) => {
      if (!this.onCalledPeers.has(call.peer)) {
        call.answer(this.myStream);
        const video = document.createElement("video");
        // @ts-ignore
        this.onCalledPeers.set(call.peer, { call, video });

        call.on("stream", (userVideoStream) => {
          this.addVideoStream(video, userVideoStream);
        });
      }
    });
  }

  checkPreviousPermission() {
    const permissionName = "microphone" as PermissionName;
    navigator.permissions?.query({ name: permissionName }).then((result) => {
      if (result.state === "granted") this.getUserMedia(false);
    });
  }

  getUserMedia(alertOnError = true) {
    navigator.mediaDevices
      ?.getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.myStream = stream;
        this.addVideoStream(this.myVideo, this.myStream);
        this.setUpButtons();
        store.dispatch(setVideoConnected(true));
        this.network.videoConnected();
      })
      .catch((error) => {
        if (alertOnError)
          window.alert(
            "No webcam or microphone found, or permission is blocked"
          );
      });
  }

  connectToNewUser(userId: string) {
    if (this.myStream) {
      const sanitizedId = this.replaceInvalidId(userId);
      if (!this.peers.has(sanitizedId)) {
        console.log("calling", sanitizedId);
        const call = this.myPeer.call(sanitizedId, this.myStream);
        const video = document.createElement("video");
        this.peers.set(sanitizedId, { call, video });

        call.on("stream", (userVideoStream) => {
          this.addVideoStream(video, userVideoStream);
        });
      }
    }
  }

  addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    if (this.videoGrid) this.videoGrid.append(video);
  }

  deleteVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId);
    if (this.peers.has(sanitizedId)) {
      const peer = this.peers.get(sanitizedId);
      peer?.call.close();
      peer?.video.remove();
      this.peers.delete(sanitizedId);
    }
  }

  deleteOnCalledVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId);
    if (this.onCalledPeers.has(sanitizedId)) {
      const onCalledPeer = this.onCalledPeers.get(sanitizedId);
      // @ts-ignore
      onCalledPeer?.call.close();
      // @ts-ignore
      onCalledPeer?.video.remove();
      this.onCalledPeers.delete(sanitizedId);
    }
  }

  setUpButtons() {
    const audioButton = document.createElement("button");
    audioButton.innerText = "Mute";
    audioButton.addEventListener("click", () => {
      if (this.myStream) {
        const audioTrack = this.myStream.getAudioTracks()[0];
        if (audioTrack.enabled) {
          audioTrack.enabled = false;
          audioButton.innerText = "Unmute";
        } else {
          audioTrack.enabled = true;
          audioButton.innerText = "Mute";
        }
      }
    });
    const videoButton = document.createElement("button");
    videoButton.innerText = "Video off";
    videoButton.addEventListener("click", () => {
      if (this.myStream) {
        const audioTrack = this.myStream.getVideoTracks()[0];
        if (audioTrack.enabled) {
          audioTrack.enabled = false;
          videoButton.innerText = "Video on";
        } else {
          audioTrack.enabled = true;
          videoButton.innerText = "Video off";
        }
      }
    });
    this.buttonGrid?.append(audioButton);
    this.buttonGrid?.append(videoButton);
  }
}
