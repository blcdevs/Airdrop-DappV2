import React, { useState, useEffect } from "react";
import styles from "./AirdropBanner.module.css";
import { ethers } from "ethers";

const AirdropBanner = ({ airdropInfo, isLoading = false, hasError = false }) => {
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

  // Skeleton loader for price
  const PriceSkeleton = () => (
    <div className={styles.priceContainer}>
      <span className={styles.priceLabel}>Listing Price:</span>
      <div
        style={{
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '4px',
          height: '1.5em',
          width: '3em',
          display: 'inline-block'
        }}
      />
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
  if (isLoading) {
    return (
      <>
        <style>{shimmerStyles}</style>
        <div className={styles.banner}>
          <div className={styles.container}>
            <PriceSkeleton />
            <div className={styles.progressContainer}>
              {/* Loading state for progress container */}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className={styles.banner}>
        <div className={styles.container}>
          <div className={styles.priceContainer}>
            <span className={styles.priceLabel}>Listing Price:</span>
            <span className={styles.priceValue} style={{ color: '#ef4444' }}>Error</span>
          </div>
          <div className={styles.progressContainer}>
            {/* Error state for progress container */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.banner}>
      <div className={styles.container}>
        <div className={styles.priceContainer}>
          <span className={styles.priceLabel}>Listing Price:</span>
          <span className={styles.priceValue}>$5</span>
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
