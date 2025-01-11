import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchFriends();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:4000/api/users/search", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(response.data);
  };

  const fetchFriends = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "http://localhost:4000/api/users/myFriends",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setFriends(response.data);
  };

  const handleSendFriendRequest = async (username) => {
    const token = localStorage.getItem("token");
    await axios.post(
      "http://localhost:4000/api/users/send-friend-request",
      { username },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
    fetchFriends();
    alert("Friend Request Sent Successfully");
  };

  const handleUnfriend = async (username) => {
    const token = localStorage.getItem("token");
    await axios.post(
      "/api/users/unfriend",
      { username },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchFriends();
  };

  return (
    <div className="home-container">
      <h1>Welcome to Friend Finder</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <h2>Friend Recommendations</h2>
      <ul>
        {users
          .filter((user) => user.username.includes(search))
          .map((user) => (
            <li key={user._id}>
              {user.username}
              <button onClick={() => handleSendFriendRequest(user.username)}>
                Send Friend Request
              </button>
            </li>
          ))}
      </ul>

      <h2>Your Friends</h2>
      <ul>
        {friends.map((friend) => (
          <li key={friend._id}>
            {friend.username}
            <button onClick={() => handleUnfriend(friend.username)}>
              Unfriend
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
