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

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  const siteTitle = "Tinseltoken Airdrop DApp";
  const siteDescription = "Claim your Tinseltoken (TNTC) airdrop tokens and earn rewards through referrals";
  const siteUrl = "https://thetinseltoken.com";
  const siteImage = "https://thetinseltoken.com/assets/images/logo.png";

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
  <link rel="stylesheet" href="assets/css/animate.css" />
  <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css" />
  <link rel="stylesheet" href="assets/css/style.css" />
  <link rel="stylesheet" href="assets/css/responsive.css" />
  <link rel="stylesheet" href="assets/css/spop.min.css" />
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
      <script src="/pwa.js"></script>
    </>
  );
}

export default MyApp;
