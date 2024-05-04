// import React, { useEffect, useState, useContext } from "react";
// import useStorage from "../hooks/useStorage";
// import AuthContext from "../context/AuthContext";
// import axios from "axios";
import React from 'react'
import "./Leaderboard.css";
import Board from './Board';

export default function Leaderboard() {
  
	return (
		<div className="App" id='main'>
			<Board></Board>
		</div>
	  );
  }
  

//   const { authToken } = useContext(AuthContext);
//   const [userProfile] = useStorage("user");

//   useEffect(() => {
//     if (authToken) {
//       fetchData();
//     } else {
//       console.log("No user_id");
//     }
//   }, []);	

//   const fetchData = async () => {
//     try {
//       const response = await axios.get("http://localhost:3002/stats/leaderboard");
//       setLeaderboardData(response.data);
//     } catch (error) {
//       console.error("Error fetching leaderboard data:", error);
//     }
//   };