export const handleTransactionError = (error, showNotification) => {
    console.error("Transaction error:", error);
    
    const errorMessages = {
      ACTION_REJECTED: "Transaction cancelled by user",
      INSUFFICIENT_FUNDS: "Insufficient BNB for gas fees. Please get BNB from any exchange and try again...",
      NETWORK_ERROR: "Network error. Please check your connection and try again.",
      UNPREDICTABLE_GAS_LIMIT: "Transaction cannot be completed. Please try again.",
      CALL_EXCEPTION: "Contract call failed. Please try again.",
    };
  
    const errorMessage = errorMessages[error.code] || error.message || "Transaction failed";
    showNotification(errorMessage, "error");
  };

// Handle contract errors and return user-friendly messages
export const handleContractError = (error) => {
  const errorMessage = error.message || "Transaction failed";
  
  // Check for common contract revert reasons
  if (errorMessage.includes("user rejected transaction")) {
    return "Transaction was rejected by the user";
  } else if (errorMessage.includes("insufficient funds")) {
    return "Insufficient funds to complete this transaction";
  } else if (errorMessage.includes("Cooldown period not elapsed")) {
    return "Please wait for the cooldown period to end before claiming again";
  } else if (errorMessage.includes("Airdrop is not active")) {
    return "The airdrop is not currently active";
  } else if (errorMessage.includes("Cannot refer yourself")) {
    return "You cannot use your own referral link";
  } else {
    return errorMessage;
  }
};

// Track and log referral activity for debugging
export const trackReferral = (referralAddress, referrerAddress) => {
  // Log to console for debugging
  console.log("🔍 REFERRAL DEBUG INFO:");
  console.log("📤 Referral address used:", referralAddress);
  console.log("👤 Referrer address:", referrerAddress);
  
  // Check for common issues
  if (!referralAddress) {
    console.log("❌ ERROR: No referral address provided");
    return false;
  }
  
  if (referralAddress === referrerAddress) {
    console.log("❌ ERROR: Self-referral attempt");
    return false;
  }
  
  if (referralAddress === "0x0000000000000000000000000000000000000000") {
    console.log("❌ ERROR: Zero address in referral");
    return false;
  }
  
  console.log("✅ Referral validation passed");
  return true;
};

// Analyze URL for referral params
export const analyzeReferralUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    const referralParam = parsedUrl.searchParams.get('ref');
    console.log("URL Analysis:", {
      origin: parsedUrl.origin,
      pathname: parsedUrl.pathname,
      searchParams: Object.fromEntries(parsedUrl.searchParams),
      refParam: referralParam
    });
    return { valid: !!referralParam, referralAddress: referralParam };
  } catch (err) {
    console.error("Error analyzing URL:", err);
    return { valid: false, error: err.message };
  }
};