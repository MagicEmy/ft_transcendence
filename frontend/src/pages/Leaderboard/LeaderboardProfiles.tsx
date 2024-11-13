import { LeaderboardStats } from './types';
import { useGetAvatarUrl } from '../../hooks/useGetAvatarUrl';
import { useNavigate } from 'react-router-dom';

interface LeaderboardProfilesProps {
  leaderboard: LeaderboardStats[];
}

const LeaderboardProfiles = ({ leaderboard }: LeaderboardProfilesProps) => {
  if (!leaderboard || !Array.isArray(leaderboard))
    return <p className='text'>Refresh for loading new data</p>;

  return (
    <div id="leadProfile">
      {leaderboard.map((item) => (
        <Item user={item} key={item.userId} />
      ))}
    </div>
  );
};

interface ItemProps {
  user: LeaderboardStats;
}

const Item = ({ user }: ItemProps) => {
  const { avatar, isLoading } = useGetAvatarUrl(user.userId);
  const navigate = useNavigate();

  if (isLoading) return <>loading profile</>;
  return (
    <div className="flex">
      <div className="item">
        <img
          src={avatar || 'https://loremflickr.com/200/200/dog'}
          alt="profile avatar"
        />
        <div className="info">
          <div
            onClick={() => {
              navigate(`/profile/${user.userId}`);
              window.scrollTo(0, 0);
            }}
            className="opponents"
          >
            {user.userName}
          </div>
          <div className="info">
            <span className="total-points">
              Total points:<span className="points">{user.pointsTotal}</span>
            </span>
          </div>
          <div className="stats">
            <span className="stat">
              <strong>{user.wins}</strong>Wins
            </span>
            <span className="stat">
              <strong>{user.draws}</strong>Draws
            </span>
            <span className="stat">
              <strong>{user.losses}</strong>Losses
            </span>
          </div>
        </div>
      </div>
      <span className="rank">
        <span>{user.rank}</span>
      </span>
    </div>
  );
};

export default LeaderboardProfiles;
