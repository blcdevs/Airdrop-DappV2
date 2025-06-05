// context/Web3Context.js
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import ABI from "../web3/artifacts/contracts/TNTCAirdrop.sol/TNTCAirdrop.json";

const Web3Context = createContext();

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS;
const INITIAL_FEE_COLLECTOR = process.env.NEXT_PUBLIC_FEE_COLLECTOR;
const INITIAL_FEE_AMOUNT = "0.001"; // 0.001 BNB default fee

export function Web3Provider({ children }) {
  const [contract, setContract] = useState(null);
  const [feeAmount, setFeeAmount] = useState(INITIAL_FEE_AMOUNT);
  const [feeCollector, setFeeCollector] = useState(INITIAL_FEE_COLLECTOR);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Wagmi hooks v2
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Custom ethers hooks
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const contractAddress = CONTRACT_ADDRESS;
  const contractABI = ABI.abi;

  // Initialize contract with retry logic
  useEffect(() => {
    let isMounted = true;

    const initializeContract = async () => {
      if (!signer || !provider || !contractAddress) {
        return;
      }

      setIsInitializing(true);
      setInitError(null);

      try {
        // Add delay to ensure signer is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!isMounted) return;

        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        // Test contract connection
        await contractInstance.deployed();

        if (!isMounted) return;

        setContract(contractInstance);
        setRetryCount(0);

        // Get fee details with error handling
        try {
          await getFeeDetails(contractInstance);
        } catch (feeError) {
          console.warn("Could not fetch fee details:", feeError);
          // Don't fail contract initialization for fee details
        }

      } catch (error) {
        console.error("Error initializing contract:", error);
        setInitError(error);
        setContract(null);

        // Retry logic for mobile/network issues
        if (retryCount < 3 && isMounted) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * (retryCount + 1)); // Exponential backoff
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    if (signer && provider && isConnected) {
      initializeContract();
    } else {
      setContract(null);
      setIsInitializing(false);
      setInitError(null);
    }

    return () => {
      isMounted = false;
    };
  }, [signer, provider, isConnected, retryCount]);

  useEffect(() => {
    if (!isConnected) {
      setContract(null);
      setIsInitializing(false);
      setInitError(null);
      setRetryCount(0);
    }
  }, [isConnected]);

  const safeDisconnect = async () => {
    try {
      // Use wagmi's disconnect function
      await disconnect();
      
      // Clear contract state
      setContract(null);
      
      // Let wagmi handle the WalletConnect sessions
      // Don't manipulate localStorage directly
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  };

  const getFeeDetails = async (contractInstance) => {
    try {
      // Reduced timeout for faster feedback
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      );

      const airdropInfoPromise = contractInstance.getAirdropInfo();
      const airdropInfo = await Promise.race([airdropInfoPromise, timeoutPromise]);

      if (airdropInfo) {
        setFeeAmount(ethers.utils.formatEther(airdropInfo.currentFeeAmount || 0));
        setFeeCollector(airdropInfo.currentFeeCollector || INITIAL_FEE_COLLECTOR);
      }
    } catch (error) {
      console.error("Error fetching fee details:", error);
      // Use fallback values
      setFeeAmount(INITIAL_FEE_AMOUNT);
      setFeeCollector(INITIAL_FEE_COLLECTOR);
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


  // Simple retry wrapper for contract calls
  const retryContractCall = async (contractMethod, ...args) => {
    const maxRetries = 2; // Reduced retries to prevent loops

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await contractMethod(...args);
        return result;
      } catch (error) {
        console.error(`Contract call attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          throw error;
        }

        // Simple delay without exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const getAllTasks = async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const taskCount = await retryContractCall(() => contract.taskCount());
      const tasks = [];

      for (let i = 0; i < taskCount; i++) {
        const task = await retryContractCall(() => contract.tasks(i));
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

  const getPoints = async (userAddress) => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const points = await retryContractCall(() => contract.userTaskPoints(userAddress || address));
      return points;
    } catch (error) {
      console.error("Error fetching user points:", error);
      return ethers.BigNumber.from(0);
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
      const injectedConnector = connectors.find((c) => c.id === "injected");
      if (injectedConnector) {
        await connect({ connector: injectedConnector });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
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
        getPoints,
        getUserReferralInfo,
        isInitializing,
        initError,
        retryCount,
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