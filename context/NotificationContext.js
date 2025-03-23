import React, { createContext, useContext } from "react";
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const showNotification = (message, type = "info") => {
    // Handle different error types
    switch (type) {
      case "error":
        if (message.includes("insufficient funds")) {
          toast.error("Insufficient BNB for gas fees. Please get BNB from any exchange.");
        } else if (message.includes("user rejected")) {
          toast.info("Transaction cancelled by user");
        } else if (message.includes("network changed")) {
          toast.warning("Please connect to BSC mainnet");
        } else {
          toast.error(formatErrorMessage(message));
        }
        break;
      case "success":
        toast.success(message);
        break;
      case "info":
        toast.info(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      default:
        toast(message);
    }
  };

  // Helper function to format error messages
  const formatErrorMessage = (error) => {
    if (typeof error === 'string') {
      // Remove technical details and keep user-friendly message
      if (error.includes("execution reverted")) {
        const match = error.match(/execution reverted:(.*?)"/);
        return match ? match[1].trim() : "Transaction failed";
      }
      return error;
    }
    if (error?.data?.message) {
      return error.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return "An error occurred";
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);