import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LockIcon from "@mui/icons-material/Lock";

import { getAvatarString } from "../../utils/getAvatar";
import { getColorByString } from "../../utils/getColorByString";

import phaserGame from "../../PhaserGame";
import Bootstrap from "../../scenes/Bootstrap";
import { Fragment, useState } from "react";
import { useAppSelector } from "../../hooks/appDispatch";

import * as S from "./styles";

function CustomRoom() {
  const [password, setPassword] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [passwordFieldEmpty, setPasswordFieldEmpty] = useState(false);
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined);
  const availableRooms = useAppSelector((state) => state.room.availableRooms);

  const handleJoinClick = (roomId: string, password: string | null) => {
    if (!lobbyJoined) return;
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;
    bootstrap.network
      .joinCustomById(roomId, password)
      .then(() => bootstrap.launchGame())
      .catch((error) => {
        console.error(error);
        if (password) setShowPasswordError(true);
      });
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidPassword = password !== "";

    if (isValidPassword === passwordFieldEmpty)
      setPasswordFieldEmpty(!passwordFieldEmpty);
    if (isValidPassword) handleJoinClick(selectedRoom, password);
  };

  const resetPasswordDialog = () => {
    setShowPasswordDialog(false);
    setPassword("");
    setPasswordFieldEmpty(false);
    setShowPasswordError(false);
  };

  if (availableRooms.length)
    return (
      <S.MessageText>
        There are no custom rooms now, create one or join the public lobby.
      </S.MessageText>
    );

  return (
    <Fragment>
      <S.CustomRoomTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>ID</TableCell>
              <TableCell align="center">
                <PeopleAltIcon />
              </TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availableRooms.map((room) => {
              const { roomId, metadata, clients } = room;
              const { name, description, hasPassword } = metadata;
              return (
                <S.TableRowWrapper key={roomId}>
                  <TableCell>
                    <Avatar
                      className="avatar"
                      style={{ background: getColorByString(name) }}
                    >
                      {getAvatarString(name)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="name">{name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="description">{description}</div>
                  </TableCell>
                  <TableCell>{roomId}</TableCell>
                  <TableCell align="center">{clients}</TableCell>
                  <TableCell align="center">
                    <Tooltip title={hasPassword ? "Password required" : ""}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                          if (hasPassword) {
                            setShowPasswordDialog(true);
                            setSelectedRoom(roomId);
                          } else {
                            handleJoinClick(roomId, null);
                          }
                        }}
                      >
                        <div className="join-wrapper">
                          {hasPassword && <LockIcon className="lock-icon" />}
                          Join
                        </div>
                      </Button>
                    </Tooltip>
                  </TableCell>
                </S.TableRowWrapper>
              );
            })}
          </TableBody>
        </Table>
      </S.CustomRoomTableContainer>
      <S.PasswordDialog open={showPasswordDialog} onClose={resetPasswordDialog}>
        <form onSubmit={handlePasswordSubmit}>
          <DialogContent className="dialog-content">
            <S.MessageText>
              This a private room, please enter password:
            </S.MessageText>
            <TextField
              autoFocus
              fullWidth
              error={passwordFieldEmpty}
              helperText={passwordFieldEmpty && "Required"}
              value={password}
              label="Password"
              type="password"
              variant="outlined"
              color="secondary"
              onInput={(e) => {
                setPassword((e.target as HTMLInputElement).value);
              }}
            />
            {showPasswordError && (
              <Alert severity="error" variant="outlined">
                Incorrect Password!
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={resetPasswordDialog}>
              Cancel
            </Button>
            <Button color="secondary" type="submit">
              Join
            </Button>
          </DialogActions>
        </form>
      </S.PasswordDialog>
    </Fragment>
  );
}

export default CustomRoom;
