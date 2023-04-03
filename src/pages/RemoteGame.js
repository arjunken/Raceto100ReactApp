import { useContext, useState } from "react";
import Game from "../components/Game";
import RemoteGameLobby from "../components/RemoteGameLobby";
import AppContext from "../store/app-context";

const RemoteGame = () => {
  const [gameInSession, setGameInSession] = useState(false);
  const appDataCtx = useContext(AppContext);

  const endRemoteGameHandler = () => {
    setGameInSession(false);
  };

  return (
    <div>
      {!gameInSession ? (
        <RemoteGameLobby startRemoteGame={() => setGameInSession(true)} />
      ) : (
        <Game endRemoteGame={() => endRemoteGameHandler()} />
      )}
    </div>
  );
};

export default RemoteGame;
