import React from "react";

const VIDEO = process.env.NEXT_PUBLIC_VIDEO;

const AboutUs = () => {
  return (
    <section id="about" className="pt-0">
      <div className="container">
        <div className="row">
          <div className="col-lg-5 col-md-12 col-sm-12 p-0">
            <div className="text-center about_img about_img_shape d-flex h-100 align-items-center">
              <img
                className="animation"
                data-animation="zoomIn"
                data-animation-delay="0.2s"
                src="assets/images/about_img.png"
                alt="aboutimg"
              />
            </div>
          </div>
          <div className="col-lg-7 col-md-12 col-sm-12 p-0">
            <div className="about_section about_shape">
              <div className="title_default_light">
                <h4
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s"
                >
                  About The Cryptocash
                </h4>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.4s"
                >
                  Cryptocash is one of the most transformative technologies
                  since the invention of the Internet. Cryptocash stands firmly
                  in support of financial freedom and the liberty that Bitcoin
                  provides globally for anyone to voluntarily participate in a
                  permissionless and decentralized network.
                </p>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.6s"
                >
                  which empowers people to not be marginalized by governments
                  and financial institutions. There are many variations of
                  passages of Lorem Ipsum available, but the majority have
                  suffered alteration in some form, by injected humour, or
                  randomised words which don't look even slightly believable.
                </p>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.8s"
                >
                  If you are going to use a passage of Lorem Ipsum, you need to
                  be sure there isn't anything embarrassing hidden in the middle
                  of text.
                </p>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${VIDEO}`}
                className="btn btn-primary video animation"
                data-animation="fadeInUp"
                data-animation-delay="1s"
              >
                <span className=" gradient_box">
                  <svg
                    class="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
                Let's Start
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
