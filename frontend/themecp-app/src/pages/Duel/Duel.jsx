"use client"

import React, { useEffect, useState } from 'react'
// import './StartContest.css'
// import Timer_2hr from '../../components/Timer/Timer_2hr'
import Timer_duel from '../../components/Timer/Timer_duel';
// import { useNavigate } from 'react-router-dom'
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext/ProfileContext';
import { useLevel } from '../../context/LevelContext';
import Link from 'next/link';
// import { reverse } from 'dns';


const Duel = ({id}) =>{
        const router = useRouter();
        const { user_profile } = useProfile();
        const [opponentProfile, setOpponentProfile] = useState(null);
        const [duelState, setDuelState] = useState(null)
        const [currentDuel, setCurrentDuel] = useState(null)
        const [endDuel, setEndDuel] = useState(false);
        
        const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

        const get_current_duel = async () => {
                try {
                        console.log('get_current_duel')
                        const response = await fetch(`${backend_url}/api/duels/active`, {
                                method: 'GET',
                                credentials: 'include',
                        });
                        if (!response.ok) {
                                const errorData = await response.json();
                                console.error('API error:', errorData.detail || errorData.message || errorData);
                                // alert(errorData.detail || 'An error occurred');
                                return;
                        }
                        const data = await response.json();
                        console.log(data);
                        setCurrentDuel(data);
                        console.log("Current Duel: ", data);
                        // const item = level[data.duel_level];
                        // setDuelDuration(item.Duration);
                } catch (err) {
                        console.error('Error in getting current duel: ', err);
                }
        };

        const get_opponent_profile = async () => {
                try {
                        console.log('get_opponent_profile');
                        // console.log("Fetching opponent profile...");
                        console.log('current duel: ', currentDuel);
                        const opponent_id = (currentDuel.creator.id === user_profile.id)? currentDuel?.opponent.id : currentDuel?.creator.id;
                        const response = await fetch(`${backend_url}/api/users/profile/${opponent_id}`, {
                                method: 'GET',
                                credentials: 'include',
                        });
                        if (!response.ok) {
                                const errorData = await response.json();
                                console.error('API error:', errorData.detail || errorData.message || errorData);
                                // alert(errorData.detail || 'An error occurred');
                                return;
                        }
                        const data = await response.json();
                        setOpponentProfile(data);
                } catch (err) {
                        console.error('Error in getting opponent profile: ', err);
                }
        };

        const poll_duel_state = async () => {
                        try {
                                const response = await fetch(`${backend_url}/api/duels/${currentDuel?.id}/poll`, {
                                        method: 'GET',
                                        credentials: 'include',
                                });
                                if (!response.ok) {
                                        const errorData = await response.json();
                                        console.error('API error:', errorData.detail || errorData.message || errorData);
                                        // alert(errorData.detail || 'An error occurred');
                                        return;
                                }
                                const data = await response.json();
                                setDuelState(data);
                        } catch (err) {
                                console.error('Error in polling duel state: ', err);
                        }
                };

        // useEffect(()=>{
        //         get_current_duel();
        //         get_opponent_profile();
        //         // poll_duel_state();
        //         const interval = setInterval(poll_duel_state, 5000);
        //                 return () => clearInterval(interval);
        // },[id])

        useEffect(() => {
                get_current_duel();
        }, [id]); // This effect runs when `id` changes.

        useEffect(() => {
                if(currentDuel) {
                        poll_duel_state();
                        const interval = setInterval(poll_duel_state, 5000);
                        return () => clearInterval(interval);
                }
        }, [currentDuel]); // This effect runs when `currentDuel` changes.

        useEffect(() => {
                if (currentDuel && currentDuel.opponent.id) {
                        get_opponent_profile();
                }
        }, [currentDuel]);



        useEffect(() => {
                const poll_codeforces_submission = async () => {
                        try {
                                const response = await fetch(`https://codeforces.com/api/user.status?handle=${user_profile.codeforces_handle}&from=1&count=10`, {
                                        method: 'GET',
                                });
                                if (!response.ok) {
                                        throw new Error('Network response was not ok');
                                }
                                const data = await response.json();
                                const submissions = data.result;
                                submissions.reverse(); // Process older submissions first
                                for (const submission of submissions) {
                                        // Process each submission
                                        // console.log('contest id', submission);
                                        console.log(submission.problem.contestId, currentDuel.contestId1, submission.problem.index, currentDuel.index1);
                                        if(submission.verdict === "OK" && submission.problem.contestId== currentDuel.contestId1 && submission.problem.index == currentDuel.index1){
                                                // Problem 1 solved
                                                console.log('successfull Submission:', submission);
                                                const res = await fetch(`${backend_url}/api/duels/${currentDuel.id}/submit`, {
                                                        method: 'POST',
                                                        headers: {
                                                                'Content-Type': 'application/json',
                                                        },
                                                        credentials: 'include',
                                                        body: JSON.stringify({
                                                                duel_id: currentDuel.id,
                                                                user_id: user_profile.id,
                                                                problem_slot: 1,
                                                                submission_id: submission.id,
                                                                first_solved_at: submission.creationTimeSeconds,
                                                        }),
                                                });
                                                if (!res.ok) {
                                                        throw new Error('Network response was not ok');
                                                }
                                        }
                                        if(submission.verdict === "OK" && submission.problem.contestId== currentDuel.contestId2 && submission.problem.index == currentDuel.index2){
                                                // Problem 1 solved
                                                console.log('successfull Submission:', submission);
                                                const res = await fetch(`${backend_url}/api/duels/${currentDuel.id}/submit`, {
                                                        method: 'POST',
                                                        headers: {
                                                                'Content-Type': 'application/json',
                                                        },
                                                        credentials: 'include',
                                                        body: JSON.stringify({
                                                                duel_id: currentDuel.id,
                                                                user_id: user_profile.id,
                                                                problem_slot: 2,
                                                                submission_id: submission.id,
                                                                first_solved_at: submission.creationTimeSeconds,
                                                        }),
                                                });
                                                if (!res.ok) {
                                                        throw new Error('Network response was not ok');
                                                }
                                        }
                                        if(submission.verdict === "OK" && submission.problem.contestId== currentDuel.contestId3 && submission.problem.index == currentDuel.index3){
                                                // Problem 1 solved
                                                console.log('successfull Submission:', submission);
                                                const res = await fetch(`${backend_url}/api/duels/${currentDuel.id}/submit`, {
                                                        method: 'POST',
                                                        headers: {
                                                                'Content-Type': 'application/json',
                                                        },
                                                        credentials: 'include',
                                                        body: JSON.stringify({
                                                                duel_id: currentDuel.id,
                                                                user_id: user_profile.id,
                                                                problem_slot: 3,
                                                                submission_id: submission.id,
                                                                first_solved_at: submission.creationTimeSeconds,
                                                        }),
                                                });
                                                if (!res.ok) {
                                                        throw new Error('Network response was not ok');
                                                }
                                        }
                                        if(submission.verdict === "OK" && submission.problem.contestId== currentDuel.contestId4 && submission.problem.index == currentDuel.index4){
                                                // Problem 1 solved
                                                console.log('successfull Submission:', submission);
                                                const res = await fetch(`${backend_url}/api/duels/${currentDuel.id}/submit`, {
                                                        method: 'POST',
                                                        headers: {
                                                                'Content-Type': 'application/json',
                                                        },
                                                        credentials: 'include',
                                                        body: JSON.stringify({
                                                                duel_id: currentDuel.id,
                                                                user_id: user_profile.id,
                                                                problem_slot: 4,
                                                                submission_id: submission.id,
                                                                first_solved_at: submission.creationTimeSeconds,
                                                        }),
                                                });
                                                if (!res.ok) {
                                                        throw new Error('Network response was not ok');
                                                }
                                        }
                                        // console.log('Submission:', submission);
                                }
                        } catch (err) {
                                console.error('Error in polling codeforces submission: ', err);
                        }
                };
                const interval = setInterval(poll_codeforces_submission, 5000);
                return () => clearInterval(interval);
        }, [currentDuel]);

        useEffect(() => {
                if (duelState && duelState.status === 'finished') {
                        setEndDuel(true);
                }
        }, [duelState]);

        useEffect(() => {
                if (endDuel) {
                        if(duelState && duelState.status !== 'finished') {
                                poll_duel_state();
                        }
                        alert('Duel has ended! Redirecting to duel history page.');
                        router.push('/')
                        // router.push(`/duel_history/${user_profile.id}`);
                        // Handle end of duel logic here
                }
        }, [endDuel]);


            const getBackgroundColor = (data) => {
                const rating = parseInt(data);
                if (rating >= 0 && rating < 1200) {
                        return '#CCCCCC';
                } else if (rating >= 1200 && rating < 1400) {
                        return '#77FF77';
                } else if (rating >= 1400 && rating < 1600) {
                        return '#77DDBB';
                } else if (rating >= 1600 && rating < 1900) {
                        return '#AAAAFF';
                } else if (rating >= 1900 && rating < 2100) {
                        return '#FF88FF';
                } else if (rating >= 2100 && rating < 2300) {
                        return '#FFCC88';
                } else if (rating >= 2300 && rating < 2400) {
                        return '#FFBB55';
                } else if (rating >= 2400 && rating < 2600) {
                        return '#FF7777';
                } else if (rating >= 2600 && rating < 3000) {
                        return '#FF3333';
                } else if (rating >= 3000) {
                        return '#AA0000';
                }
        }

        return (
        <div className="overflow-x-auto">
        {(currentDuel && opponentProfile && duelState) ? (
        <>
                <table className="min-w-full table-auto border border-gray-300 text-sm text-center">
                <thead className="bg-gray-100">
                <tr>
                <th className="border border-gray-300 px-4 py-2">Participant</th>
                <th className="border border-gray-300 px-4 py-2" style={{backgroundColor: getBackgroundColor(currentDuel.R1)}}>
                        <a
                        href={`https://codeforces.com/problemset/problem/${currentDuel.contestId1}/${currentDuel.index1}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        >
                        {`P1`}
                        </a>
                        <br />
                        <span className="text-xs text-gray-500">/ {currentDuel.R1}</span>
                </th>
                <th className="border border-gray-300 px-4 py-2" style={{backgroundColor: getBackgroundColor(currentDuel.R2)}}>
                        <a
                        href={`https://codeforces.com/problemset/problem/${currentDuel.contestId2}/${currentDuel.index2}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        >
                        {`P2`}
                        </a>
                        <br />
                        <span className="text-xs text-gray-500">/ {currentDuel.R2}</span>
                </th>
                <th className="border border-gray-300 px-4 py-2" style={{backgroundColor: getBackgroundColor(currentDuel.R3)}}>
                        <a
                        href={`https://codeforces.com/problemset/problem/${currentDuel.contestId3}/${currentDuel.index3}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        >
                        {`P3`}
                        </a>
                        <br />
                        <span className="text-xs text-gray-500">/ {currentDuel.R3}</span>
                </th>
                <th className="border border-gray-300 px-4 py-2" style={{backgroundColor: getBackgroundColor(currentDuel.R4)}}>
                        <a
                        href={`https://codeforces.com/problemset/problem/${currentDuel.contestId4}/${currentDuel.index4}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        >
                        {`P4`}
                        </a>
                        <br />
                        <span className="text-xs text-gray-500">/ {currentDuel.R4}</span>
                </th>
                </tr>
                </thead>
                <tbody>
                <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">
                        <Link href={`/profile/${user_profile.id}`} className="text-black-700 hover:underline font-bold" style={{color: getBackgroundColor(user_profile.rating)}}>
                        {user_profile.codeforces_handle}
                        </Link>
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${duelState.problems[user_profile.id][0]?.score > 0 ? 'text-green-600' : ''}`}>
                        {duelState.problems[user_profile.id][0]?.score ?? 0}
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${duelState.problems[user_profile.id][1]?.score > 0 ? 'text-green-600' : ''}`}>
                        {duelState.problems[user_profile.id][1]?.score ?? 0}
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${duelState.problems[user_profile.id][2]?.score > 0 ? 'text-green-600' : ''}`}>
                        {duelState.problems[user_profile.id][2]?.score ?? 0}
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${duelState.problems[user_profile.id][3]?.score > 0 ? 'text-green-600' : ''}`}>
                        {duelState.problems[user_profile.id][3]?.score ?? 0}
                </td>
                </tr>
                <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">
                        <Link href={`/profile/${opponentProfile.id}`} className="text-black-700 hover:underline font-bold" style={{color: getBackgroundColor(opponentProfile.rating)}}>
                                {opponentProfile.codeforces_handle}
                        </Link>
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${duelState.problems[opponentProfile.id][0]?.score > 0 ? 'text-green-600' : ''}`}>
                        {duelState.problems[opponentProfile.id][0]?.score ?? 0}
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${duelState.problems[opponentProfile.id][1]?.score > 0 ? 'text-green-600' : ''}`}>
                        {duelState.problems[opponentProfile.id][1]?.score ?? 0}
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${duelState.problems[opponentProfile.id][2]?.score > 0 ? 'text-green-600' : ''}`}>
                        {duelState.problems[opponentProfile.id][2]?.score ?? 0}
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${duelState.problems[opponentProfile.id][3]?.score > 0 ? 'text-green-600' : ''}`}>
                        {duelState.problems[opponentProfile.id][3]?.score ?? 0}
                </td>
                </tr>
                </tbody>
                </table>
                <div className='timer-container'>
                <div style={{display:'flex', alignContent:'center', marginTop:'45px', marginLeft:'30px', fontSize:'25px'}}>
                Time : <Timer_duel duelState={duelState} endDuel={setEndDuel}/>
                </div>
                </div>
        </>
        ) : (
        <div>Loading Duel...</div> // Loading state
        )}
        </div>
        );


};

export default Duel