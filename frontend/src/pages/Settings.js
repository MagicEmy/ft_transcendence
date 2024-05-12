// import React, { useState } from 'react';
// import axios from 'axios';
// import useStorage from '../hooks/useStorage';



// function Settings() {
//   const [userProfile] = useStorage("user");

//   const [newUsername, setNewUsername] = useState(user.username)

//   const handleSave = async () => {
//     try {
//       const response = await axios.patch(`http://localhost:3002/${userProfile.user_id}/username`, {
//         username: newUsername
//       }, {
//         withCredentials: true,
//       })
//       setUser(response.data)
//     }
//     catch (error) {
//       console.error('Failed to save settings:', error)
//     }
//   }


//   const handleUsernameChange = (e) => {
//     setNewUsername(e.target.value)
//   }

//   return (
//     <div>
//       <h1>Settings</h1>
//       <div>
//         <label>Username</label>
//         <input type="text" value={newUsername} onChange={handleUsernameChange} />
//       </div>
//       <button onClick={handleSave}>Save</button>
//     </div>
//   )
// }


// export default Settings
