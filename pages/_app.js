// pages/_app.js

import "@rainbow-me/rainbowkit/styles.css";
import { Web3Provider } from "../context/Web3Context";
import { NotificationProvider } from "../context/NotificationContext";
import "../styles/globals.css";
import Head from 'next/head'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  

import { config } from "../provider/wagmiConfigs";
import Header from "../components/Header";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// Initialize query client outside component to prevent recreation on re-renders
const queryClient = new QueryClient();

// Polyfill for older browsers, especially iOS Safari
const polyfillWebSocket = () => {
  if (typeof window !== 'undefined') {
    // Polyfill TextEncoder for old iOS Safari versions
    if (typeof window.TextEncoder === 'undefined') {
      console.log('Polyfilling TextEncoder for older browser compatibility');
      window.TextEncoder = function TextEncoder() {};
      window.TextEncoder.prototype.encode = function(str) {
        const Len = str.length;
        let resArr = new Uint8Array(Len * 3);
        let resPos = 0;
        let resLen = 0;
        
        for (let i = 0; i < Len; i++) {
          let codePnt = str.charCodeAt(i);
          if (codePnt < 0x80) {
            resArr[resPos++] = codePnt;
            resLen++;
          } else if (codePnt < 0x800) {
            resArr[resPos++] = 0xc0 | (codePnt >> 6);
            resArr[resPos++] = 0x80 | (codePnt & 0x3f);
            resLen += 2;
          } else if (codePnt < 0xd800 || codePnt >= 0xe000) {
            resArr[resPos++] = 0xe0 | (codePnt >> 12);
            resArr[resPos++] = 0x80 | ((codePnt >> 6) & 0x3f);
            resArr[resPos++] = 0x80 | (codePnt & 0x3f);
            resLen += 3;
          }
        }
        return resArr.subarray(0, resLen);
      };
    }
    
    // Fix for Safari older than 14.1 (promise support for crypto.subtle)
    if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
      window.crypto.subtle = window.crypto.webkitSubtle;
    }
  }
};

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Apply polyfills
    polyfillWebSocket();
    
    // Handle visibility change for mobile browsers to improve wallet reconnection
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check connection status when user returns to the app
        const checkConnection = async () => {
          if (window.ethereum) {
            const isConnected = await window.ethereum.isConnected?.();
            if (!isConnected) {
              console.log("Connection lost, refreshing...");
              window.location.reload();
            }
          }
        };
        
        setTimeout(checkConnection, 1000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Detect WalletConnect deep links
    const handleWalletConnectDeepLink = () => {
      const url = window.location.href;
      if (url.includes('wc?uri=') || url.includes('wc:/')) {
        console.log("WalletConnect deep link detected:", url);
        // The deep link handling will be managed by the wallet connection logic
      }
    };
    
    handleWalletConnectDeepLink();
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <>
    <Head>
        <link rel="icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
  <link rel="stylesheet" href="assets/css/animate.css" />
  <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css" />
  <link rel="stylesheet" href="assets/css/style.css" />
  <link rel="stylesheet" href="assets/css/responsive.css" />
  <link rel="stylesheet" href="assets/css/spop.min.css" />
  
  {/* Add viewport meta tag with proper settings for mobile */}
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  
  {/* Add Web App capability for iOS */}
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#E0AD6B",
              accentColorForeground: "white",
              borderRadius: "small",
              fontStack: "system",
              overlayBlur: "small",
            })}
          >
            <Web3Provider>
              <NotificationProvider>
                <div className="min-h-screen bg-[#1A1A1A]">
                  <Component {...pageProps} />
                </div>
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
              </NotificationProvider>
            </Web3Provider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
      
      <script src="assets/js/jquery-1.12.4.min.js"></script>
      <script src="assets/bootstrap/js/bootstrap.min.js"></script>
      <script src="assets/owlcarousel/js/owl.carousel.min.js"></script>
      <script src="assets/js/magnific-popup.min.js"></script>
      <script src="assets/js/waypoints.min.js"></script>
      <script src="assets/js/parallax.js"></script>
      <script src="assets/js/particles.min.js"></script>
      <script src="assets/js/jquery.dd.min.js"></script>
      <script src="assets/js/jquery.counterup.min.js"></script>
      <script src="assets/js/spop.min.js"></script>
      <script src="assets/js/notification.js"></script>

      <script src="assets/js/scripts.js"></script>
    </>
  );
}

export default MyApp;
