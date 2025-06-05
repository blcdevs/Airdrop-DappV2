import React, { useState, useEffect } from "react";
import styles from "./CountdownTimer.module.css";

const CountdownTimer = ({ airdropInfo, isLoading = false, hasError = false }) => {
  // Add a state to track if we're on the client side
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // First useEffect only to set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Second useEffect for the actual countdown logic
  useEffect(() => {
    // Only run this effect on the client side
    if (!isClient || !airdropInfo?.endTime) return;

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
  }, [airdropInfo, isClient]); // Added isClient as dependency

  // Pad numbers with leading zeros
  const padNumber = (num) => String(num).padStart(2, "0");

  // Skeleton loader component
  const SkeletonBox = () => (
    <div className={styles.counterBox}>
      <div className={styles.counterInner}>
        <div
          className={styles.counterValue}
          style={{
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
            height: '2em',
            width: '2em'
          }}
        />
        <div
          className={styles.counterLabel}
          style={{
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
            height: '1em',
            width: '4em',
            marginTop: '4px'
          }}
        />
      </div>
    </div>
  );

  // Error state component
  const ErrorBox = () => (
    <div className={styles.counterBox}>
      <div className={styles.counterInner}>
        <span className={styles.counterValue} style={{ color: '#ef4444' }}>--</span>
        <span className={styles.counterLabel} style={{ color: '#ef4444' }}>Error</span>
      </div>
    </div>
  );

  // Add shimmer animation styles
  const shimmerStyles = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;

  // Show loading state
  if (isLoading || (!isClient && !airdropInfo)) {
    return (
      <>
        <style>{shimmerStyles}</style>
        <div className={styles.timerContainer}>
          <SkeletonBox />
          <SkeletonBox />
          <SkeletonBox />
          <SkeletonBox />
        </div>
      </>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className={styles.timerContainer}>
        <ErrorBox />
        <ErrorBox />
        <ErrorBox />
        <ErrorBox />
      </div>
    );
  }

  // Only render the actual timer values on the client side
  // This prevents hydration errors by ensuring server and client render the same initial content
  return (
    <div className={styles.timerContainer}>
      <div className={styles.counterBox}>
        <div className={styles.counterInner}>
          <span className={styles.counterValue}>
            {isClient && airdropInfo ? padNumber(timeLeft.days) : "00"}
          </span>
          <span className={styles.counterLabel}>Days</span>
        </div>
      </div>

      <div className={styles.counterBox}>
        <div className={styles.counterInner}>
          <span className={styles.counterValue}>
            {isClient && airdropInfo ? padNumber(timeLeft.hours) : "00"}
          </span>
          <span className={styles.counterLabel}>Hours</span>
        </div>
      </div>

      <div className={styles.counterBox}>
        <div className={styles.counterInner}>
          <span className={styles.counterValue}>
            {isClient && airdropInfo ? padNumber(timeLeft.minutes) : "00"}
          </span>
          <span className={styles.counterLabel}>Minutes</span>
        </div>
      </div>

      <div className={styles.counterBox}>
        <div className={styles.counterInner}>
          <span className={styles.counterValue}>
            {isClient && airdropInfo ? padNumber(timeLeft.seconds) : "00"}
          </span>
          <span className={styles.counterLabel}>Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
