'use client';

import React, { useContext, useEffect, useState } from 'react'
// import './Profile.css'
import rating_pic from '../../../public/rating.png'
import star from '../../../public/star.png'
import ChartData from '../../components/Chart/ChartData'
import AddHandle from '../../components/AddHandle/AddHandle';
import mail from '../../../public/mail.png'
// import Donation from '../../components/Donation/Donation'
// import { ProfileContext } from '../../context/ProfileContext/ProfileContext'
// import { UserContestHistory } from '../../context/ProfileContext/ContestHistoryContext'
import PieData from '../../components/Chart/Pie/PieData'
import { useProfile } from '@/context/ProfileContext/ProfileContext';
import axios from "axios";


const Profile = ({id}) => {

    const [user_profile, setProfile] = useState(null);
    const {user_profile: loggedInUserProfile} = useProfile();
    const [user_contest, setContestHistory] = useState([]);
    const [cf_contest, setCFcontest] = useState([]);
    const [contestAttempt, setAttempt] = useState(0);
    const [rating, setRating] = useState(0);
    const [best_performance, setBestPerformance] = useState(0);
    const [maxRating, setMaxRating] = useState(0);
    const [isChecked, setChecked] = useState(false);
    const [friendStatus, setFriendStatus] = useState('add'); // 'add', 'pending', 'accepted'
    const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        console.log("Profile component mounted");
            // Example: Fetch user profile from an API endpoint
            const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // Fallback to local URL if env variable is not set
            console.log("Backend URL:", backend_url);
            axios
              .get(`${backend_url}/api/users/profile/${id}`, {
                // headers: { Authorization: `Bearer ${token}` },
                withCredentials: true // Ensure cookies are sent with the request
              }).then((res) => setProfile(res.data))
              .catch((error) => {
                console.error("Error fetching user profile:", error);
                setProfile({}); // Set to empty array on error
              });

        // Fetch user contest history
        axios
            .get(`${backend_url}/api/contests/contestHistory/${id}`, {
                // headers: { Authorization: `Bearer ${token}` },
                withCredentials: true // Ensure cookies are sent with the request
            }).then((res) => setContestHistory(res.data))
            .catch((error) => {
                console.error("Error fetching user contest history:", error);
                setContestHistory([]); // Set to empty array on error
            });

        
            
    },[id])

    useEffect(()=>{
        // Fetch friend status
        // if(loggedInUserProfile===null) return;
        if(loggedInUserProfile.id &&  loggedInUserProfile.id !== Number(id)){
            console.log("Fetching friend status for user:", id);
            console.log("Logged in user ID:", loggedInUserProfile.id);
            axios
                .get(`${backend_url}/api/friends/status/${id}`, {
                    withCredentials: true // Ensure cookies are sent with the request
                }).then((res) => {
                    setFriendStatus(res.data.status);
                })
                .catch((error) => {
                    console.error("Error fetching friend status:", error);
                    setFriendStatus('add'); // Default to 'add' on error
                });

        }
    },[loggedInUserProfile,id])

    useEffect(() => {
        if (user_profile === null)
            return;
        else if (!isChecked) {
            setCFcontest(() => []);
        }
        const get_user_profile = async() => {
            if (user_profile.codeforces_handle === null)
                return;
            let data = await fetch(`https://codeforces.com/api/user.rating?handle=${user_profile.codeforces_handle}`)
                .then((res) => res.json());
            const cf_contest_history = [];
            for (let item of data.result) {
                const temp_obj = {};
                temp_obj.rating = item.newRating;
                let timestamp = item.ratingUpdateTimeSeconds;

                // Convert timestamp to Date object (in milliseconds)
                let date = new Date(timestamp * 1000);

                // Get the components of the date
                let year = date.getFullYear();
                let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                let day = String(date.getDate()).padStart(2, '0');
                temp_obj.date = `${year}-${month}-${day}`;
                cf_contest_history.push(temp_obj);
            }
            setCFcontest(() => cf_contest_history);
        }
        get_user_profile();
    },[user_profile, isChecked]);

    useEffect(() => {
        setAttempt(user_contest.length);
        if (contestAttempt > 0) {
          const currentRating = user_contest[0].rating;
          setRating(currentRating);
    
          const bestPerf = Math.max(...user_contest.map(obj => obj.performance));
          setBestPerformance(bestPerf);
    
          const maxRtg = Math.max(...user_contest.map(obj => obj.rating));
          setMaxRating(maxRtg);
        }
      }, [user_contest, contestAttempt]); 
    
      
      const handleCheckBox = (event) => {
        setChecked(() => event.target.checked);
      }

      const handleFriendRequest = async () => {
        try {
            if (friendStatus === 'add') {
                // Send a friend request
                const response = await fetch(`${backend_url}/api/friends/request/${id}`, {
                    method: 'POST',
                    credentials: 'include', // Include cookies in the request
                });
                const data = await response.json();
                console.log("Friend request response:", data);
                if (response.ok) {
                    setFriendStatus('pending');
                } else {
                    alert('Failed to send friend request');
                }
            } else if (friendStatus === 'pending') {
                // Handle pending request (e.g., user cancels request or waits for approval)
                alert('Your request is pending');
            } else if (friendStatus === 'accepted') {
                // Remove the friend
                const response = await fetch(`/api/friends/remove-friend/${id}`, {
                    method: 'POST',
                    credentials: 'include', // Include cookies in the request
                });
                const data = await response.json();
                if (response.ok) {
                    setFriendStatus('add');
                } else {
                    alert('Failed to remove friend');
                }
            }
        } catch (error) {
            console.error('Error handling friend request:', error);
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

    const getRatingName = (data) => {
        const rating = parseInt(data);
        if (rating > 0 && rating < 1200) {
            return 'Newbie';
        } else if (rating >= 1200 && rating < 1400) {
            return 'Pupil';
        } else if (rating >= 1400 && rating < 1600) {
            return 'Specialist';
        } else if (rating >= 1600 && rating < 1900) {
            return 'Expert';
        } else if (rating >= 1900 && rating < 2100) {
            return 'Candidate master';
        } else if (rating >= 2100 && rating < 2300) {
            return 'Master';
        } else if (rating >= 2300 && rating < 2400) {
            return 'International master';
        } else if (rating >= 2400 && rating < 2600) {
            return 'Grandmaster';
        } else if (rating >= 2600 && rating < 3000) {
            return 'International grandmaster';
        } else if (rating >= 3000) {
            return 'Lengendary grandmaster';
        } else {
            return 'Unrated'
        }
    }


    return (
        <div className="flex flex-col md:flex-row">
            <div>
                <div className="w-[1020px] h-[320px] border-2 border-gray-500 mt-2 ml-[30px] rounded-[10px] pl-[25px] 
                    max-[1300px]:w-[850px] max-[730px]:w-[94%] max-[730px]:h-[285px] max-[730px]:ml-[1px] max-[730px]:mt-[5px]">
                    <p className="mb-[2px]" style={{color: getBackgroundColor(rating), fontSize:'23px'}}>{getRatingName(rating)}</p>
                    <div className="mt-[10px] font-bold text-[38px]" style={{color: getBackgroundColor(rating)}}>
                        {(user_profile !== null && user_profile.codeforces_handle !== null) ? user_profile.codeforces_handle : <AddHandle id={id}/>}
                    </div>
                    <p className="align-middle">
                        <span className="font-normal">
                            <img src='/rating.png' className="inline-block align-middle w-5 h-5 mr-1" alt="rating" />
                            Contest Rating
                        </span>: <span style={{color:getBackgroundColor(rating)}}>{rating}</span>
                        <span className="text-[16px]">
                            (max. <span style={{color:getBackgroundColor(maxRating), fontSize:'16px'}}>{getRatingName(maxRating).toLocaleLowerCase()}, <span style={{color:getBackgroundColor(maxRating), fontSize:'16px'}}>{maxRating}</span></span>)
                        </span>
                    </p>
                    <p className="align-middle">
                        <span className="font-normal">
                            <img src='/star.png' className="inline-block align-middle w-5 h-5 mr-1" alt="star" />
                            Best Performace
                        </span>: <span style={{color: getBackgroundColor(best_performance)}}>{best_performance}</span>
                    </p>
                    <p className="align-middle">
                        <span className="font-normal">
                            <img src='/star.png' className="inline-block align-middle w-5 h-5 mr-1" alt="star" />
                            Contest attempt
                        </span>: {contestAttempt}
                    </p>
                    <p className="align-middle">
                        <span className="font-normal">
                            <img src='/mail.png' className="inline-block align-middle w-5 h-5 mr-1" alt="mail" />
                            Email
                        </span>: {user_profile !== null ? user_profile.email : 'Email'}
                    </p>
                    {loggedInUserProfile.id !== Number(id) && <button
                        onClick={handleFriendRequest}
                        className={`mt-[10px] rounded-[5px] px-[20px] py-[10px] text-[16px] font-semibold
                            ${friendStatus === 'pending' ? 'bg-yellow-500' : friendStatus === 'accepted' ? 'bg-red-600' : 'bg-cyan-400'} text-white`}
                    >
                        {friendStatus === 'add' ? 'Add Friend' : friendStatus === 'pending' ? 'Pending' : 'Remove Friend'}
                    </button>}
                </div>
                <div className="w-[1025px] h-[500px] border-2 border-gray-500 mt-[20px] ml-[30px] rounded-[10px] pt-[20px] pr-[20px]
                    max-[1300px]:w-[850px] max-[730px]:w-[95%] max-[730px]:h-[500px] max-[730px]:ml-[1px] max-[730px]:mt-[10px] max-[730px]:pt-[10px]">
                    <center>
                        <div className="mb-[10px]">
                            <input type='checkbox' checked={isChecked} onChange={handleCheckBox} />Plot CF rating graph
                        </div>
                    </center>
                    {user_contest === null ? 'Loading' : <ChartData user_contest={user_contest} cf_contest={isChecked ? cf_contest : []} /> }
                </div>
                <div className="w-[1025px] h-[500px] border-2 border-gray-500 mt-[20px] ml-[30px] rounded-[10px] pt-[20px] pr-[20px]
                    max-[1300px]:w-[850px] max-[730px]:w-[95%] max-[730px]:h-[500px] max-[730px]:ml-[1px] max-[730px]:mt-[10px] max-[730px]:pt-[10px]">
                    {user_contest === null ? 'Loading' :  <PieData user_contest={user_contest} /> }
                </div>
            </div>
        </div>
    )

    return (
        <div className='profile-main-container'>
            <div>
                <div className='user-profile-data'>
                    <p style={{marginBottom: '2px', color: getBackgroundColor(rating), fontSize:'23px'}}>{getRatingName(rating)}</p>
                    <p style={{marginTop: '10px', fontWeight:'bolder' ,fontSize:'38px', color: getBackgroundColor(rating)}}>{(user_profile !== null && user_profile.codeforces_handle !== null) ? user_profile.codeforces_handle : <AddHandle id={id}/>}</p>
                    <p style={{verticalAlign:'middle'}}><span style={{fontWeight: 'normal'}}><img src='/rating.png' className='rating-logo'></img> Contest Rating</span>: <span style={{color:getBackgroundColor(rating)}}>{rating}</span> <span style={{fontSize:'16px'}}>(max. <span style={{color:getBackgroundColor(maxRating), fontSize:'16px'}}>{getRatingName(maxRating).toLocaleLowerCase()}, <span style={{color:getBackgroundColor(maxRating), fontSize:'16px'}}>{maxRating}</span></span>)</span></p>
                    <p style={{verticalAlign:'middle'}}><span style={{fontWeight:'normal'}}><img src='/star.png' className='rating-logo'></img> Best Performace</span>: <span style={{color: getBackgroundColor(best_performance)}}>{best_performance}</span></p>
                    <p style={{verticalAlign:'middle'}}><span style={{fontWeight:'normal'}}><img src='/star.png' className='rating-logo'></img> Contest attempt</span>: {contestAttempt}</p>
                    <p style={{verticalAlign:'middle'}}><span style={{fontWeight:'normal'}}><img src='/mail.png' className='rating-logo'></img> Email</span>: {user_profile !== null ? user_profile.email : 'Email'}</p>
                    {loggedInUserProfile.id !== Number(id) && <button
                        onClick={handleFriendRequest}
                        style={{
                            marginTop: '10px',
                            backgroundColor: (friendStatus === 'pending' ? '#f0ad4e' : friendStatus === 'accepted' ? '#d9534f' : '#5bc0de'),
                            color: '#fff',
                            borderRadius: '5px',
                            padding: '10px 20px',
                            fontSize: '16px',
                        }}
                    >
                        {friendStatus === 'add' ? 'Add Friend' : friendStatus === 'pending' ? 'Pending' : 'Remove Friend'}
                    </button>}
                </div>
                <div className='user-rating-graph'>
                    <center><div className='add-cf-graph'><input type='checkbox' checked={isChecked} onChange={handleCheckBox} />Plot CF rating graph</div></center>
                    {user_contest === null ? 'Loading' : <ChartData user_contest={user_contest} cf_contest={isChecked ? cf_contest : []} /> }
                </div>
                <div className='user-rating-graph'>
                    {user_contest === null ? 'Loading' :  <PieData user_contest={user_contest} /> }
                </div>
            </div>
            {/* <Donation /> */}
        </div>
    )
}

export default Profile