import { Paper, Typography } from "@mui/material";
import { getDocs } from "firebase/firestore";
import Navigation from "../components/Navigation";
import { colRefP } from "../firebase";
import AppContainer from "../layouts/AppContainer";
import "react-tabulator/lib/styles.css";
import "react-tabulator/lib/css/tabulator.min.css";
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
    },
  },
  { title: "Player", field: "name", width: 150, headerSort: false },
  { title: "Games Played", field: "gamesPlayed" },
  { title: "Games Won", field: "gamesWon" },
  { title: "Gold Coins", field: "gold" },
  { title: "Diamond Coins", field: "diamond" },
  { title: "Total Score", field: "totalScore" },
];

const options = {
  layout: "fitDataFill", //fit columns to width of table (optional)
  responsiveLayout: true,
  pagination: "local",
  paginationSize: 3,
  paginationSizeSelector: [3, 6, 8, 10],
  movableColumns: true,
  paginationCounter: "rows",
  initialSort: [
    { column: "totalScore", dir: "desc" },
    { column: "gamesWon", dir: "desc" },
  ],
};

const Scoreboard = () => {
  const [playersData, setPlayersData] = useState([]);

  useEffect(() => {
    //get all the users documents
    const playerDocuments = async () => {
      const docs = await getDocs(colRefP);
      return docs;
    };
    playerDocuments()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
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
        <Typography> This is the Scoreboard page </Typography>
        <ReactTabulator data={playersData} columns={columns} options={options} />
      </Paper>
    </AppContainer>
  );
};

export default Scoreboard;
