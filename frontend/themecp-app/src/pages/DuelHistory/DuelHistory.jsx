"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";


const DuelHistory = ({ id }) => {
  const [duels, setDuels] = useState([]);
  const [duelStates, setDuelStates] = useState([]);
  const [combined, setCombined] = useState([]);
  const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    if (!id) return;
    const fetchDuels = async () => {
      try {
        const res = await fetch(`${backend_url}/api/duels/${id}/history`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch duel history");
        const data = await res.json();
        setDuels(data);
      } catch (err) {
        setDuels([]);
      }
    };
    fetchDuels();
  }, [id]);

  const fetchDuelStates = async () => {
    try {
      const res = await fetch(`${backend_url}/api/duels/${id}/states`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch duel states");
      const data = await res.json();
      setDuelStates(data);
    } catch (err) {
      setDuelStates([]);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchDuelStates();

  }, [id]);

  useEffect(()=>{
        if(duels.length===0 || duelStates.length===0) return;
        const combined = duels.map((duel, i) => ({
            duel,
            duelState: duelStates[i] ?? null,
        }));
        setCombined(combined);
        // console.log("Combined Duel Data:", combined);
    }, [duels, duelStates]);



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

  if (!id) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Duel History</h2>
      {combined.length === 0 ? (
        <div className="text-gray-500">No duels found.</div>
      ) : (
        combined.map(({duel, duelState},index) => (
          <div
            key={duel.id}
            className="mb-10 border border-gray-300 rounded-lg shadow bg-white overflow-x-auto"
          >
            <div className="flex flex-col md:flex-row justify-between items-center px-4 py-2 bg-gray-100 border-b">
              <div>
                <span className="font-semibold">Duel #{combined.length - index}</span>
                <span className="ml-4 text-sm text-gray-500">{duel.created_at}</span>
              </div>
              <div className="text-sm text-gray-600">
                Topic: <span className="font-semibold">{duel.topic}</span> | Level:{" "}
                <span className="font-semibold">{duel.duel_level}</span>
              </div>
              <div className="text-sm text-gray-600">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    duel.status === "finished"
                      ? "text-green-600"
                      : duel.status === "active"
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {duel.status}
                </span>
              </div>
            </div>
            <table className="min-w-full table-auto border border-gray-300 text-sm text-center">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Participant</th>
                  {[1, 2, 3, 4].map((slot) => (
                    <th key={slot} className="border border-gray-300 px-4 py-2" style={{backgroundColor: getBackgroundColor(duel[`R${slot}`])}}>
                      <a
                        href={`https://codeforces.com/problemset/problem/${duel[`contestId${slot}`]}/${duel[`index${slot}`]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {`P${slot}`}
                      </a>
                      <br />
                      <span className="text-xs text-gray-500">/ {duel[`R${slot}`]}</span>
                    </th>
                  ))}
                  <th className="border border-gray-300 px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {[duel.creator, duel.opponent].map((participant, i) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      <Link
                        href={`/profile/${participant.id}`}
                        className="text-black-700 hover:underline"
                        >
                        {participant.codeforces_handle}
                        </Link>
                    </td>
                    {[1, 2, 3, 4].map((slot) => (
                      <td
                        key={slot}
                        className={`border border-gray-300 px-4 py-2 font-bold ${
                                (duelState.problems[participant.id]?.[slot - 1]?.score ?? 0) > 0
                                ? "text-green-600"
                                : ""
                                }`}
                        >
                        {(duelState.problems[participant.id]?.[slot - 1]?.score ?? 0) > 0 ? (
                                <a
                                href={`https://codeforces.com/problemset/submission/${duel[`contestId${slot}`]}/${duelState.problems[participant.id]?.[slot - 1]?.submission_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                >
                                {duelState.problems[participant.id]?.[slot - 1]?.score}
                                </a>
                                ) : (
                                duelState.problems[participant.id]?.[slot - 1]?.score ?? 0
                                )}
                        </td>
                    ))}
                    <td className="border border-gray-300 px-4 py-2 font-bold">
                      {([1, 2, 3, 4].reduce(
                        (sum, slot) =>
                          sum +
                          (duelState.problems[participant.id]?.[slot - 1]?.score ?? 0),
                        0
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end px-4 py-2 text-xs text-gray-400">
              Started: {duel.start_time} | Ended: {duel.end_time}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DuelHistory;