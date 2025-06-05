import React, { useState, useEffect } from "react";
import Link from 'next/link'; // Add this import at the top

import { CustomConnectButton } from "./ConnectButton";
import NetworkIndicator from "./NetworkIndicator/NetworkIndicator";

const MainHeader = () => {
  return (
    <header className="header_wrap fixed-top">
      <div className="container-fluid">
        <nav className="navbar navbar-expand-lg" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 15px'
        }}>
          {/* Logo Section */}
          <a className="navbar-brand page-scroll" href="#home_section" style={{
            margin: 0,
            padding: 0,
            flex: '0 0 auto'
          }}>
            <img
              className="logo_light"
              src="assets/images/logo.png"
              alt="logo"
              style={{
                maxWidth: '80px',
                height: 'auto'
              }}
            />
            <img
              className="logo_dark"
              src="assets/images/logo_dark.png"
              alt="logo"
              style={{
                maxWidth: '80px',
                height: 'auto'
              }}
            />
          </a>

          {/* Spacer - pushes content to edges */}
          <div style={{ flex: '1 1 auto' }}></div>

          {/* Right Section - Network Indicator & Connect Button */}
          <div style={{
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <NetworkIndicator />
            <CustomConnectButton />
          </div>
        </nav>
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        .header_wrap {
          background: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .navbar-brand img {
            max-width: 60px !important;
          }

          .header_wrap .container-fluid {
            padding: 0 10px;
          }

          .navbar {
            padding: 5px 10px !important;
            min-height: 60px;
          }

          /* Adjust right section spacing for tablet */
          .navbar > div:nth-child(3) {
            gap: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .navbar-brand img {
            max-width: 50px !important;
          }

          .navbar {
            padding: 3px 8px !important;
            min-height: 55px;
          }

          .header_wrap .container-fluid {
            padding: 0 8px;
          }

          /* Adjust right section for mobile */
          .navbar > div:nth-child(3) {
            gap: 6px !important;
          }

          /* Make network indicator more compact on mobile */
          .network-indicator {
            padding: 3px 5px !important;
          }
        }

        @media (max-width: 360px) {
          .navbar-brand img {
            max-width: 45px !important;
          }

          .navbar {
            padding: 2px 5px !important;
            min-height: 50px;
          }

          /* Further adjust right section for very small screens */
          .navbar > div:nth-child(3) {
            gap: 4px !important;
          }

          .network-indicator {
            padding: 2px 4px !important;
          }
        }

        @media (max-width: 320px) {
          .navbar-brand img {
            max-width: 40px !important;
          }

          .navbar {
            padding: 2px 4px !important;
            min-height: 48px;
          }

          /* Ultra small screens - minimal spacing */
          .navbar > div:nth-child(3) {
            gap: 3px !important;
          }

          .network-indicator {
            padding: 2px 3px !important;
          }
        }
      `}</style>
    </header>
  );
};

export default MainHeader;
