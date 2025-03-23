import React from "react";
import Link from 'next/link'; // Add this import at the top

import { CustomConnectButton } from "./ConnectButton";

const MainHeader = () => {
  return (
    <header className="header_wrap fixed-top">
      <div className="container-fluid">
        <nav className="navbar navbar-expand-lg">
          <a className="navbar-brand page-scroll " href="#home_section">
            <img
              className="logo_light"
              src="assets/images/logo.png"
              alt="logo"
            />
            <img
              className="logo_dark"
              src="assets/images/logo_dark.png"
              alt="logo"
            />
          </a>

          {/* <CustomConnectButton /> */}
{/* 
          <button className="navbar-toggler " type="button">
            <span className="ion-android-menu" />
          </button> */}
          
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav m-auto">
              {/* <li className=" ">
                <a className="nav-link  active">Home</a>
              </li>
              <li className="">
                <a className="nav-link page-scroll nav_item" href="#why_choose">
                  Why Choose
                </a>
              </li>
              <li className="">
                <a className="nav-link page-scroll nav_item" href="#about">
                  About
                </a>
              </li>
              <li className="">
                <a className="nav-link page-scroll nav_item" href="#token">
                  Token
                </a>
              </li>

              <li className="">
                <a className="nav-link page-scroll nav_item" href="#team">
                  Team
                </a>
              </li>
              <li className="">
                <a className="nav-link page-scroll nav_item" href="#faq">
                  FAQ
                </a>
              </li>
              <li className="">
                <a className="nav-link page-scroll nav_item" href="#contact">
                  Contact
                </a>
              </li> */}

              {/* <li>
              <Link href="/dashboard" className="navLink">
              Dashboard
            </Link>
              </li> */}
            </ul>
           
          </div>
          <CustomConnectButton />
        </nav>
      </div>
    </header>
  );
};

export default MainHeader;
