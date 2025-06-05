import { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useNetwork } from "../context/NetworkContext";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useNotification } from "../context/NotificationContext";
import { trackReferral, analyzeReferralUrl, handleTransactionError } from "../utils/errorHandling";
import { ErrorState } from "../components/LoadingStates/LoadingStates";

import MainHeader from "../components/MainHeader";
import Banner from "../components/Banner";
import WhyUs from "../components/WhyUs";
import AboutUs from "../components/AboutUs";
import AirDrop from "../components/AirDrop";
import Distribution from "../components/Distribution";
import Timeline from "../components/Timeline";
import App from "../components/App";
import Team from "../components/Team";
import Faq from "../components/Faq";
import Contact from "../components/Contact";
import Clients from "../components/Clients";
import Footer from "../components/Footer";
import MoveUp from "../components/MoveUp";
import AdminDashboard from "../components/AdminDashboard/AdminDashboard";
import UserDashboard from "../components/UserDashboard/UserDashboard";
import NetworkModal from "../components/NetworkModal/NetworkModal";

const index = () => {
  const { isConnected } = useAccount();
  const {
    account,
    contract,
    connectWallet,
    feeAmount,
    feeCollector,
    updateFeeAmount,
    updateFeeCollector,
    withdrawFees,
    updateClaimCooldown,
    isInitializing,
    initError,
    retryCount
  } = useWeb3();
  const {
    networkStatus,
    networkContractCall
  } = useNetwork();
  const { showNotification } = useNotification();

  const [activeUser, setActiveUser] = useState();
  const [airdropInfo, setAirdropInfo] = useState();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralAddress, setReferralAddress] = useState("");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [airdropAmount, setAirdropAmount] = useState();
  const [airdropBonus, setAirdropBonus] = useState();
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [fetchRetryCount, setFetchRetryCount] = useState(0);

  // Track if initial load is complete
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!contract || !account || isInitializing) {
        return;
      }

      setDataLoading(true);
      setDataError(null);

      try {
        // Ultra-fast parallel fetch
        const [airdropResult, userResult] = await Promise.allSettled([
          fetchAirdropDetails(),
          fetchUserDetails()
        ]);

        if (!isMounted) return;

        // Check if at least one fetch succeeded
        if (airdropResult.status === 'rejected' && userResult.status === 'rejected') {
          throw new Error('All data fetching failed');
        }

        // Log any failures but don't block the UI
        if (airdropResult.status === 'rejected') {
          console.warn('Airdrop details fetch failed:', airdropResult.reason);
        }
        if (userResult.status === 'rejected') {
          console.warn('User details fetch failed:', userResult.reason);
        }

        setFetchRetryCount(0);

      } catch (error) {
        console.error("Error fetching data:", error);
        setDataError(error);

        // Fast retry logic
        if (fetchRetryCount < 2 && isMounted) {
          const retryDelay = Math.min(500 * Math.pow(2, fetchRetryCount), 2000);
          setTimeout(() => {
            setFetchRetryCount(prev => prev + 1);
          }, retryDelay);
        }
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    };

    if (contract && account && !isInitializing) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [contract, account, isInitializing, fetchRetryCount]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("Current URL:", window.location.href);
      const analysis = analyzeReferralUrl(window.location.href);
      console.log("Referral URL Analysis:", analysis);
      
      if (analysis.valid && analysis.referralAddress && !referralAddress) {
        console.log("Setting referral address from URL analysis:", analysis.referralAddress);
        setReferralAddress(analysis.referralAddress);
      }
    }
  }, []);

  const fetchAirdropDetails = async () => {
    if (!contract) {
      throw new Error("Contract not available");
    }

    try {
      // Fast parallel fetch with shorter timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const dataPromise = Promise.all([
        contract.getTokenInfo(),
        contract.getAirdropInfo(),
        contract.getTotalParticipants(),
      ]);

      const [tokenInfo, airdropInfo, participants] =
        await Promise.race([dataPromise, timeoutPromise]);

      // Set data immediately
      const formattedAirdropInfo = {
        startTime: airdropInfo.start ? Number(airdropInfo.start) * 1000 : 0,
        endTime: airdropInfo.end ? Number(airdropInfo.end) * 1000 : 0,
        totalParticipants: Number(participants),
        airdropName: airdropInfo.name,
        airdropDescription: airdropInfo.description,
        airdropAmount: ethers.utils.formatEther(airdropInfo.baseAmount),
        referralBonus: ethers.utils.formatEther(airdropInfo.referralAmount),
        remainingTokens: ethers.utils.formatEther(airdropInfo.remainingTokens),
        isAirdropActive: airdropInfo.isAirdropActive,
        feeAmount: ethers.utils.formatEther(airdropInfo.currentFeeAmount || 0),
        feeCollector: airdropInfo.currentFeeCollector,
        totalFeesCollected: ethers.utils.formatEther(airdropInfo.totalFeesCollected || 0),
        airdropContractBalance: ethers.utils.formatEther(
          tokenInfo.airdropContractBalance
        ),
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        tokenDecimals: tokenInfo.decimals,
        tokenAddress: tokenInfo.tokenAddress,
        totalSupply: ethers.utils.formatEther(tokenInfo.totalSupply),
        allParticipants: [], // Load separately if needed
      };

      setAirdropInfo(formattedAirdropInfo);

      // Load participants in background (optional)
      contract.getAllParticipants().then(allParticipants => {
        const formattedParticipants = allParticipants.map((p) => ({
          address: p.userAddress,
          hasParticipated: p.hasParticipated,
          referralCount: p.referralCount.toString(),
          referrer: p.referrer,
          totalEarned: ethers.utils.formatEther(p.totalEarned),
          participationTime: new Date(
            Number(p.participationTime) * 1000
          ).toLocaleString(),
          feePaid: ethers.utils.formatEther(p.feePaid || 0),
        }));

        setAirdropInfo(prev => ({
          ...prev,
          allParticipants: formattedParticipants,
        }));
      }).catch(err => {
        console.warn("Failed to load participants data:", err);
      });

    } catch (error) {
      console.error("Error fetching airdrop details:", error);
      throw error;
    }
  };

  const fetchUserDetails = async () => {
    if (!contract || !account) {
      throw new Error("Contract or account not available");
    }

    try {
      // Fast parallel fetch
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('User details timeout')), 3000)
      );

      const dataPromise = Promise.all([
        contract.getUserParticipationInfo(account),
        contract.getReferralCount(account)
      ]);

      const [participationInfo, referralInfo] = await Promise.race([dataPromise, timeoutPromise]);

      setActiveUser({
        hasParticipated: participationInfo.hasParticipated_,
        referralCount: referralInfo.toNumber(),
        referrer: participationInfo.referrer_,
        totalEarned: ethers.utils.formatEther(participationInfo.totalEarned),
        feePaid: ethers.utils.formatEther(participationInfo.feePaid_ || 0),
      });
    } catch (error) {
      console.error("Error checking user status:", error);
      throw error;
    }
  };

  const handleParticipateWithoutReferral = async () => {
    try {
      setLoading(true);
      showNotification("Processing...", "info");
      const tx = await contract.participateWithoutReferral({ 
        value: ethers.utils.parseEther(feeAmount) 
      });
      await tx.wait();
      showNotification("You have successfully participated!", "success");
      if (tx) {
        fetchAirdropDetails();
        fetchUserDetails();
      }
    } catch (error) {
      handleTransactionError(error, showNotification);
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  const handleParticipate = async () => {
    try {
      setLoading(true);
      
      if (!referralAddress || !ethers.utils.isAddress(referralAddress)) {
        console.error("Invalid referral address:", referralAddress);
        showNotification("Invalid referral address. Please check the URL and try again.", "error");
        setLoading(false);
        return;
      }
      
      trackReferral(referralAddress, account);
      
      console.log("Participating with referral address:", referralAddress);
      showNotification("Processing with referral...", "info");
      
      const tx = await contract.participate(referralAddress, { 
        value: ethers.utils.parseEther(feeAmount) 
      });
      
      console.log("Transaction submitted:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed");
      
      showNotification("You have successfully participated!", "success");
      
      if (tx) {
        console.log("Refreshing data after successful participation");
        await fetchAirdropDetails();
        await fetchUserDetails();
        
        try {
          const referrerInfo = await contract.getReferralCount(referralAddress);
          console.log("Referrer's updated referral count:", referrerInfo.toString());
          showNotification(`Referral bonus sent to ${referralAddress.substring(0, 6)}...${referralAddress.substring(38)}!`, "success");
        } catch (err) {
          console.error("Error verifying referral:", err);
        }
      }
    } catch (error) {
      handleTransactionError(error, showNotification);
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  const updateAirdropAmount = async () => {
    try {
      const amount = ethers.utils.parseEther(airdropAmount.toString());
      setLoading(true);
      showNotification("Processing...", "info");
      const tx = await contract.setAirdropAmount(amount);
      await tx.wait();
      showNotification("Airdrop amount updated successfully!", "success");
      if (tx) {
        fetchAirdropDetails();
        fetchUserDetails();
      }
    } catch (error) {
      handleTransactionError(error, showNotification);
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  const updateReferralBonus = async () => {
    try {
      const amount = ethers.utils.parseEther(airdropBonus.toString());
      setLoading(true);
      showNotification("Processing...", "info");
      const tx = await contract.setReferralBonus(amount);
      await tx.wait();
      showNotification("Referral bonus updated successfully!", "success");
      if (tx) {
        fetchAirdropDetails();
        fetchUserDetails();
      }
    } catch (error) {
      handleTransactionError(error, showNotification);
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  const updateWithdrawTokens = async () => {
    try {
      setLoading(true);
      showNotification("Processing...", "info");
      const tx = await contract.withdrawTokens();
      await tx.wait();
      showNotification("Tokens withdrawn successfully!", "success");
      if (tx) {
        fetchAirdropDetails();
        fetchUserDetails();
      }
    } catch (error) {
      handleTransactionError(error, showNotification);
    } finally {
      setLoading(false);
      setAmount("");
    }
  };

  const handleUpdateFeeAmount = async (newAmount) => {
    try {
      setLoading(true);
      showNotification("Updating fee amount...", "info");
      const result = await updateFeeAmount(newAmount);
      if (result.success) {
        showNotification(result.message, "success");
        fetchAirdropDetails();
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      handleTransactionError(error, showNotification);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeeCollector = async (newCollector) => {
    try {
      setLoading(true);
      showNotification("Updating fee collector...", "info");
      const result = await updateFeeCollector(newCollector);
      if (result.success) {
        showNotification(result.message, "success");
        fetchAirdropDetails();
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      handleTransactionError(error, showNotification);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFees = async () => {
    try {
      setLoading(true);
      showNotification("Withdrawing fees...", "info");
      const result = await withdrawFees();
      if (result.success) {
        showNotification(result.message, "success");
        fetchAirdropDetails();
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      handleTransactionError(error, showNotification);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCooldown = async (hours) => {
    try {
      setLoading(true);
      showNotification("Updating claim cooldown...", "info");
      const result = await updateClaimCooldown(hours);
      if (result.success) {
        showNotification(result.message, "success");
        fetchAirdropDetails();
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };
  

  // Only show full-page loading for critical initialization errors
  // For normal loading, we'll show the page with component-level loading states
  if (initError && retryCount >= 3) {
    return (
      <ErrorState
        title="Connection Failed"
        message="Unable to connect to the blockchain network. This could be due to:"
        showDetails={true}
        details={[
          "Wallet connection issues",
          "Network connectivity problems",
          "Smart contract unavailable",
          "RPC endpoint issues"
        ]}
        onReload={() => window.location.reload()}
        onRetry={() => setFetchRetryCount(0)}
      />
    );
  }

  return (
    <div className="bg_light v_light_blue_pro" data-spy="scroll">


      <MainHeader />
      <Banner
        airdropInfo={airdropInfo}
        activeUser={activeUser}
        handleParticipateWithoutReferral={handleParticipateWithoutReferral}
        handleParticipate={handleParticipate}
        setReferralAddress={setReferralAddress}
        referralAddress={referralAddress}
        loading={loading || dataLoading}
        account={account}
        setIsAdminModalOpen={setIsAdminModalOpen}
        dataLoading={dataLoading}
        dataError={dataError}
        onRetry={() => setFetchRetryCount(prev => prev + 1)}
      />

      {/* <UserDashboard
        activeUser={activeUser}
        airdropInfo={airdropInfo}
      /> */}

      <Footer />

      {/* Network Modal */}
      <NetworkModal />

      <AdminDashboard
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        airdropInfo={airdropInfo}
        setAirdropAmount={setAirdropAmount}
        setAirdropBonus={setAirdropBonus}
        updateAirdropAmount={updateAirdropAmount}
        updateReferralBonus={updateReferralBonus}
        updateWithdrawTokens={updateWithdrawTokens}
        contract={contract}
        feeAmount={feeAmount}
        feeCollector={feeCollector}
        onUpdateFeeAmount={handleUpdateFeeAmount}
        onUpdateFeeCollector={handleUpdateFeeCollector}
        onWithdrawFees={handleWithdrawFees}
        onUpdateCooldown={handleUpdateCooldown}
        account={account}
        showNotification={showNotification}
      />
    </div>
  );
};

export default index;