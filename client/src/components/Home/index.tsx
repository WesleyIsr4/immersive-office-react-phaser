import { Alert, Button, IconButton, Snackbar, Tooltip } from "@mui/material";
import { Fragment, useState } from "react";
import { useAppSelector } from "../../hooks/appDispatch";
import phaserGame from "../../PhaserGame";
import Bootstrap from "../../scenes/Bootstrap";
import { ArrowBack, HelpOutline } from "@mui/icons-material";
import * as S from "./styles";
import CreateRoom from "../CreateRoom";
import CustomRoom from "../CustomRoom";

function Home() {
  const [showCustomRoom, setShowCustomRoom] = useState(false);
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined);

  const handleConnect = () => {
    if (lobbyJoined) {
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;
      bootstrap.network
        .joinOrCreatePublic()
        .then(() => bootstrap.launchGame())
        .catch((error) => console.error(error));
    } else {
      setShowSnackbar(true);
    }
  };

  return (
    <Fragment>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => {
          setShowSnackbar(false);
        }}
      >
        <Alert
          severity="error"
          variant="outlined"
          style={{ background: "#fdeded", color: "#7d4747" }}
        >
          Trying to connect to server, please try again!
        </Alert>
      </Snackbar>
      <S.Backdrop>
        <S.Wrapper>
          {showCreateRoomForm ? (
            <S.CustomRoomWrapper>
              <S.Title>Create Custom Room</S.Title>
              <S.BackButtonWrapper>
                <IconButton onClick={() => setShowCreateRoomForm(false)}>
                  <ArrowBack />
                </IconButton>
              </S.BackButtonWrapper>
              <CreateRoom />
            </S.CustomRoomWrapper>
          ) : showCustomRoom ? (
            <S.CustomRoomWrapper>
              <S.Title>
                Custom Rooms
                <Tooltip
                  title="We update the results in realtime, no refresh needed!"
                  placement="top"
                >
                  <IconButton>
                    <HelpOutline className="tip " />
                  </IconButton>
                </Tooltip>
              </S.Title>
              <S.BackButtonWrapper>
                <IconButton onClick={() => setShowCustomRoom(false)}>
                  <ArrowBack />
                </IconButton>
              </S.BackButtonWrapper>
              <CustomRoom />
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowCreateRoomForm(true)}
              >
                Create new room
              </Button>
            </S.CustomRoomWrapper>
          ) : (
            <Fragment>
              <S.Title>Welcome to Office</S.Title>
              <S.Content>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleConnect}
                >
                  Connect to public lobby
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    lobbyJoined
                      ? setShowCustomRoom(true)
                      : setShowSnackbar(true);
                  }}
                >
                  Create or find custom rooms
                </Button>
              </S.Content>
            </Fragment>
          )}
        </S.Wrapper>
        {!lobbyJoined && (
          <S.ProgressBarWrapper>
            <h3>Connecting to server...</h3>
            <S.ProgressBar color="secondary" />
          </S.ProgressBarWrapper>
        )}
      </S.Backdrop>
    </Fragment>
  );
}

export default Home;
