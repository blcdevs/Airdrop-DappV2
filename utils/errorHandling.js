export const handleTransactionError = (error, showNotification) => {
    console.error("Transaction error:", error);
    
    // Function to deeply inspect error objects for insufficient funds messages
    const containsInsufficientFundsMessage = (obj) => {
      if (!obj || typeof obj !== 'object') return false;
      
      // Check direct message properties
      if (typeof obj.message === 'string' && obj.message.includes("insufficient funds")) return true;
      
      // Check data.message
      if (obj.data && typeof obj.data.message === 'string' && obj.data.message.includes("insufficient funds")) return true;
      
      // Check for stringified JSON in stack that might contain error info
      if (typeof obj.stack === 'string') {
        try {
          // Some errors have JSON stringified in the stack
          const stackJsonMatch = obj.stack.match(/{[\s\S]*}/);
          if (stackJsonMatch) {
            const parsedStack = JSON.parse(stackJsonMatch[0]);
            if (
              parsedStack.data && 
              typeof parsedStack.data.message === 'string' && 
              parsedStack.data.message.includes("insufficient funds")
            ) {
              return true;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Recursively check nested error objects
      if (obj.error) return containsInsufficientFundsMessage(obj.error);
      if (obj.data) return containsInsufficientFundsMessage(obj.data);
      
      return false;
    };
    
    // Check for insufficient funds errors using our deep inspection
    if (containsInsufficientFundsMessage(error)) {
      showNotification("Insufficient BNB for gas fees and transaction value. Please add BNB to your wallet and try again.", "error");
      return;
    }
    
    // Check specifically for JSON-RPC errors that often contain nested error data
    if (error && error.code === -32603) {
      console.log("Handling JSON-RPC error:", error);
      
      // Extract the nested error data that contains the actual error message
      const errorData = error.data || {};
      const dataMessage = errorData.message || '';
      
      // Check if the nested error contains insufficient funds message
      if (dataMessage.includes("insufficient funds")) {
        showNotification("Insufficient BNB for gas fees and transaction value. Please add BNB to your wallet and try again.", "error");
        return;
      }
    }
    
    // Check for RPC errors that contain insufficient funds messages in other formats
    if (error && typeof error === 'object') {
      // Check for nested error messages that might contain "insufficient funds"
      const errorMessage = error.message || '';
      const errorData = error.data || {};
      const dataMessage = errorData.message || '';
      
      // Check various error formats that might indicate insufficient funds
      if (
        errorMessage.includes("insufficient funds") || 
        dataMessage.includes("insufficient funds") || 
        (error.error && error.error.message && error.error.message.includes("insufficient funds"))
      ) {
        showNotification("Insufficient BNB for gas fees and transaction value. Please add BNB to your wallet and try again.", "error");
        return;
      }
    }
    
    // Handle other known error types
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