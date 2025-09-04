"use client";

import Image from "next/image";
import Link from "next/link";

export default function Guide() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <Image
          src="/demo/levelupcplogo.png"
          alt="LevelUpCP Logo"
          width={180}
          height={180}
          className="mx-auto mb-4"
          priority
        />
        <h1 className="text-4xl font-bold mb-2">LevelUpCP Guide</h1>
        <p className="text-gray-700">
          A Competitive Programming platform with level-based progression, virtual contests, and 1v1 challenges — inspired by{" "}
          <Link
            className="text-pink-600 underline"
            href="https://codeforces.com/blog/entry/136704"
            target="_blank"
          >
            ThemeCP
          </Link>.
        </p>
      </div>

      {/* Features */}
      <section className="space-y-4 mb-12">
        <h2 className="text-2xl font-semibold">🚀 Features</h2>
        <ul className="list-disc pl-6 text-gray-800 space-y-2">
          <li><b>Level-based Progression:</b> 109 levels to gradually improve problem-solving skills.</li>
          <li><b>Virtual Contests:</b> 4-problem contests with a 120-minute timer.</li>
          <li><b>Friends & 1v1 Challenges (Duels):</b> Compete with friends in real time.</li>
          <li><b>Performance Tracking:</b> Local rating, contest history, and deltas for every attempt.</li>
          <li><b>Tag-based Practice:</b> Choose mixed or focused topics (DP, Greedy, etc.).</li>
        </ul>
      </section>

      {/* Demo */}
      <section className="space-y-10">
        <h2 className="text-2xl font-semibold">🖼️ Demo</h2>

        {/* Profile */}
        <div className="bg-gray-50 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">👤 Profile Page</h3>
          <p className="text-gray-700 mb-4">
            Login with your Google account and add your Codeforces handle to personalize your experience.
          </p>
          <div className="flex justify-center">
            <Image
              src="/demo/Profile_demo.png"
              alt="Profile Demo"
              width={900}
              height={500}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* History */}
        <div className="bg-gray-50 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">📜 History</h3>
          <p className="text-gray-700 mb-4">
            Track your past <b>contests</b> and <b>1v1 duels</b> with detailed performance stats.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Image
              src="/demo/Contest_history.png"
              alt="Contest History"
              width={600}
              height={400}
              className="rounded-xl"
            />
            <Image
              src="/demo/Duel_history.png"
              alt="Duel History"
              width={600}
              height={400}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Create */}
        <div className="bg-gray-50 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">🎯 Create</h3>
          <p className="text-gray-700 mb-4">
            Host local contests and duels with friends — choose levels and topics (just like ThemeCP!).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Image
              src="/demo/Contest.png"
              alt="Create Contest"
              width={600}
              height={400}
              className="rounded-xl"
            />
            <Image
              src="/demo/CreateDuel.png"
              alt="Create Duel"
              width={600}
              height={400}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Compete (added) */}
        <div className="bg-gray-50 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">⚔️ Compete</h3>
          <p className="text-gray-700 mb-4">
            Solve theme-based contests progressively, or challenge your friends to a <b>1v1 duel</b>.
            Both participants’ Codeforces submissions are tracked in <b>real time</b> and scores update live.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Image
              src="/demo/StartContest.png"
              alt="Start Contest"
              width={600}
              height={400}
              className="rounded-xl"
            />
            <Image
              src="/demo/ActiveDuel.png"
              alt="Active Duel"
              width={600}
              height={400}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Friends (added) */}
        <div className="bg-gray-50 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">🤝 Friends</h3>
          <p className="text-gray-700 mb-4">
            Search for friends, view their profiles, add them, and challenge them to duels.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Image
              src="/demo/SearchFriend.png"
              alt="Search Friend"
              width={600}
              height={400}
              className="rounded-xl"
            />
            <Image
              src="/demo/AddFriend.png"
              alt="Add Friend"
              width={600}
              height={400}
              className="rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="space-y-4 mt-12">
        <h2 className="text-2xl font-semibold">🛠️ Tech Stack</h2>
        <ul className="list-disc pl-6 text-gray-800 space-y-2">
          <li><b>Frontend:</b> Next.js (React)</li>
          <li><b>Backend:</b> FastAPI (Python)</li>
          <li><b>Database:</b> PostgreSQL</li>
          <li><b>Auth:</b> JWT-based authentication</li>
          <li><b>Deployment:</b> Vercel (frontend) + Render (backend)</li>
        </ul>
      </section>
    </div>
  );
}
