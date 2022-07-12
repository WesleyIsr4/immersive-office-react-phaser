import { Fragment } from "react";
import styled from "styled-components";
import Home from "./components/Home";
import Login from "./components/Login";
import { useAppSelector } from "./hooks/appDispatch";

function App() {
  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const roomJoined = useAppSelector((state) => state.room.roomJoined);

  let uiTemplate: JSX.Element;

  if (loggedIn) {
    <div>logado</div>;
  } else if (roomJoined) {
    uiTemplate = <Login />;
  } else {
    uiTemplate = <Home />;
  }

  return <Fragment>{uiTemplate}</Fragment>;
}

export default App;
