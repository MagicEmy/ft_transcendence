import React from 'react';
import StatItem from './StatItem';

interface TotalTimePlayed {
	weeks: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

interface GamesAgainstBot {
	totalPlayedGames: number;
	wins: number;
	losses: number;
	draws: number;
	maxScore: number;
	totalTimePlayed: TotalTimePlayed;
}

interface Profile {
	gamesAgainstBot: GamesAgainstBot;
}

interface GamesAgainstBotStatsProps {
	profile?: Profile | null;
}

const GamesAgainstBotStats = ({ profile }: GamesAgainstBotStatsProps) => {
	if (!profile || !profile.gamesAgainstBot) {
		return <span className="stat">No games played yet</span>;
	}

	const { totalPlayedGames, wins, losses, draws, maxScore, totalTimePlayed } = profile.gamesAgainstBot;
	const { weeks, days, hours, minutes, seconds } = totalTimePlayed;

	return (
		<>
			<div className="stat-column">
				<span className="stat">Total played games <strong>{totalPlayedGames}</strong></span>
				<span className="stat">High score <strong>{maxScore}</strong></span>
			</div>
			<StatItem label="Wins" value={wins} />
			<StatItem label="Draws" value={draws} />
			<StatItem label="Losses" value={losses} />
			<h4 className='profile-text-dark'>Total time played against bot</h4>
			<div className="item info">
				<StatItem label="Weeks" value={weeks} />
				<StatItem label="Days" value={days} />
				<StatItem label="Hours" value={hours} />
				<StatItem label="Minutes" value={minutes} />
				<StatItem label="Seconds" value={seconds} />
			</div>
		</>
	);
};

export default GamesAgainstBotStats;
