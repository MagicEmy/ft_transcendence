import React, { useState } from 'react'
import Profiles from './MockProfiles';
import { LeaderboardDB } from './database';


export default function Board() {

  return (
    <div className="board">
        <h1 className='leaderboard'>Leaderboard</h1>
        <Profiles LeaderboardDB={(LeaderboardDB)}></Profiles>

    </div>
  )
}

