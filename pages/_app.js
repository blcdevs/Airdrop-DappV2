// pages/_app.js

import "@rainbow-me/rainbowkit/styles.css";
import { Web3Provider } from "../context/Web3Context";
import { NotificationProvider } from "../context/NotificationContext";
import { NetworkProvider } from "../context/NetworkContext";
import { AdminProvider } from "../context/AdminContext";
import "../styles/globals.css";
import Head from 'next/head';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { config } from "../provider/wagmiConfigs";
import Header from "../components/Header";
import ErrorBoundary from "../components/ErrorBoundary";
import OfflineNotification from "../components/OfflineNotification/OfflineNotification";
import MobileConnectionStatus from "../components/MobileConnectionStatus";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

import { useState, useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  const siteTitle = "Tinseltoken Airdrop DApp";
  const siteDescription = "Claim your Tinseltoken (TNTC) airdrop tokens and earn rewards through referrals";
  const siteUrl = "https://thetinseltoken.com";
  const siteImage = "https://thetinseltoken.com/assets/images/logo.png";

  // Add client-side only rendering to prevent hydration errors
  const [mounted, setMounted] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  
  useEffect(() => {
    // Clear any lingering localStorage items that might cause issues
    try {
      // Only clear specific items that might cause refresh issues
      const itemsToClear = [
        'wagmi.connected',
        'wagmi.injected.shimDisconnect',
        'walletconnect',
        'wc@2:client:0.3//session',
        'wc@2:core:0.3//keychain',
        'wc@2:core:0.3//messages'
      ];
      itemsToClear.forEach(item => {
        if (localStorage.getItem(item)) {
          localStorage.removeItem(item);
        }
      });
    } catch (e) {
      console.log('localStorage not available');
    }

    // Mobile-specific optimizations
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      }

      // Add mobile-specific error handling
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection on mobile:', event.reason);
        event.preventDefault();
      });
    }

    // Set mounted state to true
    setMounted(true);

    // Add error boundary for the whole app
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
      // Don't immediately set error state on mobile - give it a chance to recover
      if (!isMobile) {
        setErrorLoading(true);
      }
    });

    return () => {
      window.removeEventListener('error', () => {});
      window.removeEventListener('unhandledrejection', () => {});
    };
  }, []);

  return (
    <>
    <Head>
        <title>{siteTitle}</title>
        <link rel="icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Primary Meta Tags */}
        <meta name="title" content={siteTitle} />
        <meta name="description" content={siteDescription} />
        <meta name="theme-color" content="#E0AD6B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TNTC Airdrop" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={siteImage} />
        <meta property="og:site_name" content={siteTitle} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={siteUrl} />
        <meta property="twitter:title" content={siteTitle} />
        <meta property="twitter:description" content={siteDescription} />
        <meta property="twitter:image" content={siteImage} />
        
        {/* WhatsApp specific */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <link rel="stylesheet" href="/assets/css/animate.css" />
        <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/responsive.css" />
        <link rel="stylesheet" href="/assets/css/spop.min.css" />
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
            {/* Error state - show error UI instead of normal app */}
            {errorLoading ? (
              <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-4">
                <div className="text-white text-xl mb-4">Something went wrong</div>
                <button 
                  className="bg-[#E0AD6B] hover:bg-[#d9a05e] text-white font-bold py-2 px-4 rounded"
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </button>
                <button 
                  className="mt-2 bg-transparent border border-[#E0AD6B] hover:bg-[#E0AD6B] text-white font-bold py-2 px-4 rounded"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </button>
              </div>
            ) : mounted ? (
              /* Normal app UI - only rendered client-side after mounting */
              <ErrorBoundary>
                <AdminProvider>
                  <NetworkProvider>
                    <Web3Provider>
                      <NotificationProvider>
                        <div className="min-h-screen bg-[#1A1A1A]">
                          <Component {...pageProps} />
                        </div>
                        <MobileConnectionStatus />
                        <OfflineNotification />
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
                  </NetworkProvider>
                </AdminProvider>
              </ErrorBoundary>
            ) : (
              /* Loading placeholder - shown before client-side rendering */
              <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white text-xl mb-4">Loading Airdrop DApp...</div>
                  <div className="w-16 h-16 border-4 border-t-[#E0AD6B] border-b-[#E0AD6B] border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              </div>
            )}
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
      <script src="/pwa.js"></script>
    </>
  );
}

export default MyApp;
