// context/Web3Context.js
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import ABI from "../web3/artifacts/contracts/TNTCAirdrop.sol/TNTCAirdrop.json";
import {
  isMobileBrowser,
  enhancedContractCall,
  enhancedDataFetch,
  checkMobileConnection,
  waitForMobileWallet,
  handleMobileError,
  optimizeForMobile
} from "../utils/mobileUtils";

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
  const [isMobile, setIsMobile] = useState(false);
  const [mobileConnectionReady, setMobileConnectionReady] = useState(false);

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

  // Initialize mobile detection and optimization
  useEffect(() => {
    const mobile = isMobileBrowser();
    setIsMobile(mobile);

    if (mobile) {
      optimizeForMobile();
      console.log('Mobile browser detected, applying optimizations');
    }
  }, []);

  // Enhanced mobile wallet readiness check
  useEffect(() => {
    let isMounted = true;

    const checkMobileReadiness = async () => {
      if (!isMobile || !isConnected) {
        setMobileConnectionReady(true);
        return;
      }

      try {
        const isReady = await waitForMobileWallet(15000);
        if (isMounted) {
          setMobileConnectionReady(isReady);

          if (isReady && provider) {
            const connectionOk = await checkMobileConnection(provider);
            if (isMounted) {
              setMobileConnectionReady(connectionOk);
            }
          }
        }
      } catch (error) {
        console.error('Mobile readiness check failed:', error);
        if (isMounted) {
          setMobileConnectionReady(false);
        }
      }
    };

    if (isConnected) {
      checkMobileReadiness();
    } else {
      setMobileConnectionReady(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isMobile, isConnected, provider]);

  // Initialize contract with retry logic
  useEffect(() => {
    let isMounted = true;

    const initializeContract = async () => {
      if (!signer || !provider || !contractAddress) {
        return;
      }

      // Wait for mobile wallet readiness
      if (isMobile && !mobileConnectionReady) {
        console.log('Waiting for mobile wallet to be ready...');
        return;
      }

      setIsInitializing(true);
      setInitError(null);

      try {
        // Enhanced delay for mobile browsers
        const delay = isMobile ? 2000 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));

        if (!isMounted) return;

        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        // Enhanced contract connection test for mobile
        if (isMobile) {
          // Use enhanced contract call for mobile
          await enhancedContractCall(contractInstance, 'deployed', []);
        } else {
          await contractInstance.deployed();
        }

        if (!isMounted) return;

        setContract(contractInstance);
        setRetryCount(0);

        // Get fee details with enhanced error handling
        try {
          await getFeeDetails(contractInstance);
        } catch (feeError) {
          const handledError = handleMobileError(feeError, 'Fee details fetch');
          console.warn("Could not fetch fee details:", handledError.message);
          // Don't fail contract initialization for fee details
        }

      } catch (error) {
        const handledError = handleMobileError(error, 'Contract initialization');
        console.error("Error initializing contract:", handledError);
        setInitError(handledError);
        setContract(null);

        // Enhanced retry logic for mobile browsers
        const maxRetries = isMobile ? 5 : 3;
        const baseDelay = isMobile ? 3000 : 2000;

        if (retryCount < maxRetries && isMounted) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, baseDelay * (retryCount + 1));
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    if (signer && provider && isConnected && (!isMobile || mobileConnectionReady)) {
      initializeContract();
    } else {
      setContract(null);
      setIsInitializing(false);
      setInitError(null);
    }

    return () => {
      isMounted = false;
    };
  }, [signer, provider, isConnected, retryCount, isMobile, mobileConnectionReady]);

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
      // Enhanced timeout for mobile browsers
      const timeout = isMobile ? 15000 : 8000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      );

      // Use enhanced data fetch for mobile browsers
      const fetchAirdropInfo = async () => {
        if (isMobile) {
          return await enhancedContractCall(contractInstance, 'getAirdropInfo');
        } else {
          return await contractInstance.getAirdropInfo();
        }
      };

      const airdropInfo = await Promise.race([fetchAirdropInfo(), timeoutPromise]);

      if (airdropInfo) {
        setFeeAmount(ethers.utils.formatEther(airdropInfo.currentFeeAmount || 0));
        setFeeCollector(airdropInfo.currentFeeCollector || INITIAL_FEE_COLLECTOR);
      }
    } catch (error) {
      const handledError = handleMobileError(error, 'Fee details fetch');
      console.error("Error fetching fee details:", handledError.message);
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


  // Enhanced retry wrapper for contract calls with mobile support
  const retryContractCall = async (contractMethod, ...args) => {
    const maxRetries = isMobile ? 5 : 2;
    const baseDelay = isMobile ? 2000 : 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await contractMethod(...args);
        return result;
      } catch (error) {
        const handledError = handleMobileError(error, `Contract call attempt ${attempt}`);
        console.error(`Contract call attempt ${attempt} failed:`, handledError.message);

        if (attempt === maxRetries) {
          throw handledError;
        }

        // Enhanced delay for mobile browsers
        const delay = baseDelay * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const getAllTasks = async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      // Enhanced data fetching for mobile browsers
      const fetchTasks = async () => {
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
      };

      if (isMobile) {
        return await enhancedDataFetch(fetchTasks);
      } else {
        return await fetchTasks();
      }
    } catch (error) {
      const handledError = handleMobileError(error, 'Tasks fetch');
      console.error("Error fetching tasks:", handledError.message);
      return [];
    }
  };

  const getPoints = async (userAddress) => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const fetchPoints = async () => {
        return await retryContractCall(() => contract.userTaskPoints(userAddress || address));
      };

      if (isMobile) {
        return await enhancedDataFetch(fetchPoints);
      } else {
        return await fetchPoints();
      }
    } catch (error) {
      const handledError = handleMobileError(error, 'User points fetch');
      console.error("Error fetching user points:", handledError.message);
      return ethers.BigNumber.from(0);
    }
  };

  //Added get user referral info function here
  const getUserReferralInfo = async (userAddress) => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const fetchReferralInfo = async () => {
        const referralCount = await contract.getReferralCount(userAddress || address);
        const referrer = await contract.getReferrer(userAddress || address);
        return {
          referralCount: referralCount.toNumber(),
          referrer
        };
      };

      if (isMobile) {
        return await enhancedDataFetch(fetchReferralInfo);
      } else {
        return await fetchReferralInfo();
      }
    } catch (error) {
      const handledError = handleMobileError(error, 'Referral info fetch');
      console.error("Error fetching referral info:", handledError.message);
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
        isMobile,
        mobileConnectionReady,
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