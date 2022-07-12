import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import phaserGame from "../../PhaserGame";
import Bootstrap from "../../scenes/Bootstrap";
import { useState } from "react";
import { useAppSelector } from "../../hooks/appDispatch";
import { IRoomData } from "../../services/types";

import * as S from "./styles";

function CreateRoom() {
  const [values, setValues] = useState<IRoomData>({
    name: "",
    description: "",
    password: null,
    autoDispose: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [nameFieldEmpty, setNameFieldEmpty] = useState(false);
  const [descriptionFieldEmpty, setDescriptionFieldEmpty] = useState(false);
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined);

  const handleChange =
    (prop: keyof IRoomData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [prop]: event.target.value });
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidName = values.name !== "";
    const isValidDescription = values.description !== "";

    if (isValidName === nameFieldEmpty) setNameFieldEmpty(!nameFieldEmpty);
    if (isValidDescription === descriptionFieldEmpty)
      setDescriptionFieldEmpty(!descriptionFieldEmpty);

   
    if (isValidName && isValidDescription && lobbyJoined) {
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;
      bootstrap.network
        .createCustom(values)
        .then(() => bootstrap.launchGame())
        .catch((error) => console.error(error));
    }
  };

  return (
    <S.CreateRoomFormWrapper onSubmit={handleSubmit}>
      <TextField
        label="Name"
        variant="outlined"
        color="secondary"
        autoFocus
        error={nameFieldEmpty}
        helperText={nameFieldEmpty && "Name is required"}
        onChange={handleChange("name")}
      />

      <TextField
        label="Description"
        variant="outlined"
        color="secondary"
        error={descriptionFieldEmpty}
        helperText={descriptionFieldEmpty && "Description is required"}
        multiline
        rows={4}
        onChange={handleChange("description")}
      />

      <TextField
        type={showPassword ? "text" : "password"}
        label="Password (optional)"
        onChange={handleChange("password")}
        color="secondary"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button variant="contained" color="secondary" type="submit">
        Create
      </Button>
    </S.CreateRoomFormWrapper>
  );
}

export default CreateRoom;
