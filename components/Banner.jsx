import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';
import { useWeb3 } from "../context/Web3Context";
import { CustomConnectButton } from "./ConnectButton";
import CountdownTimer from "./CountdownTimer/CountdownTimer";
import AirdropBanner from "./AirdropBanner/AirdropBanner";
import UserDetailsModal from "./UserDetailsModal/UserDetailsModal";
import AddTokenButton from "./AddTokenButton";
import { ButtonSkeleton } from "./SkeletonLoader/SkeletonLoader";
import { useAdmin } from "../context/AdminContext";

const ADMIN = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;

const Banner = ({
  airdropInfo,
  handleParticipate,
  handleParticipateWithoutReferral,
  activeUser,
  setReferralAddress,
  account,
  setIsAdminModalOpen,
  dataLoading,
  dataError,
  onRetry,
  loading,
}) => {
  const { isAdmin, getAdminRole } = useAdmin();
  const router = useRouter();
  const [isReferral, setIsReferral] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nextClaimTime, setNextClaimTime] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const { contract } = useWeb3();

  useEffect(() => {
    // Simplified referral detection that prioritizes query parameters
    const checkReferral = () => {
      // Check if we're in the browser
      if (typeof window === "undefined") return;
      
      // Get ref from query parameters
      const { ref } = router.query;
      
      // Check if ref is a valid address in query params
      if (ref && /^0x[a-fA-F0-9]{40}$/i.test(ref)) {
        setIsReferral(true);
        setReferralAddress(ref);
        console.log("Referral detected from query:", ref);
        return;
      }
      
      // Fallback: check for legacy path formats if ref query param is not found
      const pathname = window.location.pathname;
      
      // Check for /ref/0x... format
      const pathMatch = pathname.match(/\/ref\/(0x[a-fA-F0-9]{40})/i);
      if (pathMatch) {
        setIsReferral(true);
        setReferralAddress(pathMatch[1]);
        console.log("Referral detected from path:", pathMatch[1]);
        return;
      }
      
      // Check for ref/0x... format without leading slash
      const legacyPathMatch = pathname.match(/ref\/(0x[a-fA-F0-9]{40})/i);
      if (legacyPathMatch) {
        setIsReferral(true);
        setReferralAddress(legacyPathMatch[1]);
        console.log("Referral detected from legacy path:", legacyPathMatch[1]);
        return;
      }
      
      console.log("No referral detected in URL");
    };
    
    checkReferral();
  }, [router.query, setReferralAddress]);

  useEffect(() => {
    const checkClaimStatus = async () => {
      if (contract && account) {
        const nextTime = await contract.getNextClaimTime(account);
        setNextClaimTime(Number(nextTime));
        setCanClaim(Date.now() / 1000 >= Number(nextTime));
      }
    };

    checkClaimStatus();
    const interval = setInterval(checkClaimStatus, 1000);
    return () => clearInterval(interval);
  }, [contract, account]);

  const formatTimeLeft = (nextClaimTime) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = nextClaimTime - now;
    if (diff <= 0) return "Ready";
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleClaimClick = () => {
    if (!canClaim) {
      const timeLeft = formatTimeLeft(nextClaimTime);
      alert(`Please wait ${timeLeft} before claiming again`);
      return;
    }
    if (isReferral) {
      handleParticipate();
    } else {
      handleParticipateWithoutReferral();
    }
  };

  return (
    <>
      <section
        id="home_section"
        className="section_banner banner_bg1 banner_shape body-background"
      >
        {/* Add responsive CSS for mobile */}
        <style jsx>{`
          @media (max-width: 767px) {
            .mobile-airdrop-title {
              margin-top: 60px !important;
              font-size: 12px !important;
              padding: 6px 10px !important;
              max-width: 80% !important;
              margin-left: auto !important;
              margin-right: auto !important;
            }
            .banner_inner {
              padding-top: 15px;
            }
          }
        `}</style>
        <div className="banner_rouded_bg blue_light_bg" />
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12 col-sm-12 order-lg-first">
              <div className="banner_text text_md_center">
                <h1
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="1.1s"
                >
                  Tinseltoken (TNTC): Revolutionizing Blockchain Accessibility
                </h1>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="1.3s"
                >
                  Tinseltoken (TNTC) is offering a massive airdrop of 140 million tokens (70% of total supply). 
                  Distribute in April 2025, this airdrop aims to democratize blockchain access and foster global community engagement.
                   Claim your free TNTC tokens through our simple 3-step process!
                </p>
                <div
                  className="btn_group animation"
                  data-animation="fadeInUp"
                  data-animation-delay="1.4s"
                >
                  <a
                    target="_blank"
                    href="assets/images/roadmap.pdf"
                    className="btn btn-default btn-radius "
                  >
                    Whitepaper
                  </a>

                  {account && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="btn btn-default btn-radius"
                    >
                      Referral
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-5 offset-lg-1 col-md-12 col-sm-12 order-first">
              <div className="banner_inner res_md_mb_50 res_xs_mb_30" style={{ position: 'relative' }}>
                <h6
                  className="animation alert alert-warning text-uppercase mobile-airdrop-title"
                  data-animation="fadeInUp"
                  data-animation-delay="1s"
                  style={{
                    padding: '8px 15px',
                    marginTop: '20px',
                    fontSize: '14px',
                    textAlign: 'center',
                    borderRadius: '20px',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    zIndex: 1
                  }}
                >
                  {airdropInfo?.tokenSymbol} AIRDROP ONGOING...
                </h6>
                <div
                  className="tk_countdown text-center animation bg-white"
                  style={{
                    marginTop: '15px',
                    padding: '20px 15px',
                    borderRadius: '10px',
                    boxShadow: '0 0 15px rgba(0,0,0,0.1)'
                  }}
                  data-animation="fadeIn"
                  data-animation-delay="1.1s"
                >
                  <div className="banner_text tk_counter_inner">
                    {/* Show error state with retry */}
                    {dataError && account && (
                      <div className="text-center mb-3 p-3 bg-red-100 border border-red-300 rounded">
                        <div className="text-red-600 mb-2">Failed to load data</div>
                        <button
                          onClick={onRetry}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    <CountdownTimer
                      airdropInfo={airdropInfo}
                      isLoading={dataLoading}
                      hasError={!!dataError}
                    />

                    <AirdropBanner
                      airdropInfo={airdropInfo}
                      isLoading={dataLoading}
                      hasError={!!dataError}
                    />
                    {!account ? (
                      <CustomConnectButton />
                    ) : dataLoading ? (
                      <div className="d-flex flex-column gap-2">
                        <ButtonSkeleton width="160px" height="45px" />
                        <ButtonSkeleton width="140px" height="40px" />
                      </div>
                    ) : (
                      <>
                        <button
                          className="btn btn-default btn-radius animation"
                          data-animation="fadeInUp"
                          data-animation-delay="1.40s"
                          onClick={handleClaimClick}
                          disabled={loading || (!canClaim && activeUser?.hasParticipated)}
                        >
                          {loading
                            ? "Processing..."
                            : !activeUser?.hasParticipated
                              ? "Claim Airdrop"
                              : canClaim
                                ? "Claim Again"
                                : `Next Claim: ${formatTimeLeft(nextClaimTime)}`
                          }
                        </button>

                        <Link
                          href="/dashboard"
                          className="btn btn-default btn-radius animation"
                          data-animation="fadeInUp"
                          data-animation-delay="1.45s"
                        >
                          Go To Dashboard
                        </Link>
                      </>
                    )}

                    {account && (
                      dataLoading ? (
                        <ButtonSkeleton width="120px" height="40px" />
                      ) : (
                        <AddTokenButton />
                      )
                    )}

                    {isAdmin(account) && (
                      dataLoading ? (
                        <ButtonSkeleton width="140px" height="40px" />
                      ) : (
                        <button
                          onClick={() => setIsAdminModalOpen(true)}
                          className="btn btn-default btn-radius animation"
                          data-animation="fadeInUp"
                          data-animation-delay="1.50s"
                          title={getAdminRole(account)}
                        >
                          Admin Dashboard
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        airdropInfo={airdropInfo}
        activeUser={activeUser}
        account={account}
      />
    </>
  );
};

export default Banner;