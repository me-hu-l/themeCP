"use client"


import React, { useEffect, useState } from 'react'

const Timer_duel = ({duelState, endDuel}) => {

    const [timeLeft, setTimeLeft] = useState(0);
    
    const datetimeToMilliSeconds = (datetimeString) => {
        const date = new Date(datetimeString); // Parse the ISO string into a Date object
        return Math.floor(date.getTime()); // Convert milliseconds to seconds
    };


    useEffect(() => {
        const matchTimer = ()=>{
                const remainingTime= datetimeToMilliSeconds(duelState.end_time) - datetimeToMilliSeconds(duelState.server_time);
                if(remainingTime <= 0){
                        endDuel(true);
                        setTimeLeft(0);
                }else{
                        setTimeLeft(remainingTime);
                }
        }

        matchTimer();

        const updateTimer = () => {
            const currentTime = new Date().getTime();
            const remainingTime = datetimeToMilliSeconds(duelState.end_time) - currentTime;
            if (remainingTime <= 0) {
                endDuel(true);
                setTimeLeft(0);
            } else {
                setTimeLeft(remainingTime);
            }
        };

        const intervalId = setInterval(updateTimer, 1000);

        updateTimer();

        return () => clearInterval(intervalId);
    }, [duelState, endDuel]);

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <div>
            <p style={{fontSize:'25px', marginTop:'0px', marginLeft:'15px'}}>{timeLeft > 0 ? formatTime(timeLeft) : 'Time is up!'}</p>
        </div>
    )
}

export default Timer_duel