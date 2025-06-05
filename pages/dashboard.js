import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWeb3 } from "../context/Web3Context";
import UserDashboard from "../components/UserDashboard/UserDashboard";
import TaskDashboard from "../components/TaskDashboard/TaskDashboard";
import styles from '../styles/DashboardLayout.module.css';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useNotification } from "../context/NotificationContext";
import { handleTransactionError } from "../utils/errorHandling";

const Dashboard = () => {
  const router = useRouter();
  const { 
    account, 
    isConnected, 
    contract,
    getUserReferralInfo,
  } = useWeb3();
  
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dataLoading, setDataLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [airdropData, setAirdropData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dataError, setDataError] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDataLoading(true);
        setDataError(null);

        // Only proceed with contract calls if contract and account are available
        if (contract && account) {
          try {
            // Fast parallel fetch with shorter timeouts
            const [userInfo, userPoints, claimCount] = await Promise.race([
              Promise.all([
                contract.getUserParticipationInfo(account),
                contract.userTaskPoints(account).catch(() => 0),
                contract.userClaimCount(account).catch(() => 0)
              ]),
              new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
            ]);

            // Get referral info separately with fallback
            let referralInfo;
            try {
              referralInfo = await Promise.race([
                getUserReferralInfo(account),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
              ]);
            } catch (error) {
              console.log("Error getting referral info, using defaults", error);
              referralInfo = { referralCount: 0, referrer: ethers.constants.AddressZero };
            }

            setUserData({
              hasParticipated: userInfo.hasParticipated_ || false,
              referralCount: referralInfo.referralCount || 0,
              referrer: referralInfo.referrer || ethers.constants.AddressZero,
              totalEarned: ethers.utils.formatEther(userInfo.totalEarned || "0"),
              feePaid: ethers.utils.formatEther(userInfo.feePaid_ || "0"),
              userPoints: userPoints || 0,
              claimCount: Number(claimCount || 0)
            });

            // Get airdrop info with fast timeout
            try {
              const airdropInfo = await Promise.race([
                contract.getAirdropInfo(),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
              ]);
              setAirdropData({
                airdropAmount: ethers.utils.formatEther(airdropInfo.baseAmount || "0"),
                referralBonus: ethers.utils.formatEther(airdropInfo.referralAmount || "0"),
                feeAmount: ethers.utils.formatEther(airdropInfo.currentFeeAmount || "0"),
                tokenSymbol: "TNTC",
              });
            } catch (error) {
              console.log("Error getting airdrop info, using defaults", error);
              setAirdropData({
                airdropAmount: "0",
                referralBonus: "0",
                feeAmount: "0.001",
                tokenSymbol: "TNTC",
              });
            }
          } catch (error) {
            console.error("Error in contract calls:", error);
            setDataError(error);
            // Still show the dashboard with default values
            if (!userData) {
              setUserData({
                hasParticipated: false,
                referralCount: 0,
                referrer: ethers.constants.AddressZero,
                totalEarned: "0",
                feePaid: "0",
                userPoints: 0,
                claimCount: 0
              });
            }
            if (!airdropData) {
              setAirdropData({
                airdropAmount: "0",
                referralBonus: "0",
                feeAmount: "0.001",
                tokenSymbol: "TNTC",
              });
            }
          }
        } else {
          // If contract or account isn't available, use default values
          setUserData({
            hasParticipated: false,
            referralCount: 0,
            referrer: ethers.constants.AddressZero,
            totalEarned: "0",
            feePaid: "0",
            userPoints: 0,
            claimCount: 0
          });
          setAirdropData({
            airdropAmount: "0",
            referralBonus: "0",
            feeAmount: "0.001",
            tokenSymbol: "TNTC",
          });
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setDataError(error);
        showNotification("Failed to load some dashboard data, showing available information.", "warning");
      } finally {
        setDataLoading(false);
      }
    };

    loadDashboardData();
    
    // Set up an interval to refresh the referral data periodically
    const refreshInterval = setInterval(async () => {
      if (contract && account) {
        try {
          const referralInfo = await getUserReferralInfo(account);
          setUserData(prevData => {
            if (prevData) {
              return {
                ...prevData,
                referralCount: referralInfo.referralCount
              };
            }
            return prevData;
          });
        } catch (error) {
          console.error("Error refreshing referral data:", error);
        }
      }
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [contract, account, getUserReferralInfo, showNotification]);
  

  const handlePointsUpdate = async () => {
    if (contract && account) {
      try {
        const userInfo = await contract.getUserParticipationInfo(account);
        const userPoints = await contract.userTaskPoints(account);
        
        setUserData(prevData => ({
          ...prevData,
          totalEarned: ethers.utils.formatEther(userInfo.totalEarned),
          userPoints: userPoints
        }));
        
        // Notify user about the points update
        showNotification("Your points have been updated!", "success");
      } catch (error) {
        console.error("Error updating points:", error);
        showNotification("Failed to update points. Please refresh the page.", "error");
      }
    }
  };

  const handleParticipateWithoutReferral = async () => {
    try {
      showNotification("Processing your airdrop claim...", "info");
      const tx = await contract.participateWithoutReferral({ 
        value: ethers.utils.parseEther(airdropData?.feeAmount || "0") 
      });
      
      showNotification("Transaction submitted! Please wait for confirmation...", "info");
      await tx.wait();
      
      // Refresh data after successful participation
      const userInfo = await contract.getUserParticipationInfo(account);
      const userPoints = await contract.userTaskPoints(account);
      const claimCount = await contract.userClaimCount(account);
      
      setUserData(prevData => ({
        ...prevData,
        hasParticipated: userInfo.hasParticipated_,
        referralCount: Number(userInfo.referralCount_),
        referrer: userInfo.referrer_,
        totalEarned: ethers.utils.formatEther(userInfo.totalEarned || "0"),
        feePaid: ethers.utils.formatEther(userInfo.feePaid_ || "0"),
        userPoints: userPoints,
        claimCount: Number(claimCount)
      }));

      showNotification("You have successfully claimed your airdrop!", "success");
    } catch (error) {
      handleTransactionError(error, showNotification);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };


  return (
    <div className={styles.dashboardLayout}>
      <button 
        className={styles.menuToggle}
        onClick={toggleMobileMenu}
      >
        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      <div 
        className={`${styles.overlay} ${isMobileMenuOpen ? styles.show : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      <div className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
        <nav>
          <div className={styles.sidebarHeader}>
            <span className={styles.brandName}>Airdrop DApp</span>
          </div>
          <ul className={`${styles.navList} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
            <li 
              className={styles.navItem}
            >
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fas fa-home"></i>
                <span>Back Home</span>
              </Link>
            </li>

            <li 
              className={`${styles.navItem} ${activeMenu === 'dashboard' ? styles.active : ''}`}
              onClick={() => {
                setActiveMenu('dashboard');
                setIsMobileMenuOpen(false);
              }}
            >
              <i className="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </li>
            <li 
              className={`${styles.navItem} ${activeMenu === 'tasks' ? styles.active : ''}`}
              onClick={() => {
                setActiveMenu('tasks');
                setIsMobileMenuOpen(false);
              }}
            >
              <i className="fas fa-tasks"></i>
              <span>Tasks</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className={styles.mainContent}>
        {activeMenu === 'dashboard' && (
          <UserDashboard
            activeUser={userData}
            airdropInfo={airdropData}
            handleParticipateWithoutReferral={handleParticipateWithoutReferral}
            dataLoading={dataLoading}
            dataError={dataError}
            onRetry={() => window.location.reload()}
          />
        )}
        {activeMenu === 'tasks' && (
          <TaskDashboard
            userPoints={userData?.userPoints || 0}
            onPointsUpdate={handlePointsUpdate}
            dataLoading={dataLoading}
            dataError={dataError}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;