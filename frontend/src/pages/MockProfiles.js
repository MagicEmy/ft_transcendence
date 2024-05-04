import React from 'react'

export default function profiles({ LeaderboardDB }) {
  return (
        <div id="profile">
            {Item(LeaderboardDB)}
        </div>
  )
}

function Item(data){
    return (
        <>
            {data.map((value, index) => (
                <div className="flex" key={index}>
                    <div className="item">
                        <img src={value.img} alt="" />
                        <div className="info">
                            <h3 className='name text-dark'>{value.user_name}</h3>
                            <span className="total-points">Total points: {value.points}</span>
                            <div className="stats">
                                <span className="stat">Wins: <strong>{value.wins}</strong></span>
                                <span className="stat">Losses: <strong>{value.losses}</strong></span>
                                <span className="stat">Draws: <strong>{value.draws}</strong></span>
                            </div>
                        </div>
                    </div>
                    <span className="item">
                        <span>{value.rank}</span>
                    </span>
                </div>
            ))}
        </>

        
    )
}