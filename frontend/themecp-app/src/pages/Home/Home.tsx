"use client";

import { useRouter } from "next/navigation";
import styles from "./Home.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <div className={styles.wrapper}>
        <div className={styles.typingDemo}>
          Welcome to  <span style={{ color: "#392febff" }}>LevelUp</span>CP...
        </div>
        <div style={{ display: "flex" }}>
          <button
            onClick={() => router.push("/guide")}
            className={styles.getStartedButton}
          >
            Get Started
          </button>
        </div>
      </div>

      <div className={styles.descriptionBox}>
        <div className={styles.title}>
          What is LevelUpCP
        </div>
        <div className={styles.description}>
          LevelUpCP is an experimental training system wherein users train on a
          perpetual ladder for ratings ranging from 800 all the way till 3500.
          This system is based on two-hour, four-problem mashup contests,
          ideally to be done every day.
        </div>
      </div>

      <div className={styles.title2}>Why does it work?</div>
      <div className={styles.description2}>
        <ul>
          <li>
            LevelUpCP lets you train with problems in the entire difficulty range
            you have a shot at solving.
          </li>
          <li>
            This balances difficulty and skill and keeps you in the "flow state",
            simulating your experience in an actual contest!
          </li>
          <li>
            Your built-in strengths and weaknesses carry a ±200 differential on
            any given problem! Therefore, this system exposes you to problems in
            the entire range you could plausibly solve in a contest.
          </li>
          <li>
            LevelUpCP’s goal is to increase your chances of solving such
            “feasible” problems in-contest and to increase your speed in solving
            such problems.
          </li>
          <li>
            Furthermore, LevelUpCP’s high success rate, self-balancing at around
            50%, keeps your motivation high. Failures increase your success rate
            (literally), and successes prove your improvement!
          </li>
        </ul>
      </div>
    </div>
  );
}
