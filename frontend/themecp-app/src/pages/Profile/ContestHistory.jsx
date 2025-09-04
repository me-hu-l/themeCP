'use client'

import React, { useState, useEffect, useContext } from 'react'
import './ContestHistory.css'
// import { UserContestHistory } from '../../context/ProfileContext/ContestHistoryContext';
import axios from "axios";

const ContestHistory = ({id}) => {

  const [user_contest, setContestHistory] = useState([]);
  const [user_profile, setUserProfile] = useState(null);
  const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // Fallback to local URL if env variable is not set
  // const contest_history = useContext(UserContestHistory);
  // useEffect(() => {
  //     setContestHistory(() => contest_history.user_contest);
  // }, [contest_history]);

  useEffect(() => {
    console.log("ContestHistory component mounted");
    const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // Fallback to local URL if env variable is not set
    // console.log("Backend URL:", backend_url);
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
    }, [id]);


    useEffect(()=>{
      axios.get(`${backend_url}/api/users/profile/${id}`, {
          withCredentials: true
      }).then((res) => setUserProfile(res.data))
        .catch((error) => {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
        });
    }, [id, backend_url]);

  useEffect(() => {
    // Any additional effects can be added here
    if(user_contest === null || user_profile === null) return;
    if(user_profile.codeforces_handle === null || user_profile.codeforces_handle === undefined || user_profile.codeforces_handle === "") return;

    const upsolve = async(contest_id, slot)=>{
      try{
        const response = await fetch(`${backend_url}/api/contests/upsolve/${contest_id}?slot=${slot}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        const data = await response.json();
        if(!response.ok){
          console.error("Error fetching upsolve status:", data);
        }
      } catch (error) {
        console.error("Error checking upsolve status:", error);
      }
    }
    const check_upsolve= async()=>{
      try {
        const response = await fetch(`https://codeforces.com/api/user.status?handle=${user_profile.codeforces_handle}&from=1&count=20`, { 
          method: 'GET',
          
        });
        const data = await response.json();
        if(!response.ok){
          console.error("Error fetching upsolve status:", data);
        }
        if(data.status !== "OK"){
          console.error("Error fetching upsolve status:", data);
        }
        const submissions = data.result;
        let solved_problems = new Set();
        submissions.forEach(submission => {
          if (submission.verdict === "OK") {
            // console.log("Solved problem:", submission.problem);
            solved_problems.add(`${submission.problem.contestId}-${submission.problem.index}`);
          }
        });
        let latest_contest = user_contest[0];
        // console.log(solved_problems);

        [1, 2, 3, 4].map((problemIndex) => {
          if (latest_contest[`T${problemIndex}`]===null && solved_problems.has(`${latest_contest[`contestId${problemIndex}`]}-${latest_contest[`index${problemIndex}`]}`)) {
            // Problem is solved in this contest
            upsolve(latest_contest.id, problemIndex);
          }
        });
      // Handle the response as needed
    } catch (error) {
      console.error("Error checking upsolve status:", error);
    }
  }

  check_upsolve()

  }, [user_contest, user_profile])

  function getDeltaColor(data) {
    if (data === 0)
      return 'black';
    else if (data > 0)
      return 'green';
    else
      return 'red';
  }
  function getSign(data) {
    if (data > 0)
      return '+';
  }
  function getSolvedColor(data) {
    if (data === null) {
      return '#FFE3E3';
    } else if (Number(data) === -1) {
      return '#FFCC88'
    } 
    else {
      return '#D4EDC9';
    }
  }

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
  const getPerformanceColor = (data) => {
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
  <div className="w-full max-w-[1400px] mt-10 mx-auto">
    <h2 className="text-3xl font-bold mb-4">Contest History</h2>
    <div className="overflow-x-auto rounded-xl border border-black">
      <div className="grid grid-cols-15 bg-gray-100 font-semibold text-center text-base border-b border-black">
        <div className="py-3 border-r border-black">ID</div>
        <div className="py-3 border-r border-black">Date</div>
        <div className="py-3 border-r border-black">Topic</div>
        <div className="py-3 border-r border-black">Level</div>
        <div className="py-3 border-r border-black">R1</div>
        <div className="py-3 border-r border-black">R2</div>
        <div className="py-3 border-r border-black">R3</div>
        <div className="py-3 border-r border-black">R4</div>
        <div className="py-3 border-r border-black">T1</div>
        <div className="py-3 border-r border-black">T2</div>
        <div className="py-3 border-r border-black">T3</div>
        <div className="py-3 border-r border-black">T4</div>
        <div className="py-3 border-r border-black">Perf</div>
        <div className="py-3 border-r border-black">Rating</div>
        <div className="py-3">Δ</div>
      </div>
      {user_contest.map((item, index) => (
        <div
          className="grid grid-cols-15 text-center text-sm border-b border-black last:border-b-0"
          key={index}
        >
          <div className="py-2 border-r border-black">{item.contest_no}</div>
          <div className="py-2 border-r border-black whitespace-nowrap">{item.date}</div>
          <div className="py-2 border-r border-black whitespace-nowrap">{item.topic}</div>
          <div className="py-2 border-r border-black">{item.contest_level}</div>
          <div
            className="py-2 border-r border-black font-bold underline"
            style={{ backgroundColor: getBackgroundColor(item.R1) }}
          >
            <a
              href={`https://codeforces.com/problemset/problem/${item.contestId1}/${item.index1}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 underline"
            >
              {item.R1}
            </a>
          </div>
          <div
            className="py-2 border-r border-black font-bold underline"
            style={{ backgroundColor: getBackgroundColor(item.R2) }}
          >
            <a
              href={`https://codeforces.com/problemset/problem/${item.contestId2}/${item.index2}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 underline"
            >
              {item.R2}
            </a>
          </div>
          <div
            className="py-2 border-r border-black font-bold underline"
            style={{ backgroundColor: getBackgroundColor(item.R3) }}
          >
            <a
              href={`https://codeforces.com/problemset/problem/${item.contestId3}/${item.index3}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 underline"
            >
              {item.R3}
            </a>
          </div>
          <div
            className="py-2 border-r border-black font-bold underline"
            style={{ backgroundColor: getBackgroundColor(item.R4) }}
          >
            <a
              href={`https://codeforces.com/problemset/problem/${item.contestId4}/${item.index4}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 underline"
            >
              {item.R4}
            </a>
          </div>
          <div
            className="py-2 border-r border-black"
            style={{ backgroundColor: getSolvedColor(item.T1) }}
          >
            {item.T1 === null ? 'null' : Number(item.T1) === -1 ? '*' : item.T1}
          </div>
          <div
            className="py-2 border-r border-black"
            style={{ backgroundColor: getSolvedColor(item.T2) }}
          >
            {item.T2 === null ? 'null' : Number(item.T2) === -1 ? '*' : item.T2}
          </div>
          <div
            className="py-2 border-r border-black"
            style={{ backgroundColor: getSolvedColor(item.T3) }}
          >
            {item.T3 === null ? 'null' : Number(item.T3) === -1 ? '*' : item.T3}
          </div>
          <div
            className="py-2 border-r border-black"
            style={{ backgroundColor: getSolvedColor(item.T4) }}
          >
            {item.T4 === null ? 'null' : Number(item.T4) === -1 ? '*' : item.T4}
          </div>
          <div
            className="py-2 border-r border-black font-bold"
            style={{ color: getPerformanceColor(item.performance) }}
          >
            ~{item.performance}
          </div>
          <div className="py-2 border-r border-black">{item.rating}</div>
          <div
            className="py-2 font-bold"
            style={{ color: getDeltaColor(item.delta) }}
          >
            {getSign(item.delta)}{item.delta}
          </div>
        </div>
      ))}
    </div>
  </div>
);

  return (
    <div className='contest-history-container'>
      Contest History
      <div className='contest-history-table'>
        <div style={{alignItems:'center', height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>ID</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Date</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Topic</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Level</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>R1</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>R2</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>R3</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>R4</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>T1</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>T2</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>T3</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>T4</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Perf</div>
        <div style={{alignItems:'center',height:'35px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>Rating</div>
        <div style={{alignItems:'center',height:'35px',display:'flex', justifyContent:'center'}}>Δ</div>  
      </div>

        { 
          user_contest.map((item, index) => (
            <div className='contest-history-table-data' key={index}>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>{item.contest_no }</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.date}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', overflowX: 'auto', whiteSpace: 'nowrap'}}>{item.topic}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>{item.contest_level}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getBackgroundColor(item.R1)}}><a href={`https://codeforces.com/problemset/problem/${item.contestId1}/${item.index1}`} target='_blank'>{item.R1}</a></div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getBackgroundColor(item.R2)}}><a href={`https://codeforces.com/problemset/problem/${item.contestId2}/${item.index2}`} target='_blank'>{item.R2}</a></div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getBackgroundColor(item.R3)}}><a href={`https://codeforces.com/problemset/problem/${item.contestId3}/${item.index3}`} target='_blank'>{item.R3}</a></div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getBackgroundColor(item.R4)}}><a href={`https://codeforces.com/problemset/problem/${item.contestId4}/${item.index4}`} target='_blank'>{item.R4}</a></div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getSolvedColor(item.T1)}}>{item.T1 === null ? 'null' : (Number(item.T1) === -1 ? '*' : item.T1)}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getSolvedColor(item.T2)}}>{item.T2 === null ? 'null' : (Number(item.T2) === -1 ? '*' : item.T2)}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getSolvedColor(item.T3)}}>{item.T3 === null ? 'null' : (Number(item.T3) === -1 ? '*' : item.T3)}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', backgroundColor: getSolvedColor(item.T4)}}>{item.T4 === null ? 'null' : (Number(item.T4) === -1 ? '*' : item.T4)}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center', color: getPerformanceColor(item.performance), fontWeight: 'bold'}}>~{item.performance}</div>
              <div style={{alignItems:'center', height: '30px',borderRight: '2px solid black', display:'flex', justifyContent:'center'}}>{item.rating}</div>
              <div style={{fontWeight:'bold', alignItems:'center', height: '30px',display:'flex', justifyContent:'center', color: getDeltaColor(item.delta)}}>{getSign(item.delta)}{item.delta}</div>
            </div>
          ))
        }
      
    </div>
  )
}

export default ContestHistory