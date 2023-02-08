import { Container, Paper } from "@mui/material";
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
    width: 80,
    formatter: "responsiveCollapse",
    resizable: false,
    formatter: "image",
    headerSort: false,
    formatterParams: {
      height: "50px",
      width: "50px",
      urlPrefix: "",
      urlSuffix: "",
      textAlign: "center",
    },
    hozAlign: "left",
    vertAlign: "middle",
  },
  { title: "Player", field: "name", minWidth: 80, headerSort: false, hozAlign: "left", resizable: false, vertAlign: "middle" },
  { title: "Total Score", field: "totalScore", hozAlign: "center", minWidth: 150, resizable: false, vertAlign: "middle" },
  { title: "Games Played", field: "gamesPlayed", minWidth: 80, hozAlign: "center", resizable: false, vertAlign: "middle" },
  { title: "Games Won", field: "gamesWon", minWidth: 80, hozAlign: "center", resizable: false, vertAlign: "middle" },
  { title: "Gold Coins", field: "gold", minWidth: 80, hozAlign: "center", resizable: false, vertAlign: "middle" },
  { title: "Diamond Coins", field: "diamond", minWidth: 80, hozAlign: "center", resizable: false, vertAlign: "middle" },
];

const options = {
  responsiveLayout: "collapse",
  layout: "fitDataFill",
  pagination: "local",
  paginationSize: 3,
  paginationSizeSelector: [3, 6, 8, 10],
  movableColumns: false,
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
      <Container sx={{ p: 0 }}>
        <ReactTabulator data={playersData} columns={columns} options={options} />
      </Container>
    </AppContainer>
  );
};

export default Scoreboard;
