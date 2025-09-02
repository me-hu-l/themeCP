"use client";

import React, { useEffect, useRef, useState } from 'react'
import { useProfile } from '@/context/ProfileContext/ProfileContext';


const AddHandle = ({id}) => {

    const { user_profile } = useProfile();
            const [handle, setHandle] = useState(null);
    const [problemLink, setLink] = useState(null);
    const [user, setUser] = useState(null);
    const [problem, setProblem] = useState(null);
    const [checking, setChecking] = useState(false);
    const [Loading, setLoading] = useState(false);

        const get_handle = useRef(null);

            const addHandle = async () => {
                if(user_profile.id !== Number(id)) {
                    console.log("User trying to add handle for another user:", user_profile.id, id);
                    alert('You cannot add handle for another user');
                    return;
                }
        let user_handle = await get_handle.current.value.trim();
        console.log(user_handle);
        setUser(() => user_handle);
        setLoading(() => true);
        let problem_api = await fetch('https://codeforces.com/api/problemset.problems');
        let submission = await fetch(`https://codeforces.com/api/user.status?handle=${user_handle}&count=1`);
        setLoading(() => false);
        problem_api = await problem_api.json();
        submission = await submission.json();
        let prob = null;
        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                // Generate a random index
                const j = Math.floor(Math.random() * (i + 1));
    
                // Swap elements at index i and j
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        shuffleArray(problem_api['result']['problems']);
        for (let i of problem_api['result']['problems']) {
            if (submission.result.length === 0 || (i['contestId'] !== submission['result'][0]['problem']['contestId']) && (i['index'] !== submission['result'][0]['problem']['index'])) {
                prob = i;
                setProblem(() => prob);
                break;
            }
        }
    }
    
    useEffect(() => {
        if (problem !== null) {
            setChecking(true);
            const url = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
            setLink(`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`);
            const check_user = async () => {
                const api = await fetch(`https://codeforces.com/api/user.status?handle=${user}&count=1`);
                const submission = await api.json();
                let flag = false;
                for (let i of submission['result']) {
                    if ((i['problem']['contestId'] === problem['contestId']) && (i['problem']['index'] === problem['index']) && (i['verdict'] === 'COMPILATION_ERROR')) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    const user_handle = await get_handle.current.value.trim();
                    setHandle(user_handle);
                }
                else {
                    alert('Handle Verification Failed. TRY AGAIN');
                    const frontend_url = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"; // Change this to your frontend URL
                    window.location.href = `${frontend_url}/profile/${id}`;
                }
                setChecking(false);
            };
            setTimeout(check_user, 60000);
        }
    }, [problem]);

    useEffect(() => {
        if (handle !== null) {
            const data = {};
            data.handle = handle;
            const addHandle = async () => {
                const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // Change this to your backend URL
                const res = await fetch(`${backend_url}/api/users/addHandle?handle=${handle}`, {
                        method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }).then((res) => res.json());
                //console.log(res);
                const frontend_url = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"; // Change this to your frontend URL
                if(res.status===400 || res.status===500 || res.status===403 || res.status===404) {
                        alert('couldnot add handle');
                        window.location.href = `${frontend_url}/profile/${id}`;
                }
                else if (res['message'] === 'handle already taken by another user') {
                    alert('Handle Already Exists');
                    window.location.href = `${frontend_url}/profile/${id}`;
                } else {
                    alert('successful');
                    window.location.href = `${frontend_url}/profile/${id}`;
                }
            }
            addHandle();
        }
    }, [handle]);

  return (
    <div>
        <input disabled={checking} type='text' className='handle-input' placeholder='Codeforces Handle...' ref={get_handle}></input>
        <button disabled={checking} onClick={addHandle} className='handle-button'>Add Handle</button>
        <div>{Loading ? 'Loading...' : (problemLink !== null ? <a href={problemLink} target='_blank'>CLICK HERE : Submit a COMPILATION_ERROR within 1 minute.<br></br> DO NOT REFRESH OR CHANGE THE PAGE</a> : '')}</div>
    </div>
  )
}

export default AddHandle;