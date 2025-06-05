import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import styles from "./UserDashboard.module.css";
import { useWeb3 } from "../../context/Web3Context";
import {
  Skeleton,
  HeaderSkeleton,
  StatsSkeleton,
  CardSkeleton,
  ButtonSkeleton
} from "../SkeletonLoader/SkeletonLoader";

const UserDashboard = ({
  activeUser,
  airdropInfo,
  handleParticipateWithoutReferral,
  dataLoading = false,
  dataError = null,
  onRetry
}) => {
  const { account, contract } = useWeb3();
  const [referralLink, setReferralLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [nextClaimTime, setNextClaimTime] = useState(0);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (account && typeof window !== 'undefined') {
      // Generate referral link using query parameters
      const baseUrl = window.location.origin;
      const referralLinkWithQuery = `${baseUrl}?ref=${account}`;

      setReferralLink(referralLinkWithQuery);
      console.log("Generated referral link:", referralLinkWithQuery);
    }
  }, [account]);

  useEffect(() => {
    const checkClaimStatus = async () => {
      if (contract && account) {
        const nextTime = await contract.getNextClaimTime(account);
        setNextClaimTime(Number(nextTime));
        setCanClaim(Date.now() / 1000 >= Number(nextTime));
      }
    };

    checkClaimStatus();
    const interval = setInterval(checkClaimStatus, 1000);
    return () => clearInterval(interval);
  }, [contract, account]);

  const formatTimeLeft = (nextClaimTime) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = nextClaimTime - now;
    if (diff <= 0) return "Ready to claim";
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };



  return (
    <div className={styles.dashboardContainer}>
      {/* Show error banner if there's an error */}
      {dataError && (
        <div className={styles.errorBanner}>
          <div className={styles.errorContent}>
            <i className="fas fa-exclamation-triangle"></i>
            <span>Failed to load some data due to poor network. </span>
            <button onClick={onRetry} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      {dataLoading ? (
        <HeaderSkeleton />
      ) : (
        <div className={styles.dashboardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerMain}>
              <h1>User Dashboard</h1>
              <p className={styles.walletAddress}>
                <i className="fas fa-wallet"></i> <span>{shortenAddress(account)}</span>
              </p>
            </div>
            <div className={styles.headerStats}>
              <div className={styles.headerStat}>
                <span className={styles.statLabel}>Total Earned</span>
                <span className={styles.statValue}>
                  {`${activeUser?.totalEarned || "0"} ${airdropInfo?.tokenSymbol || "TNTC"}`}
                </span>
              </div>
              <div className={styles.headerStat}>
                <span className={styles.statLabel}>Task Points</span>
                <span className={styles.statValue}>
                  {ethers.utils.formatUnits(activeUser?.userPoints || "0", 18)}
                </span>
              </div>
              <div className={styles.headerStat}>
                <span className={styles.statLabel}>Referrals</span>
                <span className={styles.statValue}>
                  {activeUser?.referralCount || "0"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className={styles.dashboardContent}>
        {/* Claim Card */}
        {dataLoading ? (
          <CardSkeleton />
        ) : (
          <div className={styles.claimCard}>
            <div className={styles.claimContent}>
              <div className={styles.claimInfo}>
                <h2>Airdrop Claim</h2>
                <p className={styles.claimDescription}>
                  {`Claim your airdrop rewards and earn ${airdropInfo?.airdropAmount || "0"} ${airdropInfo?.tokenSymbol || "TNTC"}`}
                </p>
                <div className={styles.nextClaimInfo}>
                  {canClaim ? (
                    <span className={styles.readyToClaim}>Ready to claim now!</span>
                  ) : (
                    <span className={styles.nextClaim}>Next claim available in: <span>{formatTimeLeft(nextClaimTime)}</span></span>
                  )}
                </div>
              </div>
              <div className={styles.claimAction}>
                <button
                  onClick={handleParticipateWithoutReferral}
                  className={`${styles.claimButton} ${!canClaim ? styles.disabled : ''}`}
                  disabled={!canClaim}
                >
                  <i className="fas fa-gift"></i>
                  {canClaim ? "Claim Airdrop" : "Wait for next claim"}
                </button>
              </div>
            </div>
            <div className={styles.claimProgress}>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBackground}></div>
                <div
                  className={styles.progressFill}
                  style={{ width: canClaim ? '100%' : `${((Date.now() / 1000 - (nextClaimTime - 24 * 3600)) / (24 * 3600)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview Section */}
        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>
            <i className="fas fa-chart-pie"></i> Overview
          </h2>
          {dataLoading ? (
            <StatsSkeleton />
          ) : (
            <div className={styles.statsGrid}>
              {/* Total Earned Card */}
              <div className={styles.statCard}>
                <div className={styles.cardIcon}>
                  <i className="fas fa-coins"></i>
                </div>
                <div className={styles.cardContent}>
                  <h3>Total Earned</h3>
                  <p className={styles.tokenAmount}>
                    {`${activeUser?.totalEarned || "0"} ${airdropInfo?.tokenSymbol || "TNTC"}`}
                  </p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.cardIcon}>
                  <i className="fas fa-hand-holding-usd"></i>
                </div>
                <div className={styles.cardContent}>
                  <h3>From Claims</h3>
                  <p className={styles.tokenAmount}>
                    {`${Number(activeUser?.claimCount || 0) * Number(airdropInfo?.airdropAmount || 0)} ${airdropInfo?.tokenSymbol || "TNTC"}`}
                  </p>
                </div>
              </div>

              {/* Referral Count Card */}
              <div className={styles.statCard}>
                <div className={styles.cardIcon}>
                  <i className="fas fa-users"></i>
                </div>
                <div className={styles.cardContent}>
                  <h3>Referral Earnings</h3>
                  <p className={styles.referralCount}>
                    {`${Number(activeUser?.referralCount || 0) * Number(airdropInfo?.referralBonus || 0)} ${airdropInfo?.tokenSymbol || "TNTC"}`}
                  </p>
                  <span className={styles.subLabel}>
                    {`${activeUser?.referralCount || "0"} referrals`}
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.cardIcon}>
                  <i className="fas fa-tasks"></i>
                </div>
                <div className={styles.cardContent}>
                  <h3>Task Points</h3>
                  <p className={styles.tokenAmount}>
                    {ethers.utils.formatUnits(activeUser?.userPoints || "0", 18)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Information Section */}
        <div className={styles.detailsSection}>
          <h2 className={styles.sectionTitle}>
            <i className="fas fa-info-circle"></i> Details
          </h2>
          <div className={styles.detailsGrid}>
            {/* Referral Information */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <h3><i className="fas fa-link"></i> Your Referral Link</h3>
              </div>
              <div className={styles.referralDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Referral Status</span>
                  <span 
                    className={`${styles.value} ${styles.referrerValue}`}
                    data-has-referrals={activeUser?.referralCount > 0 ? "true" : "false"}
                    data-is-referred={activeUser?.referrer && activeUser.referrer !== "0x0000000000000000000000000000000000000000" ? "true" : "false"}
                  >
                    {activeUser?.referrer && activeUser.referrer !== "0x0000000000000000000000000000000000000000" 
                      ? `Referred by: ${shortenAddress(activeUser.referrer)}` 
                      : activeUser?.referralCount > 0 
                        ? `You referred ${activeUser.referralCount} users` 
                        : "No referrals yet"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Share your link</span>
                  <div className={styles.referralLinkContainer}>
                    <input 
                      type="text" 
                      readOnly 
                      value={referralLink}
                      className={styles.referralLink}
                    />
                    <button 
                      className={`${styles.copyButton} ${copySuccess ? styles.copySuccess : ''}`}
                      onClick={copyToClipboard}
                    >
                      <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className={styles.referralNote}>
                  <i className="fas fa-info-circle"></i>
                  <span>Share this link with friends to earn {airdropInfo?.referralBonus} {airdropInfo?.tokenSymbol} for each referral</span>
                </div>
              </div>
            </div>

            {/* Airdrop Details */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <h3><i className="fas fa-parachute-box"></i> Airdrop Details</h3>
              </div>
              <div className={styles.airdropDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Base Reward</span>
                  <span className={styles.value}>
                    <span className={styles.tokenBadge}>
                      <i className="fas fa-gift"></i> {airdropInfo?.airdropAmount} {airdropInfo?.tokenSymbol}
                    </span>
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Referral Bonus</span>
                  <span className={styles.value}>
                    <span className={styles.tokenBadge}>
                      <i className="fas fa-user-plus"></i> {airdropInfo?.referralBonus} {airdropInfo?.tokenSymbol}
                    </span>
                  </span>
                </div>

                {/* <div className={styles.detailRow}>
                  <span className={styles.label}>Claim Fee</span>
                  <span className={styles.value}>
                    <span className={styles.tokenBadge}>
                      <i className="fas fa-coins"></i> {airdropInfo?.feeAmount} BNB
                    </span>
                  </span>
                </div> */}

                <div className={styles.detailRow}>
                  <span className={styles.label}>Claims Made</span>
                  <span className={styles.value}>
                    <span className={styles.countBadge}>
                      {activeUser?.claimCount || 0}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Your Referrals Section */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <h3><i className="fas fa-users"></i> Your Referrals</h3>
                {activeUser?.referralCount > 0 && (
                  <span className={styles.cardBadge}>{activeUser.referralCount}</span>
                )}
              </div>
              <div className={styles.referralsList}>
                {activeUser?.referralCount > 0 ? (
                  Array(activeUser.referralCount).fill(null).map((_, index) => (
                    <div key={index} className={styles.referralItem}>
                      <div className={styles.referralInfo}>
                        <div className={styles.referralIcon}>
                          <i className="fas fa-user"></i>
                        </div>
                        <span className={styles.referralAddress}>
                          Referral #{index + 1}
                        </span>
                      </div>
                      <span className={styles.referralReward}>
                        +{airdropInfo?.referralBonus || "0"} {airdropInfo?.tokenSymbol}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={styles.noReferrals}>
                    <div className={styles.emptyStateIcon}>
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <p>No referrals yet</p>
                    <span>Share your referral link to earn more rewards!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction History */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <h3><i className="fas fa-history"></i> Transaction History</h3>
              </div>
              <div className={styles.transactionList}>
                {activeUser?.hasParticipated ? (
                  <div className={styles.transactionItem}>
                    <div className={styles.txInfo}>
                      <div className={styles.txIcon}>
                        <i className="fas fa-parachute-box"></i>
                      </div>
                      <div className={styles.txDetails}>
                        <span className={styles.txType}>Participation</span>
                        <span className={styles.txDate}>
                          {formatDate(Date.now() / 1000)}
                        </span>
                      </div>
                    </div>
                    <span className={styles.txAmount}>
                      {activeUser.feePaid} BNB
                    </span>
                  </div>
                ) : (
                  <div className={styles.noTransactions}>
                    <div className={styles.emptyStateIcon}>
                      <i className="fas fa-receipt"></i>
                    </div>
                    <p>No transactions yet</p>
                    <span>Claim your airdrop to see your transaction history</span>
                  </div>
                )}
                {activeUser?.referralCount > 0 && (
                  <div className={styles.transactionItem}>
                    <div className={styles.txInfo}>
                      <div className={styles.txIcon}>
                        <i className="fas fa-users"></i>
                      </div>
                      <div className={styles.txDetails}>
                        <span className={styles.txType}>Referral Rewards</span>
                        <span className={styles.txDate}>
                          {formatDate(Date.now() / 1000)}
                        </span>
                      </div>
                    </div>
                    <span className={styles.txAmount}>
                      {Number(airdropInfo?.referralBonus || 0) * activeUser.referralCount} {airdropInfo?.tokenSymbol}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;