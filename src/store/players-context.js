import { createContext, useState } from "react";

const PlayersContext = createContext({
  players: [],
  addPlayer: (player) => {},
  removePlayer: (playerId) => {},
  resetPlayers: () => {},
  setPlayerData: (uname, key, value) => {},
});

const PlayersContextProvider = (props) => {
  const [players, setPlayers] = useState([]);

  const addPlayerHandler = (player) => {
    setPlayers((prevPlayers) => {
      return prevPlayers.concat(player);
    });
  };

  const removePlayerHandler = (playerId) => {
    setPlayers((prevPlayers) => {
      return prevPlayers.filter((player) => player !== playerId);
    });
  };

  const resetPlayersHandler = () => {
    setPlayers([]);
  };

  const setPlayerDataHandler = (uname, key, value) => {
    const updatedPlayer = players.forEach((item) => {
      item.name === uname ? (item[key] = value) : (item.extra[key] = value);
    });
    setPlayers(updatedPlayer);
  };

  const context = {
    players: players,
    addPlayer: addPlayerHandler,
    removePlayer: removePlayerHandler,
    resetPlayers: resetPlayersHandler,
    setPlayerData: setPlayerDataHandler,
  };
  return <PlayersContext.Provider value={context}> {props.children}</PlayersContext.Provider>;
};

export { PlayersContextProvider, PlayersContext as default };
