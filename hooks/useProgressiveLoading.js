import { useState, useEffect, useCallback } from 'react';
import { useNetwork } from '../context/NetworkContext';

/**
 * Custom hook for progressive data loading
 * Loads essential data first, then loads additional data in the background
 */
export const useProgressiveLoading = (contract, account) => {
  const [loadingStates, setLoadingStates] = useState({
    essential: false,
    additional: false,
    complete: false
  });
  
  const [data, setData] = useState({
    essential: null,
    additional: null
  });
  
  const [errors, setErrors] = useState({
    essential: null,
    additional: null
  });

  const { networkStatus, getNetworkSettings } = useNetwork();

  // Reset states when contract or account changes
  useEffect(() => {
    if (!contract || !account) {
      setLoadingStates({ essential: false, additional: false, complete: false });
      setData({ essential: null, additional: null });
      setErrors({ essential: null, additional: null });
    }
  }, [contract, account]);

  // Load essential data first (what user sees immediately)
  const loadEssentialData = useCallback(async () => {
    if (!contract || !account) return null;

    setLoadingStates(prev => ({ ...prev, essential: true }));
    setErrors(prev => ({ ...prev, essential: null }));

    try {
      const networkSettings = getNetworkSettings();
      const timeout = networkSettings.enableDataSaver ? 15000 : 10000;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Essential data timeout')), timeout)
      );

      // Load only the most critical data
      const essentialPromise = Promise.all([
        contract.getAirdropInfo(),
        contract.getTokenInfo(),
        contract.getUserParticipationInfo(account),
        contract.getReferralCount(account)
      ]);

      const [airdropInfo, tokenInfo, participationInfo, referralInfo] = 
        await Promise.race([essentialPromise, timeoutPromise]);

      const essentialData = {
        airdropInfo: {
          startTime: airdropInfo.start ? Number(airdropInfo.start) * 1000 : 0,
          endTime: airdropInfo.end ? Number(airdropInfo.end) * 1000 : 0,
          airdropName: airdropInfo.name,
          airdropDescription: airdropInfo.description,
          airdropAmount: airdropInfo.baseAmount,
          referralBonus: airdropInfo.referralAmount,
          remainingTokens: airdropInfo.remainingTokens,
          isAirdropActive: airdropInfo.isAirdropActive,
          feeAmount: airdropInfo.currentFeeAmount || 0,
          feeCollector: airdropInfo.currentFeeCollector,
          tokenName: tokenInfo.name,
          tokenSymbol: tokenInfo.symbol,
          tokenDecimals: tokenInfo.decimals,
          tokenAddress: tokenInfo.tokenAddress,
        },
        activeUser: {
          hasParticipated: participationInfo.hasParticipated_,
          referralCount: referralInfo.toNumber(),
          referrer: participationInfo.referrer_,
          totalEarned: participationInfo.totalEarned,
          feePaid: participationInfo.feePaid_ || 0,
        }
      };

      setData(prev => ({ ...prev, essential: essentialData }));
      return essentialData;

    } catch (error) {
      console.error('Error loading essential data:', error);
      setErrors(prev => ({ ...prev, essential: error }));
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, essential: false }));
    }
  }, [contract, account, getNetworkSettings]);

  // Load additional data in background (less critical)
  const loadAdditionalData = useCallback(async () => {
    if (!contract) return null;

    setLoadingStates(prev => ({ ...prev, additional: true }));
    setErrors(prev => ({ ...prev, additional: null }));

    try {
      const networkSettings = getNetworkSettings();
      
      // Skip heavy operations on poor connections
      if (networkSettings.enableDataSaver) {
        setLoadingStates(prev => ({ ...prev, additional: false, complete: true }));
        return null;
      }

      const timeout = 20000; // Longer timeout for additional data

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Additional data timeout')), timeout)
      );

      // Load less critical data
      const additionalPromise = Promise.all([
        contract.getTotalParticipants(),
        contract.getAllParticipants().catch(() => []), // Don't fail if this is slow
      ]);

      const [participants, allParticipants] = 
        await Promise.race([additionalPromise, timeoutPromise]);

      const formattedParticipants = Array.isArray(allParticipants) 
        ? allParticipants.map((p) => ({
            address: p.userAddress,
            hasParticipated: p.hasParticipated,
            referralCount: p.referralCount.toString(),
            referrer: p.referrer,
            totalEarned: p.totalEarned,
            participationTime: new Date(
              Number(p.participationTime) * 1000
            ).toLocaleString(),
            feePaid: p.feePaid || 0,
          }))
        : [];

      const additionalData = {
        totalParticipants: Number(participants),
        allParticipants: formattedParticipants,
        airdropContractBalance: data.essential?.airdropInfo?.airdropContractBalance || 0,
        totalSupply: data.essential?.airdropInfo?.totalSupply || 0,
        totalFeesCollected: data.essential?.airdropInfo?.totalFeesCollected || 0,
      };

      setData(prev => ({ ...prev, additional: additionalData }));
      return additionalData;

    } catch (error) {
      console.error('Error loading additional data:', error);
      setErrors(prev => ({ ...prev, additional: error }));
      // Don't throw for additional data - it's not critical
      return null;
    } finally {
      setLoadingStates(prev => ({ ...prev, additional: false, complete: true }));
    }
  }, [contract, data.essential, getNetworkSettings]);

  // Combined loading function
  const loadData = useCallback(async () => {
    try {
      // Load essential data first
      const essentialData = await loadEssentialData();
      
      // Load additional data in background after a short delay
      setTimeout(() => {
        loadAdditionalData();
      }, 500);

      return essentialData;
    } catch (error) {
      throw error;
    }
  }, [loadEssentialData, loadAdditionalData]);

  // Retry function
  const retry = useCallback(async (type = 'all') => {
    if (type === 'essential' || type === 'all') {
      return await loadEssentialData();
    }
    if (type === 'additional') {
      return await loadAdditionalData();
    }
  }, [loadEssentialData, loadAdditionalData]);

  return {
    loadingStates,
    data,
    errors,
    loadData,
    retry,
    isEssentialLoading: loadingStates.essential,
    isAdditionalLoading: loadingStates.additional,
    isComplete: loadingStates.complete,
    hasEssentialData: !!data.essential,
    hasAdditionalData: !!data.additional,
    essentialError: errors.essential,
    additionalError: errors.additional
  };
};
