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
      } catch (error) {
        console.error("Error initializing contract:", error);
        setContract(null);
      }
    }
  }, [signer, provider]);

  useEffect(() => {
    if (!isConnected) {
      setContract(null);
      // Don't manipulate localStorage here - it can cause refresh loops
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
        getUserReferralInfo,
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