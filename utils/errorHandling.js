export const handleTransactionError = (error, showNotification) => {
    console.error("Transaction error:", error);
    
    const errorMessages = {
      ACTION_REJECTED: "Transaction cancelled by user",
      INSUFFICIENT_FUNDS: "Insufficient BNB for gas fees. Please get BNB from any exchange and try again...",
      NETWORK_ERROR: "Network error. Please check your connection and try again.",
      UNPREDICTABLE_GAS_LIMIT: "Transaction cannot be completed. Please try again.",
      CALL_EXCEPTION: "Contract call failed. Please try again.",
    };

    // Check if it's a JSON-RPC error with insufficient funds
    if (error?.code === -32603 || error?.code === -32000) {
      const errorMsg = error.message || (error.data && error.data.message) || "";
      const errorString = JSON.stringify(error);

      if (
        errorMsg.includes("insufficient funds") || 
        errorString.includes("insufficient funds") ||
        (error.data && error.data.message && error.data.message.includes("insufficient funds"))
      ) {
        showNotification("⚠️ Insufficient BNB to pay for gas fees. Please add some BNB to your wallet and try again.", "error");
        return;
      }
    }
  
    // Default error handling
    const errorMessage = errorMessages[error.code] || error.message || "Transaction failed";
    showNotification(errorMessage, "error");
  };

// Handle contract errors and return user-friendly messages
export const handleContractError = (error) => {
  // Check for JSON-RPC errors with insufficient funds
  if (error?.code === -32603) {
    if (error.data && error.data.message && error.data.message.includes("insufficient funds")) {
      return "Insufficient BNB to pay for gas fees. Please add some BNB to your wallet and try again.";
    }
    // Try to parse the error message if it's a stringified JSON
    try {
      if (typeof error.message === 'string' && error.message.includes('{')) {
        const errorObj = JSON.parse(error.message.substring(error.message.indexOf('{')));
        if (errorObj.data && errorObj.data.message && errorObj.data.message.includes("insufficient funds")) {
          return "Insufficient BNB to pay for gas fees. Please add some BNB to your wallet and try again.";
        }
      }
    } catch (e) {
      // Ignore parse errors, continue with normal error handling
    }
  }

  const errorMessage = error.message || "Transaction failed";
  
  // Check for common contract revert reasons
  if (errorMessage.includes("user rejected transaction")) {
    return "Transaction was rejected by the user";
  } else if (errorMessage.includes("insufficient funds")) {
    return "Insufficient BNB to pay for gas fees. Please add some BNB to your wallet and try again.";
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

// Get a user-friendly error message from various error formats 
export const parseWalletError = (error) => {
  if (!error) return "An unknown error occurred";
  
  // Handle structured errors
  if (error.code === 4001 || (error.code && error.code === "ACTION_REJECTED")) {
    return "Transaction was rejected by user";
  }
  
  // Handle JSON-RPC errors
  if (error.code === -32603 || error.code === -32000) {
    // Check error message and error.data
    if (error.data && error.data.message) {
      if (error.data.message.includes("insufficient funds")) {
        return "Insufficient BNB to pay for gas fees. Please add some BNB to your wallet and try again.";
      }
    }
    
    // Try to parse error message if it's JSON
    try {
      if (typeof error.message === 'string') {
        if (error.message.includes("insufficient funds")) {
          return "Insufficient BNB to pay for gas fees. Please add some BNB to your wallet and try again.";
        }
        
        // Try to extract JSON from error message
        if (error.message.includes('{')) {
          const jsonStart = error.message.indexOf('{');
          const errorObj = JSON.parse(error.message.substring(jsonStart));
          
          if (errorObj.data && errorObj.data.message) {
            if (errorObj.data.message.includes("insufficient funds")) {
              return "Insufficient BNB to pay for gas fees. Please add some BNB to your wallet and try again.";
            }
            return errorObj.data.message;
          }
        }
      }
    } catch (e) {
      // Parsing failed, continue
    }
  }
  
  // Default message
  return error.message || "Transaction failed. Please try again.";
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