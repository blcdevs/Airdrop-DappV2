// context/Web3Context.js
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useChainId, useConnect } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import ABI from "../web3/artifacts/contracts/TNTCAirdrop.sol/TNTCAirdrop.json";
import { 
  getDeviceInfo, 
  cleanupWalletSessions,
  handleAppVisibilityChange
} from "../utils/walletHelpers";

const Web3Context = createContext();

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS;
const INITIAL_FEE_COLLECTOR = process.env.NEXT_PUBLIC_FEE_COLLECTOR;
const INITIAL_FEE_AMOUNT = "0.001"; // 0.001 BNB default fee

export function Web3Provider({ children }) {
  const [contract, setContract] = useState(null);
  const [feeAmount, setFeeAmount] = useState(INITIAL_FEE_AMOUNT);
  const [feeCollector, setFeeCollector] = useState(INITIAL_FEE_COLLECTOR);
  const [connectionError, setConnectionError] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({ isMobile: false, isIOS: false });

  // Wagmi hooks v2
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();

  // Custom ethers hooks
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const contractAddress = CONTRACT_ADDRESS;
  const contractABI = ABI.abi;

  // Set device info on mount
  useEffect(() => {
    setDeviceInfo(getDeviceInfo());
    
    // Clean up any stale wallet sessions
    cleanupWalletSessions();
    
    // Setup visibility change handler for app switching
    const cleanupVisibilityHandler = handleAppVisibilityChange(() => {
      // Check connection after returning to the app
      if (window.ethereum && typeof window.ethereum.isConnected === 'function') {
        const isConnected = window.ethereum.isConnected();
        if (!isConnected && address) {
          console.log("Connection lost during app switch");
          setConnectionError("Connection lost. Please reconnect your wallet.");
        }
      }
    });
    
    return () => {
      cleanupVisibilityHandler();
    };
  }, []);

  // Initialize contract
  useEffect(() => {
    if (signer && provider) {
      try {
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContract(contract);
        getFeeDetails(contract);
        setConnectionError(null); // Clear any connection errors on success
      } catch (error) {
        console.error("Error initializing contract:", error);
        setContract(null);
        setConnectionError("Failed to initialize contract. Please try reconnecting your wallet.");
      }
    }
  }, [signer, provider]);

  useEffect(() => {
    if (!isConnected) {
      setContract(null);
    }
  }, [isConnected]);

  const getFeeDetails = async (contractInstance) => {
    try {
      const airdropInfo = await contractInstance.getAirdropInfo();
      setFeeAmount(ethers.utils.formatEther(airdropInfo.currentFeeAmount || 0));
      setFeeCollector(airdropInfo.currentFeeCollector);
    } catch (error) {
      console.error("Error fetching fee details:", error);
    }
  };

  const updateFeeAmount = async (newAmount) => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const amountInWei = ethers.utils.parseEther(newAmount);
      const tx = await contract.setFeeAmount(amountInWei);
      await tx.wait();
      await getFeeDetails(contract);
      return { success: true, message: "Fee amount updated successfully" };
    } catch (error) {
      console.error("Error updating fee amount:", error);
      return { success: false, message: error.message };
    }
  };

  const updateFeeCollector = async (newCollector) => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.setFeeCollector(newCollector);
      await tx.wait();
      await getFeeDetails(contract);
      return { success: true, message: "Fee collector updated successfully" };
    } catch (error) {
      console.error("Error updating fee collector:", error);
      return { success: false, message: error.message };
    }
  };

  const withdrawFees = async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.withdrawFees();
      await tx.wait();
      return { success: true, message: "Fees withdrawn successfully" };
    } catch (error) {
      console.error("Error withdrawing fees:", error);
      return { success: false, message: error.message };
    }
  };

  const updateClaimCooldown = async (hours) => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const cooldownInSeconds = hours * 3600; // Convert hours to seconds
      const tx = await contract.setClaimCooldown(cooldownInSeconds);
      await tx.wait();
      return { success: true, message: "Claim cooldown updated successfully" };
    } catch (error) {
      console.error("Error updating claim cooldown:", error);
      return { success: false, message: error.message };
    }
  };


  const getAllTasks = async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const taskCount = await contract.taskCount();
      const tasks = [];
      
      for (let i = 0; i < taskCount; i++) {
        const task = await contract.tasks(i);
        tasks.push({
          id: i,
          title: task.title,
          description: task.description,
          link: task.link,
          rewardAmount: task.rewardAmount.toString(),
          taskType: task.taskType,
          isActive: task.isActive
        });
      }
      return tasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  };

  //Added get user referral info function here
  const getUserReferralInfo = async (userAddress) => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const referralCount = await contract.getReferralCount(userAddress || address);
      const referrer = await contract.getReferrer(userAddress || address);
      return { 
        referralCount: referralCount.toNumber(), 
        referrer
      };
    } catch (error) {
      console.error("Error fetching referral info:", error);
      return { referralCount: 0, referrer: ethers.constants.AddressZero };
    }
  };

  const connectWallet = async () => {
    try {
      setConnectionError(null);
      
      // Find the best connector based on device type
      let connector;
      
      if (deviceInfo.isMobile) {
        if (deviceInfo.isIOS) {
          // For iOS, try to find the wallet connector based on browser environment
          if (deviceInfo.userAgent.includes('crios') || deviceInfo.userAgent.includes('chrome')) {
            // Chrome on iOS - use walletConnect
            connector = connectors.find((c) => c.id === "walletConnect");
          } else if (deviceInfo.userAgent.includes('safari')) {
            // Safari on iOS - try walletConnect first (more reliable on iOS)
            connector = connectors.find((c) => c.id === "walletConnect") || 
                       connectors.find((c) => c.id === "injected");
          } else {
            // Default iOS - use walletConnect
            connector = connectors.find((c) => c.id === "walletConnect");
          }
        } else {
          // For Android, try injected first (better user experience)
          connector = connectors.find((c) => c.id === "injected") || 
                     connectors.find((c) => c.id === "walletConnect");
        }
      } else {
        // For desktop, prefer injected
        connector = connectors.find((c) => c.id === "injected");
      }
      
      // Fallback to walletConnect if no appropriate connector found
      if (!connector) {
        connector = connectors.find((c) => c.id === "walletConnect") || connectors[0];
      }
      
      if (connector) {
        console.log(`Connecting with ${connector.id} on ${deviceInfo.isIOS ? 'iOS' : deviceInfo.isMobile ? 'Android/Mobile' : 'Desktop'}`);
        await connect({ connector });
        console.log("Connected with connector:", connector.id);
      } else {
        console.error("No suitable connectors found");
        setConnectionError("No suitable wallet connectors found. Please install MetaMask or another compatible wallet.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setConnectionError(error.message || "Failed to connect wallet. Please try again.");
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account: address,
        isConnected,
        provider,
        signer,
        contract,
        connectWallet,
        chainId,
        feeAmount,
        feeCollector,
        updateFeeAmount,
        updateFeeCollector,
        withdrawFees,
        getFeeDetails,
        updateClaimCooldown,
        getAllTasks, 
        getUserReferralInfo,
        connectionError,
        isMobileDevice: deviceInfo.isMobile,
        isIOSDevice: deviceInfo.isIOS,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}