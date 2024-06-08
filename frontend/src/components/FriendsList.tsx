import React from 'react';
import { Friends } from '../types/shared';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import useStorage from '../hooks/useStorage';
import { useGetFriends } from '../hooks';

interface FriendsListProps {
  userId: string;
}

export const FriendsList = ({ userId }: FriendsListProps) => {
  const { friends, loading } = useGetFriends(userId);
  const navigate = useNavigate();
  return <div className="item">
    {loading ? (
      <p>Loading friends...</p>
    ) : (
      <div>
        <h4 className='title'>Friends</h4>
        {friends && friends.length > 0 ? (
          <div className="friends">
            <ul>
              {friends.map((friend: Friends) => (
                <li key={friend.userId}>

                  <button onClick={() => {
                    navigate(`/profile/${friend.userId}`, { replace: true })
                  }} className='button'>
                    {friend.userName}
                  </button>
                  <span className="statsFriends"></span>
                  <span className={`status-indicator ${friend.status}`}></span>
                  <span>{friend.status}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : <div className="friends">
          <span className="statsFriends">You have no friends :(</span>
        </div>}
      </div>
    )}

  </div>
};
