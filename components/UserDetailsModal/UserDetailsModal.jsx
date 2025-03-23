import React, { useState, useCallback, useEffect } from "react";
import styles from "./UserDetailsModal.module.css";
import { useWeb3 } from "../../context/Web3Context";

const UserDetailsModal = ({ isOpen, onClose, activeUser, account }) => {
  const [copied, setCopied] = useState(false);
  const [liveReferralCount, setLiveReferralCount] = useState(0);
  const { getUserReferralInfo } = useWeb3();

  // Fix the referral URL format to use query parameters
  const referralUrl = account ? `${window.location.origin}?ref=${account}` : "";

  // Update referral count in real-time when modal is open
  useEffect(() => {
    if (!isOpen || !account) return;

    // Set initial referral count
    setLiveReferralCount(activeUser?.referralCount || 0);

    // Setup polling for real-time updates when modal is open
    const fetchReferralData = async () => {
      try {
        const referralInfo = await getUserReferralInfo(account);
        setLiveReferralCount(referralInfo.referralCount);
      } catch (error) {
        console.error("Error fetching real-time referral data:", error);
      }
    };

    // Poll every 10 seconds for updates
    const intervalId = setInterval(fetchReferralData, 10000);
    
    // Clean up on close or unmount
    return () => clearInterval(intervalId);
  }, [isOpen, account, getUserReferralInfo, activeUser]);

  // Handle copy with proper URL
  const handleCopyReferralUrl = useCallback(async () => {
    if (!referralUrl) return;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [referralUrl]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.closeIcon}
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.modalHeader}>
          <h2>Your Airdrop Details</h2>
        </div>

        <div className={styles.detailsContainer}>
          {/* Participation Status */}
          <div className={styles.detailItem}>
            <span className={styles.label}>Participation Status</span>
            <span
              className={`${styles.value} ${styles.status} ${
                activeUser?.hasParticipated
                  ? styles.participated
                  : styles.notParticipated
              }`}
            >
              {activeUser?.hasParticipated
                ? "✓ Participated"
                : "✗ Not Participated"}
            </span>
          </div>

          {/* Referral Count - Now using live data */}
          <div className={styles.detailItem}>
            <span className={styles.label}>Referral Count</span>
            <span className={styles.value}>
              <span className={styles.number}>
                {liveReferralCount || 0}
              </span>{" "}
              referrals
            </span>
          </div>

          {/* Referrer */}
          <div className={styles.detailItem}>
            <span className={styles.label}>Referrer</span>
            <span className={`${styles.value} ${styles.address}`}>
              {activeUser?.referrer && activeUser.referrer !== '0x0000000000000000000000000000000000000000'
                ? `${activeUser.referrer.slice(
                    0,
                    6
                  )}...${activeUser.referrer.slice(-4)}`
                : "No referrer"}
            </span>
          </div>

          {/* Total Earned */}
          <div className={styles.detailItem}>
            <span className={styles.label}>Total Earned</span>
            <span className={`${styles.value} ${styles.earnings}`}>
              {activeUser?.totalEarned || 0} Tokens
            </span>
          </div>

          {/* Referral URL */}
          <div className={styles.referralUrlContainer}>
            <span className={styles.label}>Your Referral URL</span>
            <div className={styles.urlBox}>
              <input
                type="text"
                readOnly
                value={referralUrl}
                className={styles.urlInput}
                placeholder="Connect wallet to get referral link"
              />
              <button
                onClick={handleCopyReferralUrl}
                className={styles.copyButton}
                disabled={!referralUrl}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.note}>
            Share your referral link to earn more tokens!
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;