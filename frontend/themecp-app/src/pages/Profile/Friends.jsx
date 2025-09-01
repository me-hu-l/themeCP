'use client'

import React, { useState, useEffect, useContext } from 'react'
import Link from 'next/link';
import axios from "axios";
// import './ContestHistory.css';
import './Friends.css';
const Friends = ({id}) => {

  const [user_friends, setFriends] = useState([]);
  const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    console.log("Friends component mounted");
     // Fallback to local URL if env variable is not set
    // Fetch user friends
    axios
      .get(`${backend_url}/api/friends/list/${id}`, {
        withCredentials: true // Ensure cookies are sent with the request
      }).then((res) => setFriends(res.data))
      .catch((error) => {
        console.error("Error fetching user friends:", error);
        setFriends([]); // Set to empty array on error
      });
  }, []);


  const removeFriend = async (friendId) => {
    try {
      // Call the API to remove the friend (make sure to replace this with your actual endpoint)
      const response = await fetch(`${backend_url}/api/friends/remove-friend/${friendId}`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });

      const data = await response.json();
      if (response.ok) {
        // Update the local state to remove the friend from the list
        setFriends(user_friends.filter(friend => friend.id !== Number(friendId)));
      } else {
        alert('Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };


  const getBackgroundColor = (data) => {
        const rating = parseInt(data);
        if (rating > 0 && rating < 1200) {
            return '#808080';
        } else if (rating >= 1200 && rating < 1400) {
            return '#008000';
        } else if (rating >= 1400 && rating < 1600) {
            return '#03A89E';
        } else if (rating >= 1600 && rating < 1900) {
            return '#0000FF';
        } else if (rating >= 1900 && rating < 2100) {
            return '#AA00AA';
        } else if (rating >= 2100 && rating < 2300) {
            return '#FF8C00';
        } else if (rating >= 2300 && rating < 2400) {
            return '#FF8C00';
        } else if (rating >= 2400 && rating < 2600) {
            return '#FF0000';
        } else if (rating >= 2600 && rating < 3000) {
            return '#FF0000';
        } else if (rating >= 3000) {
            return '#FF0000';
        } else {
            return 'black';
        }
    }

  return (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Friends</h2>

    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-sm text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Who</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {user_friends.length===0 ? <tr><td colSpan="3" className="border border-gray-300 px-4 py-2 text-center font-bold">No friends found</td></tr> : user_friends.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{index +1}</td>
              <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                <Link href={`/profile/${item.id}`} className="text-black-700 hover:underline font-bold" style={{color: getBackgroundColor(item.rating)}}>
                  {item.codeforces_handle}
                </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                <button
                  onClick={() => removeFriend(item.id)}
                  className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 cursor-pointer"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


  return (
    <div className='friends-list-container'>
      Friends List
      <div className='friends-list-table'>
        <div style={{alignItems:'center', height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>ID</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Who</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Action</div>
       </div>

        {
          user_friends.map((item, index) => (
            <div className='friends-list-table-data' key={index}>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>{item.index+1 }</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.email}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>

               <button
              onClick={() => removeFriend(item.id)}
              className='bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700'
            >
              Remove Friend
            </button>
              </div>
              {/* <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.topic}</div> */}
            </div>
          ))
        }
      
    </div>
  )


}

export default Friends;