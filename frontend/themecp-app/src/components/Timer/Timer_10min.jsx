import React, { useEffect, useState } from 'react'

const Timer_10min = ({setEndCountDown, timerStartTime}) => {

    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {

        const updateTimer = () => {
            const currentTime = new Date().getTime();
            const endTime = timerStartTime + 10*60*1000
            const remainingTime = endTime - currentTime;
            if (remainingTime <= 0) {
                clearInterval(intervalId);
                setEndCountDown(true);
                setTimeLeft(0);
            } else {
                setTimeLeft(remainingTime);
            }
        };

        const intervalId = setInterval(updateTimer, 1000);

        updateTimer();

        return () => clearInterval(intervalId);
    }, []);

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

  return (
    <div style={{display:'flex', justifyContent: 'center'}}>
      <div>Duel Expires in : </div>
      <div style={{marginLeft: '10px'}}>{timeLeft > 0 ? formatTime(timeLeft) : 'Time is up'}</div>
    </div>
  )
}

export default Timer_10min