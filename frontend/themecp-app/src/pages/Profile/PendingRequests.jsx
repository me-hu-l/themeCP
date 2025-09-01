'use client'

import React, { useState, useEffect, useContext } from 'react'

import axios from "axios";
import './PendingRequests.css';
import Link from 'next/link';

const PendingRequests = ({id}) => {

  const [pending_requests, setPendingRequests] = useState([]);
  const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    console.log("PendingRequests component mounted");
    const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // Fallback to local URL if env variable is not set
    // Fetch user pending requests
    axios
      .get(`${backend_url}/api/friends/pending-requests/${id}`, {
        withCredentials: true // Ensure cookies are sent with the request
      }).then((res) => setPendingRequests(res.data))
      .catch((error) => {
        console.error("Error fetching pending requests:", error);
        setPendingRequests([]); // Set to empty array on error
      });
  }, []);


  // Handle accepting a friend request
  const acceptRequest = async (requestId) => {
    try {
      const response = await fetch(`${backend_url}/api/friends/accept-request/${requestId}`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });

      const data = await response.json();
      if (response.ok) {
        // Remove the accepted request from the list
        setPendingRequests(pending_requests.filter((request) => request.id !== Number(requestId)));
      } else {
        alert('Failed to accept the request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  // Handle rejecting a friend request
  const rejectRequest = async (requestId) => {
    try {
      const response = await fetch(`${backend_url}/api/friends/reject-request/${requestId}`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });

      const data = await response.json();
      if (response.ok) {
        // Remove the rejected request from the list
        setPendingRequests(pending_requests.filter((request) => request.id !== Number(requestId)));
      } else {
        alert('Failed to reject the request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };



    return (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Pending Friends Request</h2>

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
          { pending_requests.length===0 ? <tr><td colSpan="3" className="border border-gray-300 px-4 py-2 text-center font-bold">No pending requests found</td></tr> : pending_requests.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{pending_requests.length - index}</td>
              <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                <Link href={`/profile/${item.id}`} className="text-black-700 hover:underline font-bold">
                  {item.codeforces_handle}
                </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                <button
                  onClick={() => acceptRequest(item.id)}
                  className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 cursor-pointer"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectRequest(item.id)}
                  className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 cursor-pointer"
                >
                  Reject
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
    <div className='pending-list-container'>
      Friends List
      <div className='pending-list-table'>
        <div style={{alignItems:'center', height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>ID</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Who</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Action</div>
       </div>

        {
          pending_requests.map((item, index) => (
            <div className='pending-list-table-data' key={index}>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>{item.index+1 }</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.email}</div>
               <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>

                  <button
                  onClick={() => acceptRequest(item.id)}
                  className='bg-green-500 text-white py-1 px-3 rounded hover:bg-green-700'
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectRequest(item.id)}
                  className='bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700'
                >
                  Reject
                </button>
              </div>
              {/* <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.topic}</div> */}
            </div>
          ))
        }
      
    </div>
  )

}

export default PendingRequests;