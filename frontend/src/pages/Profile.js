import React, { useContext } from "react";
// import axios from "axios";
import UserContext from "../context/UserContext";
import "./Profile.css";

function Profile() {
//   const [jsonString, setJsonString] = useState("");
  const { userProfile, isLoading } = useContext(UserContext);
  console.log(userProfile);

  if (isLoading) {
    return <div>Loading user</div>;
  }

  console.log(Object.entries(userProfile));
  return (
    <div className="profile-container">
      <div>
        {Object.entries(userProfile).map(([key, value]) => (
          <div>
            {key}: {value}
          </div>
        ))}
      </div>
      {/* <div>
        {JSON.stringify(userProfile)}
      </div> */}
      <div className="profile-details">
        {/*         
        intra_login: {userProfile.intra_login}
        user_id: {userProfile.user_id}
        user_name: {userProfile.user_name}
        avatar: {userProfile.avatar} */}
      </div>
    </div>
  );
}

export default Profile;
