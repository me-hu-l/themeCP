"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext/ProfileContext';
import { useAuth } from '@/context/AuthContext';

interface SubNavbarProps {
  active: boolean[];
  id: string; 
}

const SubNavbar: React.FC<SubNavbarProps> = ({ active, id }) => {
  const router = useRouter();
  const { user_profile } = useProfile();
  const { isAuth } = useAuth();

  function goProfile() {
    router.push( `/profile/${id}`); // Navigate to the user's profile
  }
  function goContest() {
    router.push(`/contest_history/${id}`); // Navigate to the contest history
  }
  function goImportExport() {
    router.push(`/importExport/${id}`);
  }

  useEffect(() => {
    // This effect runs when the component mounts
    // You can add any initialization logic here if needed
    console.log('SubNavbar mounted with active states')
    // console.log('user_profile:', user_profile);
  },[])

  return (
    <div
      className="
        pl-[15px] ml-[30px] mt-[40px]
        text-black font-mono font-semibold text-[20px]
        max-[730px]:ml-[1px]
        max-[730px]:mt-[10px]
      "
    >
      <span
        onClick={goProfile}
        className={`
          px-[5px] mr-[10px] rounded-[5px] cursor-pointer transition duration-200 
          ${active[0]
            ? 'bg-gray-300 font-semibold max-[730px]:text-[15px]'
            : 'max-[730px]:text-[15px]'
          }
        `}
      >
        Profile
      </span>
      <span
        onClick={goContest}
        className={`
          px-[5px] mr-[10px] rounded-[5px] cursor-pointer transition duration-200
          ${active[1]
            ? 'bg-gray-300 font-semibold max-[730px]:text-[15px]'
            : 'max-[730px]:text-[15px]'
          }
        `}
      >
        Contest
      </span>
      <span
        onClick={() => router.push(`/duel_history/${id}`)}
        className={`
          px-[5px] mr-[10px] rounded-[5px] cursor-pointer transition duration-200
          ${active[2]
            ? 'bg-gray-300 font-semibold max-[730px]:text-[15px]'
            : 'max-[730px]:text-[15px]'
          }
        `}
      >
        Duel
      </span>
      <span
        onClick={goImportExport}
        className={`
          px-[5px] mr-[10px] rounded-[5px] cursor-pointer transition duration-200
          ${active[3]
            ? 'bg-gray-300 font-semibold max-[730px]:text-[15px]'
            : 'max-[730px]:text-[15px]'
          }
        `}
      >
        Import/Export
      </span>
      <span
        onClick={() => router.push(`/friends/${id}`)}
        className={`
          px-[5px] mr-[10px] rounded-[5px] cursor-pointer transition duration-200
          ${active[4]
            ? 'bg-gray-300 font-semibold max-[730px]:text-[15px]'
            : 'max-[730px]:text-[15px]'
          }
        `}
      >
        Friends
      </span>
      {
          isAuth && user_profile.id===Number(id) && (
            <span
              onClick={() => router.push(`/pending_requests/${id}`)}
              className={`
                px-[5px] mr-[10px] rounded-[5px] cursor-pointer transition duration-200
                ${active[5]
                  ? 'bg-gray-300 font-semibold max-[730px]:text-[15px]'
                  : 'max-[730px]:text-[15px]'
                }
              `}
            >
               Pending Requests
            </span>
          ) 
      }
    </div>
  );
};

export default SubNavbar;