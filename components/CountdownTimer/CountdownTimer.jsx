import React, { useState, useEffect } from "react";
import styles from "./CountdownTimer.module.css";

const CountdownTimer = ({ airdropInfo }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!airdropInfo?.endTime) return;

    const calculateTimeLeft = () => {
      // Convert contract timestamp (seconds) to milliseconds
      const endTimeMs = Number(airdropInfo.endTime);
      const now = new Date().getTime();
      const difference = endTimeMs - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // If time is up, set all values to 0
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [airdropInfo]); // Add airdropInfo as dependency

  // Pad numbers with leading zeros
  const padNumber = (num) => String(num).padStart(2, "0");

  return (
    <div className={styles.timerContainer}>
      <div className={styles.counterBox}>
        <div className={styles.counterInner}>
          <span className={styles.counterValue}>
            {padNumber(timeLeft.days)}
          </span>
          <span className={styles.counterLabel}>Days</span>
        </div>
      </div>

      <div className={styles.counterBox}>
        <div className={styles.counterInner}>
          <span className={styles.counterValue}>
            {padNumber(timeLeft.hours)}
          </span>
          <span className={styles.counterLabel}>Hours</span>
        </div>
      </div>

      <div className={styles.counterBox}>
        <div className={styles.counterInner}>
          <span className={styles.counterValue}>
            {padNumber(timeLeft.minutes)}
          </span>
          <span className={styles.counterLabel}>Minutes</span>
        </div>
      </div>

      <div className={styles.counterBox}>
        <div className={styles.counterInner}>
          <span className={styles.counterValue}>
            {padNumber(timeLeft.seconds)}
          </span>
          <span className={styles.counterLabel}>Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
