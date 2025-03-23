import React from "react";

const WhyUs = () => {
  return (
    <section id="why_choose">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-8 offset-lg-2 col-md-12 col-sm-12">
            <div className="title_default_dark title_border text-center">
              <h4
                className="animation"
                data-animation="fadeInUp"
                data-animation-delay="0.2s"
              >
                Why Choose Us?
              </h4>
              <p
                className="animation"
                data-animation="fadeInUp"
                data-animation-delay="0.4s"
              >
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum. Perspiciatis
                unde omnis iste natus error sit.
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div
              className="box_wrap radius_box bg-white text-center animation"
              data-animation="fadeInUp"
              data-animation-delay="0.6s"
            >
              <img src="assets/images/wc_icon1.png" alt="wc_icon1" />
              <h4>Fully Secured Data</h4>
              <p>
                Cryptocash bitcoin ensures every block and transaction it
                accepts is a valid, increasing not only your security but also
                helping prevent miners and banks from taking control of Bitcoin.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12">
            <div
              className="box_wrap radius_box bg-white text-center animation"
              data-animation="fadeInUp"
              data-animation-delay="0.8s"
            >
              <img src="assets/images/wc_icon2.png" alt="wc_icon2" />
              <h4>A Better User Interface</h4>
              <p>
                Bitcoin wallet has features most other wallets don't have. But
                if you don't need them, you can use several other wallets on top
                of Bitcoin without losing Bitcoin Core's security and privacy
                benefits.
              </p>
            </div>
          </div>
          <div className="col-lg-4 offset-lg-0 col-md-6 offset-md-3 col-sm-12">
            <div
              className="box_wrap radius_box bg-white text-center animation"
              data-animation="fadeInUp"
              data-animation-delay="1s"
            >
              <img src="assets/images/wc_icon3.png" alt="wc_icon3" />
              <h4>Support The Network</h4>
              <p>
                Bitcoin helps support other peers.This isn't as useful as
                helping to keep Bitcoin decentralized, but it's an easy way for
                broadband users to contribute to less well-connected users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
