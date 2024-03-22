import { useState, useEffect } from 'react';

const ChatBar = ({ socket }) => {
  const [users, setUsers] = useState([]);
  // const [channels, setChannels] = useState([
  //   { name: 'General' },
  //   { name: 'Random' },
  //   { name: 'Game' }
  // ]);

  useEffect(() => {
    socket.on('newUserResponse', (data) => setUsers(data));
    console.log(users);
  }, [socket, users]);

//   useEffect(() => {
//     socket.on('newChannelResponse', (data) => setChannels(data));
//     console.log(channels);
//   }, [socket, channels]);

//   const handleClick = () => {
//     socket.emit('newChannel', { name: 'New Channel' });
//   };

  return (
    <div className="chat__sidebar">
      <h2>Open Chat</h2>

      <div>
        <h4 className="chat__header">Active users</h4>
        <div className="chat__users">
          {users.map((user) => (
            <p key={user.socketID}>{user.userName}</p>
          ))}
        </div>
        {/* <h4 className="chat__header">Channels</h4>
        <div className="chat__users">
          {channels.map((channel) => (
            <p key={channel.name}>{channel.name}</p>
          ))}
          <button className="login-button" onClick={handleClick}>Create New Channel</button>
        </div> */}
      </div>
    </div>
  );
};

export default ChatBar;


