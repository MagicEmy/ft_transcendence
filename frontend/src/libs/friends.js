import axios from 'axios';

export const loadFriends = async (userId) => {
    if (!userId) return;

    const response = await axios.get(`http://localhost:3002/user/${userId}/friends`, {
        withCredentials: true,
    });
    const friends = response.data;
    return friends;
}

export const addFriend = async ( userId, friendId) => {
    if (!userId || !friendId) {
        console.error('Missing userId or friendId');
        return;
    }

    try {
        const response = await axios.post('http://localhost:3002/user/friend', {
            user_id: userId,
            friend_id: friendId
        }, {
            withCredentials: true,
        });
        console.log('Friend added:', response.data);
    } catch (error) {
        console.error('Error adding friend:', error.response ? error.response.data : error.message);
    }
};


export const deleteFriend = async ( userId, friendId) => {
    if (!userId || !friendId) {
        console.error('Missing userId or friendId');
        return;
    }

    try {
        const response = await axios.delete('http://localhost:3002/user/friend', {
            user_id: userId,
            friend_id: friendId
        }, {
            withCredentials: true,
        });
        console.log('Friend added:', response.data);  // Inspect the response data
    } catch (error) {
        console.error('Error adding friend:', error.response ? error.response.data : error.message);
    }
};
