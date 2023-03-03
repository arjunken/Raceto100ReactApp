import { useState } from "react";
import Game from "../components/Game";
import RemoteGameLobby from "../components/RemoteGameLobby";

const RemoteGame = () => {
  const [gameInSession, setGameInSession] = useState(false);

  return (
    <div>
      {!gameInSession ? (
        <RemoteGameLobby startRemoteGame={() => setGameInSession(true)} />
      ) : (
        <Game endRemoteGame={() => setGameInSession(false)} />
      )}
    </div>
  );
};

export default RemoteGame;
