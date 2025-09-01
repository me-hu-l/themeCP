"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./Home.module.css";
import discord from "../../../public/discord.jpg"; // put your discord.jpg in public/
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  // useEffect(() => {
  //   console.log("Home component mounted");
  // }, []);
    // Scroll to the top of the page when the component mounts

  return (
    <div>
      <div className={styles.wrapper}>
        <div className={styles.typingDemo}>
          Welcome to Theme<span className={styles.makeRed}>CP</span>...
        </div>
        <div style={{ display: "flex" }}>
          <button
            onClick={() => router.push("/guide")}
            className={styles.getStartedButton}
          >
            Get Started
          </button>
          <button
            onClick={() =>
              window.open("https://discord.gg/ncnut8Zw63", "_blank")
            }
            className={styles.discordButton}
          >
            <Image
              src={discord}
              alt="Discord"
              width={32}
              height={32}
              style={{
                borderRadius: "40px",
                marginRight: "5px",
                border: "none",
              }}
            />
            Discord
          </button>
        </div>
      </div>

      <div className={styles.descriptionBox}>
        <div className={styles.title}>
          What is Theme<span className={styles.makeRed}>CP</span>?
        </div>
        <div className={styles.description}>
          ThemeCP is an experimental training system wherein users train on a
          perpetual ladder for rating ranging from 800 all the way till 3500.
          This system is based on two-hour, four-problem mashups contest, ideally
          to be done every day.
        </div>
      </div>

      <div className={styles.title2}>Why does it work?</div>
      <div className={styles.description2}>
        <ul>
          <li>
            ThemeCP lets you train with problems in the entire difficulty range
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
            ThemeCP’s goal is to increase your chances of solving such “feasible”
            problems in-contest and to increase your speed in solving such
            problems.
          </li>
          <li>
            Furthermore, ThemeCP’s high success rate, self-balancing at around
            50%, keeps your motivation high. Failures increase your success rate
            (literally), and successes prove your improvement!
          </li>
        </ul>
      </div>
    </div>
  );
}
