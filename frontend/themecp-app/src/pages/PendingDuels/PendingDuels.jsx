'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import {useProfile} from '@context/ProfileContext/ProfileContext';
// import { useAuth} from '@context/AuthContext/AuthContext';

const PendingDuels = () => {
  const [pendingDuels, setPendingDuels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
//   const {user_profile} = useProfile();
//   const {isAuth} = useAuth();

  useEffect(() => {
    const fetchPendingDuels = async () => {
      try {
        let response = await fetch(`${backend_url}/api/duels/pending`,{
                credentials: 'include',
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error:', errorData.detail || errorData.message || errorData);
          alert(errorData.detail || 'An error occurred');
          return;
        }
        const data = await response.json();
        setPendingDuels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

       const pollActiveDuel = async () => {
      try {
        const response = await fetch(`${backend_url}/api/duels/active`, {
          credentials: 'include',
        });
        if (!response.ok){
          const errorData = await response.json();
          console.error('API error:', errorData.detail || errorData.message || errorData);
          // alert(errorData.detail || 'An error occurred');
          return;
        }

        const activeDuel = await response.json();

        if (activeDuel && activeDuel.id) {
          alert('You have an active duel! Redirecting to the duel page.');
          router.push(`/duel/${activeDuel.id}`);
        }
      } catch (err) {
        console.error('Error polling active duel:', err.message);
      }
    };

    fetchPendingDuels();

    // Start polling every 5 seconds
    pollActiveDuel(); // Initial check
    const interval = setInterval(() => {
      pollActiveDuel();
    }, 5000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [router]);


  const acceptRequest = async (duelId) => {
    try {
      const response = await fetch(`${backend_url}/api/duels/${duelId}/accept`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });
      const data = await response.json();
      if (response.ok) {
        // Remove the accepted request from the list
        setPendingDuels(pendingDuels.filter((request) => request.id !== Number(duelId)));
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData.detail || errorData.message || errorData);
        alert(errorData.detail || 'couldn\'t accept the request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const rejectRequest = async (duelId) => {
    try {
      const response = await fetch(`${backend_url}/api/duels/${duelId}/reject`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });
      const data = await response.json();
      if (response.ok) {
        // Remove the rejected request from the list
        setPendingDuels(pendingDuels.filter((request) => request.id !== Number(duelId)));
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData.detail || errorData.message || errorData);
        alert(errorData.detail || 'couldn\'t reject the request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Pending Duels</h2>

    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-sm text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Time</th>
            <th className="border border-gray-300 px-4 py-2">Who</th>
            <th className="border border-gray-300 px-4 py-2">Topic</th>
            <th className="border border-gray-300 px-4 py-2">Level</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingDuels.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{ 
              new Date(item.created_at).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
            }
            </td>
              <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                <Link href={`/profile/${item.creator.id}`} className="text-black-700 hover:underline font-bold">
                  {item.creator.codeforces_handle}
                </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">{item.topic}</td>
              <td className="border border-gray-300 px-4 py-2">{item.duel_level}</td>
              <td className="border border-gray-300 px-4 py-2 space-x-2">
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

    <div className="mt-6">
      <button
        onClick={() => router.push('/create_duel')}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 cursor-pointer"
      >
        Create New Duel
      </button>
    </div>
  </div>
);


  return (
    <div>
      <div className='margin-4 padding-4'>
        Pending Duels
        <div className="mt-[10px] border-2 border-black grid justify-center items-center" style={{gridTemplateColumns: '0.4fr 1fr 1fr 1fr 1fr'}}>
          <div style={{alignItems:'center', height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Time</div>
          <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Who</div>
          <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Topic</div>
          <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Level</div>
          <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Action</div>
        </div>

          {
            pendingDuels.map((item, index) => (
              <div className="mt-[10px] border-2 border-black grid justify-center items-center" style={{gridTemplateColumns: '0.4fr 1fr 1fr 1fr 1fr'}} key={index}>
                <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>{item.created_at }</div>
                <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.creator_id}</div>
                <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.topic}</div>
                <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.duel_level}</div>
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
      <button
        onClick={() => router.push('/create_duel')}
        className='bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 m-4'
      >
        Create New Duel
      </button>
    </div>
  )

};

export default PendingDuels;