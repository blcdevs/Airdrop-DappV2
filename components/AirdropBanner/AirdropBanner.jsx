import React, { useState, useEffect } from "react";
import styles from "./AirdropBanner.module.css";
import { ethers } from "ethers";

const AirdropBanner = ({ airdropInfo }) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [tokenStats, setTokenStats] = useState({
    totalSupply: 200000000,
    remainingTokens: 0,
    claimedTokens: 0,
  });

  // Calculate progress when airdropInfo changes
  useEffect(() => {
    if (airdropInfo) {
      try {
        const remaining = Number(airdropInfo.remainingTokens);
        const total = tokenStats.totalSupply;
        const claimed = total - remaining;

        // Update token stats
        setTokenStats((prev) => ({
          ...prev,
          remainingTokens: remaining,
          claimedTokens: claimed,
        }));

        // Calculate and update percentage
        const percentage = total > 0 ? (claimed / total) * 100 : 0;
        const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
        setDisplayPercentage(Number(clampedPercentage.toFixed(2)));
      } catch (error) {
        console.error("Error updating progress:", error);
        setDisplayPercentage(0);
      }
    }
  }, [airdropInfo]);

  return (
    <div className={styles.banner}>
      <div className={styles.container}>
      <div className={styles.priceContainer}>
          <span className={styles.priceLabel}>Listing Price:</span>
          <span className={styles.priceValue}>$1</span>
        </div>
        
        <div className={styles.progressContainer}>
          {/* <div className={styles.progressLabels}>
            <span>Sale Raised</span>
            <span>Total Supply</span>
          </div>
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{ width: `${displayPercentage}%` }}
              >
                <div className={styles.progressLabel}>{displayPercentage}%</div>
              </div>
            </div>
            <div className={styles.progressValues}>
              <span>
                {Number(tokenStats.claimedTokens).toLocaleString()} Tokens
              </span>
              <span>
                {Number(tokenStats.totalSupply).toLocaleString()} Tokens
              </span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AirdropBanner;
