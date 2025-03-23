import React from "react";

const Timeline = () => {
  return (
    <section
      id="roadmap"
      className="blue_light_bg"
      data-z-index={1}
      data-parallax="scroll"
      data-image-src="assets/images/roadmap_bg.png"
    >
      <div className="container">
        <div className="row text-center">
          <div className="col-lg-8 col-md-12 offset-lg-2">
            <div className="title_default_light title_border text-center">
              <h4
                className="animation"
                data-animation="fadeInUp"
                data-animation-delay="0.2s"
              >
                Roadmap
              </h4>
              <p
                className="animation"
                data-animation="fadeInUp"
                data-animation-delay="0.4s"
              >
                The use of crypto-currencies has become more widespread, and
                they are now increasingly accepted as a legitimate currency for
                transactions.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12 pl-0 pr-0 row">
            <div className="item">
              <div className="roadmap_box rd_complete">
                <div className="roadmap_inner">
                  <div className="icon_roadmap">
                    <i
                      className="fa fa-bullhorn animation"
                      data-animation="fadeInDown"
                      data-animation-delay="0.2s"
                    />
                  </div>
                  <div className="roadmap_icon" />
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.3s"
                  >
                    Aprile 2018
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.4s"
                  >
                    Inotial Coin Distribution &amp; maketing
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="roadmap_box rd_complete current">
                <div className="roadmap_inner">
                  <div className="icon_roadmap">
                    <i
                      className="fa fa-refresh animation"
                      data-animation="fadeInDown"
                      data-animation-delay="0.4s"
                    />
                  </div>
                  <div className="roadmap_icon" />
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.3s"
                  >
                    February 2018
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.4s"
                  >
                    Exchange Cryptocash to Bitcoin
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="roadmap_box">
                <div className="roadmap_inner">
                  <div className="icon_roadmap">
                    <i
                      className="fa fa-money animation"
                      data-animation="fadeInDown"
                      data-animation-delay="0.6s"
                    />
                  </div>
                  <div className="roadmap_icon" />
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.3s"
                  >
                    March 2018
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.4s"
                  >
                    BTCC mode of payment in Cryptocash
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="roadmap_box">
                <div className="roadmap_inner">
                  <div className="icon_roadmap">
                    <i
                      className="fa fa-recycle animation"
                      data-animation="fadeInDown"
                      data-animation-delay="0.8s"
                    />
                  </div>
                  <div className="roadmap_icon" />
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.3s"
                  >
                    June 2018
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.4s"
                  >
                    Send-Receive coin Cryptocash &amp; mobile
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="roadmap_box">
                <div className="roadmap_inner">
                  <div className="icon_roadmap">
                    <i
                      className="fa fa-globe animation"
                      data-animation="fadeInDown"
                      data-animation-delay="1s"
                    />
                  </div>
                  <div className="roadmap_icon" />
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.3s"
                  >
                    October 2018
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.4s"
                  >
                    Coin Marketcap, World Coin Index
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="roadmap_box">
                <div className="roadmap_inner">
                  <div className="icon_roadmap">
                    <i
                      className="fa fa-sitemap animation"
                      data-animation="fadeInDown"
                      data-animation-delay="1.2s"
                    />
                  </div>
                  <div className="roadmap_icon" />
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.3s"
                  >
                    December 2018
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.4s"
                  >
                    Online &amp; Trading ICO Token Sale
                  </p>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="roadmap_box">
                <div className="roadmap_inner">
                  <div className="icon_roadmap">
                    <i
                      className="fa fa-user-circle animation"
                      data-animation="fadeInDown"
                      data-animation-delay="1.4s"
                    />
                  </div>
                  <div className="roadmap_icon" />
                  <h6
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.3s"
                  >
                    December 2018
                  </h6>
                  <p
                    className="animation"
                    data-animation="fadeInUp"
                    data-animation-delay="0.4s"
                  >
                    Deposit Bitcoin from your account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
