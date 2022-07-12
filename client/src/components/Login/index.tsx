import { Fragment, useState } from "react";
import styled from "styled-components";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

import Adam from "../../persons/Adam_login.png";
import Ash from "../../persons/Ash_login.png";
import Lucy from "../../persons/Lucy_login.png";
import Nancy from "../../persons/Nancy_login.png";

import { useAppDispatch, useAppSelector } from "../../hooks/appDispatch";
import { setLoggedIn } from "../../stores/UserStore";

import { getAvatarString } from "../../utils/getAvatar";
import { getColorByString } from "../../utils/getColorByString";

import phaserGame from "../../PhaserGame";
import Game from "../../scenes/Game";

import * as S from "./styles";

SwiperCore.use([Navigation]);

const avatars = [
  { name: "adam", img: Adam },
  { name: "ash", img: Ash },
  { name: "lucy", img: Lucy },
  { name: "nancy", img: Nancy },
];

for (let i = avatars.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [avatars[i], avatars[j]] = [avatars[j], avatars[i]];
}

function Login() {
  const [name, setName] = useState<string>("");
  const [avatarIndex, setAvatarIndex] = useState<number>(0);

  const dispatch = useAppDispatch();
  const videoConnected = useAppSelector((state) => state.user.videoConnected);
  const roomJoined = useAppSelector((state) => state.room.roomJoined);
  const roomName = useAppSelector((state) => state.room.roomName);
  const roomDescription = useAppSelector((state) => state.room.roomDescription);
  const game = phaserGame.scene.keys.game as Game;

  console.log(roomJoined);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    game.registerKeys();
    game.myPlayer.setPlayerName(name);
    game.myPlayer.setPlayerTexture(avatars[avatarIndex].name);
    game.network.readyToConnect();
    dispatch(setLoggedIn(true));
  };

  return (
    <Fragment>
      <S.Wrapper onSubmit={handleSubmit}>
        <S.Title>Joining</S.Title>
        <S.RoomName>
          <Avatar style={{ background: getColorByString(roomName) }}>
            {getAvatarString(roomName)}
          </Avatar>
          <h3>{roomName}</h3>
        </S.RoomName>
        <S.RoomDescription>
          <ArrowRightIcon /> {roomDescription}
        </S.RoomDescription>
        <S.Content>
          <S.Left>
            <S.SubTitle>Select an avatar</S.SubTitle>
            <Swiper
              navigation
              modules={[Navigation]}
              spaceBetween={10}
              slidesPerView={1}
              onSlideChange={(swiper) => {
                setAvatarIndex(swiper.activeIndex);
              }}
            >
              {avatars.map((avatar) => (
                <SwiperSlide key={avatar.name}>
                  <img src={avatar.img} alt={avatar.name} />
                </SwiperSlide>
              ))}
            </Swiper>
          </S.Left>
          <S.Right>
            <TextField
              autoFocus
              fullWidth
              label="Name"
              variant="outlined"
              color="secondary"
              error={!name}
              helperText={!name && "Name is required"}
              onInput={(e) => {
                setName((e.target as HTMLInputElement).value);
              }}
            />
            {!videoConnected && (
              <S.Warning>
                <Alert variant="outlined" severity="warning">
                  <AlertTitle>Warning</AlertTitle>
                  No webcam/mic connected -{" "}
                  <strong>connect one for best experience!</strong>
                </Alert>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    game.network.webRTC?.getUserMedia();
                  }}
                >
                  Connect Webcam
                </Button>
              </S.Warning>
            )}

            {videoConnected && (
              <S.Warning>
                <Alert variant="outlined">Webcam connected!</Alert>
              </S.Warning>
            )}
          </S.Right>
        </S.Content>
        <S.Bottom>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            type="submit"
          >
            Join
          </Button>
        </S.Bottom>
      </S.Wrapper>
    </Fragment>
  );
}

export default Login;
