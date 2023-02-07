import { Paper } from "@mui/material";
import Navigation from "../components/Navigation";
import { getPlayerDocuments } from "../firebase";
import AppContainer from "../layouts/AppContainer";
import "react-tabulator/lib/styles.css";
//import "react-tabulator/lib/css/tabulator.min.css";
import "react-tabulator/css/bulma/tabulator_bulma.min.css";
import { ReactTabulator } from "react-tabulator";
import { useState } from "react";
import { useEffect } from "react";

const columns = [
  //Define Table Columns
  {
    title: "Avatar",
    field: "avatarUrl",
    formatter: "image",
    headerSort: false,
    formatterParams: {
      height: "50px",
      width: "50px",
      urlPrefix: "",
      urlSuffix: "",
      textAlign: "center",
    },
    hozAlign: "center",
    vertAlign: "middle",
  },
  { title: "Player", field: "name", width: 150, headerSort: false, hozAlign: "left", vertAlign: "middle" },
  { title: "Games Played", field: "gamesPlayed", hozAlign: "center", vertAlign: "middle" },
  { title: "Games Won", field: "gamesWon", hozAlign: "center", vertAlign: "middle" },
  { title: "Gold Coins", field: "gold", hozAlign: "center", vertAlign: "middle" },
  { title: "Diamond Coins", field: "diamond", hozAlign: "center", vertAlign: "middle" },
  { title: "Total Score", field: "totalScore", hozAlign: "center", vertAlign: "middle" },
];

const options = {
  responsiveLayout: "hide",
  layout: "fitDataFill",
  pagination: "local",
  paginationSize: 3,
  paginationSizeSelector: [3, 6, 8, 10],
  movableColumns: true,
  initialSort: [
    { column: "totalScore", dir: "desc" },
    { column: "gamesWon", dir: "desc" },
  ],
};

const Scoreboard = () => {
  const [playersData, setPlayersData] = useState([]);

  useEffect(() => {
    getPlayerDocuments()
      .then((docs) => {
        docs.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          // setPlayersData(doc.data());
          setPlayersData((preData) => [...preData, doc.data()]);
        });
      })
      .catch((err) => {
        console.log("Error getting the players data:", err);
      });
  }, []);

  return (
    <AppContainer>
      <Navigation />
      <Paper sx={{ p: 2 }}>
        <ReactTabulator data={playersData} columns={columns} options={options} />
      </Paper>
    </AppContainer>
  );
};

export default Scoreboard;
