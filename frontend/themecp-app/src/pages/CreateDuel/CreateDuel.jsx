'use client';
import React, { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
// import { useProfile } from '@context/ProfileContext/ProfileContext';
import { useProfile } from '@/context/ProfileContext/ProfileContext';
import { useLevel } from '@/context/LevelContext';
import Timer_10min from '@/components/Timer/Timer_10min';
import { createRoot } from 'react-dom/client';
import './CreateDuel.css';
// import { count } from 'console';

const CreateDuel = () => {
        const router = useRouter();
        const { level } = useLevel();
        const [duelCreated, setDuelCreated] = useState(false);
        const [createdDuelId, setCreatedDuelId] = useState(null);
        const [problemArray, setArray] = useState(['Problem 1', 'Problem 2', 'Problem 3', 'Problem 4']);
        const [selectTag, setSelectTag] = useState('mixed');
        const [selectFriend, setSelectFriend] = useState(null);
        const tags = ['mixed', 'random', 'greedy', 'brute force', 'math', 'strings', 'constructive algorithms','dp', 'graphs', 'binary search', 'bitmasks', 'data structures', 'implementation', 'trees', 'number theory', 'combinatorics', 'shortest paths', 'probabilities', 'sortings'];
        const [friendsList, setFriendsList] = useState([]);
        const { user_profile } = useProfile();
        const [isFriendsDropdownOpen, setIsFriendsDropdownOpen] = useState(false);
        const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
        const [Loading, setLoading] = useState(false);
        const [countDown, setCountDown] = useState(false);
        const [endCountDown, setEndCountDown] = useState(false);
        const [timerStartTime, setTimerStartTime] = useState(null)
        const [duelDuration, setDuelDuration] = useState(10);
        const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';


        const problemLevel = useRef(null);
        const divVal = [useRef(null), useRef(null), useRef(null), useRef(null)];

        const timer_data = useRef(null);


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

        useEffect(() => {
                const pollActiveDuel = async () => {
                try {
                        const response = await fetch(`${backend_url}/api/duels/active`, {
                        credentials: 'include',
                        });
                        if (!response.ok) return;

                        const activeDuel = await response.json();

                        if (activeDuel && activeDuel.id) {
                                alert('You have an active duel! Redirecting to the duel page.');
                                router.push(`/duel/${activeDuel.id}`);
                        }
                } catch (err) {
                        console.error('Error polling active duel:', err.message);
                }
                };

        // Start polling every 5 seconds  
        pollActiveDuel(); // Initial check
        const interval = setInterval(() => {
        pollActiveDuel();
        }, 5000);
        // Cleanup on unmount
        return () => clearInterval(interval);
        }, [router]);



        useEffect(() => {
                const fetchFriends = async () => {
                        try {
                                const response = await fetch(`${backend_url}/api/friends/list/${user_profile.id}`, {
                                        method: 'GET',
                                        credentials: 'include',
                                });
                                if (!response.ok) {
                                        throw new Error('Network response was not ok');
                                }
                                const data = await response.json();
                                setFriendsList(data);
                        } catch (error) {
                                console.error('Error fetching friends list:', error);
                        }
                };
                fetchFriends();
        }, [user_profile]);


        const handleTagSelect = (tag) => {
                setSelectTag(() => tag);
                setIsTagDropdownOpen(false);
                }

        const handleFriendSelect = (friend) => {
                setSelectFriend(() => friend);
                setIsFriendsDropdownOpen(false);
                }


        const createDuel = async () => {
                if (!selectFriend) {
                        alert('Please select a friend to duel with.');
                        return;
                }
                if (!selectTag) {
                        alert('Please select a theme for the duel.');
                        return;
                }
                if (problemArray[0] === 'Problem 1') {
                        alert('Please Select Contest Level');
                        return;
                }
                setLoading(true);
                try {
                        let opponent_id = 1;
                        friendsList.forEach((friend) => {
                                if (friend.codeforces_handle === selectFriend) {
                                        opponent_id = friend.id;
                                }
                        });
                        const response = await fetch(`${backend_url}/api/duels`, {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                        opponent_id: Number(opponent_id),
                                        topic: selectTag,
                                        duel_level: problemLevel.current.value,
                                        // level: problemLevel.current.value,
                                }),
                        });
                        const data = await response.json();
                        if (response.ok) {
                                setDuelCreated(true);
                                setLoading(false);
                                setCountDown(true);
                                setCreatedDuelId(data.duel_id);
                                setTimerStartTime(new Date().getTime())
                                // timer_data.current.innerText = 'Duel invite sent! Waiting for acceptance...';
                                // Redirect to the duel page after creation
                                // router.push(`/duel/${data.duel_id}`);
                        } else {
                                setLoading(false);
                                alert(data.detail || 'Failed to create duel. Please try again.');
                        }
                } catch (error) {
                        setLoading(false);
                        console.error('Error creating duel:', error);
                        alert('An error occurred while creating the duel. Please try again.');
                }
        };


        const cancelDuel = async () => {
                setLoading(true);
                try {
                        const response = await fetch(`${backend_url}/api/duels/${createdDuelId}/cancel`, {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                        });
                        const data = await response.json();
                        if (response.ok) {
                                setDuelCreated(false);
                                setLoading(false);
                                setCountDown(false);
                                setCreatedDuelId(null);
                                alert('Duel invite canceled successfully.');
                        } else {
                                setLoading(false);
                                alert(data.detail || 'Failed to cancel duel. Please try again.');
                        }
                } catch (error) {
                        setLoading(false);
                        console.error('Error canceling duel:', error);
                        alert('An error occurred while canceling the duel. Please try again.');
                }
        };

        const handleChange = () => {
                const data = problemLevel.current.value;

                const item = level[data];

                if (item) {
                setArray([item["P1 rating"], item["P2 rating"], item["P3 rating"], item["P4 rating"]]);
                setDuelDuration(item.Duration);
                } else {
                setArray(['Problem 1', 'Problem 2', 'Problem 3', 'Problem 4']);
                }
        } 


        const check = async  () =>{
                if(endCountDown){
                        alert('Duel expired')
                        router.push('/')
                }
                if(countDown && !endCountDown){
                        if (timer_data.current) {
                                timer_data.current.innerHTML = ''; // Clear the existing content
                        }
                        // Use createRoot to render Timer_2min
                        const root = createRoot(timer_data.current); // createRoot on the target container
                        root.render(<Timer_10min setEndCountDown={setEndCountDown} timerStartTime={timerStartTime} />);
                }
        }       
        
        useEffect(()=>{
                check()
        },[duelCreated, countDown, endCountDown])

        return (
    <center>
      <div className='main-container'>
        <button disabled={duelCreated}  className="dropdown-btn" onClick={() => setIsFriendsDropdownOpen(!isFriendsDropdownOpen)}>
          {selectFriend ? `Friend : ${selectFriend}` : 'select friend'}
        </button>

        {isFriendsDropdownOpen && (
        <div className="dropdown-menu">
            <ul>
              {friendsList.map((friend) => (
                <li key={friend.codeforces_handle}>
                  <label>
                    <input
                      type="radio" // Use radio buttons to allow only one selection
                      checked={selectFriend === friend.codeforces_handle} // Check if the tag is selected
                      onChange={() => handleFriendSelect(friend.codeforces_handle)} // Select the tag when clicked
                    />
                    {friend.codeforces_handle}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className='input-container'>
          <label>Enter Duel Level : </label>
          <input disabled={duelCreated} maxLength={3} 
          onChange={handleChange} 
          ref={problemLevel}
          type="text" className='level-input' placeholder='Ex : 23..'></input>
        </div>
        <button disabled={duelCreated}  className="dropdown-btn" onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}>
          {selectTag ? `Theme : ${selectTag}` : 'empty'}
        </button>
        {isTagDropdownOpen && (
        <div className="dropdown-menu">
            <ul>
              {tags.map((tag) => (
                <li key={tag}>
                  <label>
                    <input
                      type="radio" // Use radio buttons to allow only one selection
                      checked={selectTag === tag} // Check if the tag is selected
                      onChange={() => handleTagSelect(tag)} // Select the tag when clicked
                    />
                    {tag}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}


        <div className='problem-container'>
          <div className='rating-label'>Problem Rating : </div>
          {problemArray.map((problem, index) => (
            <div key={index} ref={divVal[index]} className='problem-box' style={{ backgroundColor: getBackgroundColor(problemArray[index])}}>
              {problemArray[index]}
            </div>
          ))}
        </div>
        {/* {themecp_created ? <>
          <div className='link-container'>
            <div className='rating-label'>Problem Content:</div>
            <div className='link-box' onClick={() => toproblem(1)} style={{ backgroundColor: getBackgroundColor(problemArray[0])}}>
              {foundproblem[0] ? '' : '⚠️'}Problem 1
            </div>
            <div className='link-box' onClick={() => toproblem(2)} style={{ backgroundColor: getBackgroundColor(problemArray[1])}}>
              {foundproblem[1] ? '' : '⚠️'}Problem 2
            </div>
            <div className='link-box' onClick={() => toproblem(3)} style={{ backgroundColor: getBackgroundColor(problemArray[2])}}>
              {foundproblem[2] ? '' : '⚠️'}Problem 3
            </div>
            <div className='link-box' onClick={() => toproblem(4)} style={{ backgroundColor: getBackgroundColor(problemArray[3])}}>
              {foundproblem[3] ? '' : '⚠️'}Problem 4
            </div>
          </div>
          <div className='reroll-container'>
            <div className='rating-label'>ReRoll Problem :</div>
            <div className='reroll-box' onClick={() => reroll(1)} style={{ backgroundColor: getBackgroundColor(problemArray[0])}}>
              reroll 1
            </div>
            <div className='reroll-box' onClick={() => reroll(2)} style={{ backgroundColor: getBackgroundColor(problemArray[1])}}>
              reroll 2
            </div>
            <div className='reroll-box' onClick={() => reroll(3)} style={{ backgroundColor: getBackgroundColor(problemArray[2])}}>
              reroll 3
            </div>
            <div className='reroll-box' onClick={() => reroll(4)} style={{ backgroundColor: getBackgroundColor(problemArray[3])}}>
              reroll 4
            </div>
          </div>
          <div className='reroll-container'>
            <div className='rating-label'>Custom Problem :</div>
            <div className='reroll-box' onClick={() => custom(1)} style={{ backgroundColor: getBackgroundColor(problemArray[0])}}>
              Custom 1
            </div>
            <div className='reroll-box' onClick={() => custom(2)} style={{ backgroundColor: getBackgroundColor(problemArray[1])}}>
              Custom 2
            </div>
            <div className='reroll-box' onClick={() => custom(3)} style={{ backgroundColor: getBackgroundColor(problemArray[2])}}>
              Custom 3
            </div>
            <div className='reroll-box' onClick={() => custom(4)} style={{ backgroundColor: getBackgroundColor(problemArray[3])}}>
              Custom 4
            </div>
          </div>
          </> 
          : <></>} */}
        
        {/* <div style={{marginTop: '50px'}}>Contest Duration : {contest_duration} min</div> */}
        {duelCreated ? 
        (
        <><div className='twoMin-container' ref={timer_data}>{Loading ? 'Loading...' : 'Duel expires after 10 minutes of invitation being sent and not accepted'}    
        </div>
        <button onClick={cancelDuel} className='themecp-button' style={{marginLeft:'20px'}}>Cancel Duel Invite</button>
        {/* <div className='button-container'>
          <button disabled={countDown} onClick={handleClick} className='start-button'>Create Duel and Send Duel Invite</button>
        </div> */}
        </>
        )
         : (<>{Loading ? <div className='generating-message'>Generating Duel...</div> : <div className='button-container'> <button onClick={createDuel} className='themecp-button'>Create Duel</button> </div>}</>)}
        
      </div>
    </center>
  )
}

export default CreateDuel;
        