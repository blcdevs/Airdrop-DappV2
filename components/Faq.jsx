import React from "react";

const Faq = () => {
  return (
    <section id="faq">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-md-12 offset-lg-2">
            <div className="title_default_dark title_border text-center">
              <h4
                className="animation"
                data-animation="fadeInUp"
                data-animation-delay="0.2s"
              >
                Frequently Asked Questions
              </h4>
              <p
                className="animation"
                data-animation="fadeInUp"
                data-animation-delay="0.4s"
              >
                Frequently asked questions (FAQ) or Questions and Answers
                (Q&amp;A), are listed questions and answers, all supposed to be
                commonly asked in some context
              </p>
            </div>
          </div>
        </div>
        <div className="row small_space">
          <div className="col-lg-8 col-md-12 offset-lg-2">
            <div className="tab_content">
              <ul
                className="nav nav-pills tab_nav_s2 justify-content-center"
                id="pills-tab"
                role="tablist"
              >
                <li
                  className="nav-item animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.5s"
                >
                  <a className="active" data-toggle="tab" href="#tab1">
                    General
                  </a>
                </li>
                <li
                  className="nav-item animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.6s"
                >
                  <a data-toggle="tab" href="#tab2">
                    Pre-ICO &amp; ICC{" "}
                  </a>
                </li>
                <li
                  className="nav-item animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.7s"
                >
                  <a data-toggle="tab" href="#tab3">
                    ICO Tokens
                  </a>
                </li>
                <li
                  className="nav-item animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.8s"
                >
                  <a data-toggle="tab" href="#tab4">
                    Legal
                  </a>
                </li>
              </ul>
              <div className="tab-content">
                <div
                  className="tab-pane fade show active"
                  id="tab1"
                  role="tabpanel"
                >
                  <div id="accordion1" className="faq_question">
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.4s"
                    >
                      <div className="card-header" id="headingOne">
                        <h6 className="mb-0">
                          <a
                            data-toggle="collapse"
                            href="#collapseOne"
                            aria-expanded="true"
                            aria-controls="collapseOne"
                          >
                            What is cryptocurrency?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseOne"
                        className="collapse show"
                        aria-labelledby="headingOne"
                        data-parent="#accordion1"
                      >
                        <div className="card-body">
                          The best cryptocurrency to buy is one we are willing
                          to hold onto even if it goes down. For example, I
                          believe in Steem enough that I am willing to hold it
                          even if it goes down 99% and would start buying more
                          of it if the price dropped.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.6s"
                    >
                      <div className="card-header" id="headingTwo">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseTwo"
                            aria-expanded="false"
                            aria-controls="collapseTwo"
                          >
                            Which cryptocurrency is best to buy today?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseTwo"
                        className="collapse"
                        aria-labelledby="headingTwo"
                        data-parent="#accordion1"
                      >
                        <div className="card-body">
                          The best cryptocurrency to buy is one we are willing
                          to hold onto even if it goes down. For example, I
                          believe in Steem enough that I am willing to hold it
                          even if it goes down 99% and would start buying more
                          of it if the price dropped.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.8s"
                    >
                      <div className="card-header" id="headingThree">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseThree"
                            aria-expanded="false"
                            aria-controls="collapseThree"
                          >
                            How about day trading crypto?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseThree"
                        className="collapse"
                        aria-labelledby="headingThree"
                        data-parent="#accordion1"
                      >
                        <div className="card-body">
                          While profits are possible trading cryptocurrencies,
                          so are losses. My first year involved me spending
                          hundreds of hours trading Bitcoin with a result of
                          losing over $5,000 with nothing to show for it. Simply
                          trading digital currencies is very similar to gambling
                          because no one really knows what is going to happen
                          next although anyone can guess! While I was lucky to
                          do nothing expect lose money when I started, the worst
                          thing that can happen is to get lucky right away and
                          get a big ego about what an amazing cryptocurrency
                          trader we are.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="1s"
                    >
                      <div className="card-header" id="headingFour">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseFour"
                            aria-expanded="false"
                            aria-controls="collapseFour"
                          >
                            When to sell a cryptocurrency?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseFour"
                        className="collapse"
                        aria-labelledby="headingFour"
                        data-parent="#accordion1"
                      >
                        <div className="card-body">
                          Before Steem I was all in an another altcoin and
                          really excited about it. When I first bought the price
                          was low and made payments to me every week just for
                          holding it. As I tried to participate in the community
                          over the next several months, I was consistently met
                          with a mix of excitement and hostility. When I began
                          talking openly about this, the negative emotions won
                          over in the community and in me. Originally I had
                          invested and been happy to hold no matter what the
                          price which quickly went up after I bought it.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="tab2" role="tabpanel">
                  <div id="accordion2" className="faq_question">
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.4s"
                    >
                      <div className="card-header" id="headingFive">
                        <h6 className="mb-0">
                          <a
                            data-toggle="collapse"
                            href="#collapseFive"
                            aria-expanded="true"
                            aria-controls="collapseFive"
                          >
                            How does one acquire bitcoins?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseFive"
                        className="collapse show"
                        aria-labelledby="headingFive"
                        data-parent="#accordion2"
                      >
                        <div className="card-body">
                          While it may be possible to find individuals who wish
                          to sell bitcoins in exchange for a credit card or
                          PayPal payment, most exchanges do not allow funding
                          via these payment methods. This is due to cases where
                          someone buys bitcoins with PayPal, and then reverses
                          their half of the transaction. This is commonly
                          referred to as a chargeback.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.6s"
                    >
                      <div className="card-header" id="headingSix">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseSix"
                            aria-expanded="false"
                            aria-controls="collapseSix"
                          >
                            Can I make money with Bitcoin?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseSix"
                        className="collapse"
                        aria-labelledby="headingSix"
                        data-parent="#accordion2"
                      >
                        <div className="card-body">
                          You should never expect to get rich with Bitcoin or
                          any emerging technology. It is always important to be
                          wary of anything that sounds too good to be true or
                          disobeys basic economic rules.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.8s"
                    >
                      <div className="card-header" id="headingSeven">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseSeven"
                            aria-expanded="false"
                            aria-controls="collapseSeven"
                          >
                            What happens when bitcoins are lost?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseSeven"
                        className="collapse"
                        aria-labelledby="headingSeven"
                        data-parent="#accordion2"
                      >
                        <div className="card-body">
                          When a user loses his wallet, it has the effect of
                          removing money out of circulation. Lost bitcoins still
                          remain in the block chain just like any other
                          bitcoins. However, lost bitcoins remain dormant
                          forever because there is no way for anybody to find
                          the private key(s) that would allow them to be spent
                          again. Because of the law of supply and demand, when
                          fewer bitcoins are available, the ones that are left
                          will be in higher demand and increase in value to
                          compensate.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="1s"
                    >
                      <div className="card-header" id="headingEight">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseEight"
                            aria-expanded="false"
                            aria-controls="collapseEight"
                          >
                            Who controls the Bitcoin network?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseEight"
                        className="collapse"
                        aria-labelledby="headingEight"
                        data-parent="#accordion2"
                      >
                        <div className="card-body">
                          Nobody owns the Bitcoin network much like no one owns
                          the technology behind email. Bitcoin is controlled by
                          all Bitcoin users around the world. While developers
                          are improving the software, they can't force a change
                          in the Bitcoin protocol because all users are free to
                          choose what software and version they use.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="tab3" role="tabpanel">
                  <div id="accordion3" className="faq_question">
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.4s"
                    >
                      <div className="card-header" id="headingNine">
                        <h6 className="mb-0">
                          <a
                            data-toggle="collapse"
                            href="#collapseNine"
                            aria-expanded="true"
                            aria-controls="collapseNine"
                          >
                            How are bitcoins created?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseNine"
                        className="collapse show"
                        aria-labelledby="headingNine"
                        data-parent="#accordion3"
                      >
                        <div className="card-body">
                          New bitcoins are generated by a competitive and
                          decentralized process called "mining". This process
                          involves that individuals are rewarded by the network
                          for their services. Bitcoin miners are processing
                          transactions and securing the network using
                          specialized hardware and are collecting new bitcoins
                          in exchange.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.6s"
                    >
                      <div className="card-header" id="headingTen">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseTen"
                            aria-expanded="false"
                            aria-controls="collapseTen"
                          >
                            Why do bitcoins have value?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseTen"
                        className="collapse"
                        aria-labelledby="headingTen"
                        data-parent="#accordion3"
                      >
                        <div className="card-body">
                          Bitcoins have value because they are useful as a form
                          of money. Bitcoin has the characteristics of money
                          (durability, portability, fungibility, scarcity,
                          divisibility, and recognizability) based on the
                          properties of mathematics rather than relying on
                          physical properties (like gold and silver) or trust in
                          central authorities (like fiat currencies). In short,
                          Bitcoin is backed by mathematics.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.8s"
                    >
                      <div className="card-header" id="headingEleven">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseEleven"
                            aria-expanded="false"
                            aria-controls="collapseEleven"
                          >
                            What determines bitcoin's price?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseEleven"
                        className="collapse"
                        aria-labelledby="headingEleven"
                        data-parent="#accordion3"
                      >
                        <div className="card-body">
                          The price of a bitcoin is determined by supply and
                          demand. When demand for bitcoins increases, the price
                          increases, and when demand falls, the price falls.
                          There is only a limited number of bitcoins in
                          circulation and new bitcoins are created at a
                          predictable and decreasing rate
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="1s"
                    >
                      <div className="card-header" id="headingTwelve">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseTwelve"
                            aria-expanded="false"
                            aria-controls="collapseTwelve"
                          >
                            Can bitcoins become worthless?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseTwelve"
                        className="collapse"
                        aria-labelledby="headingTwelve"
                        data-parent="#accordion3"
                      >
                        <div className="card-body">
                          Yes. History is littered with currencies that failed
                          and are no longer used, such as the German Mark during
                          the Weimar Republic and, more recently, the Zimbabwean
                          dollar.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="tab4" role="tabpanel">
                  <div id="accordion4" className="faq_question">
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.4s"
                    >
                      <div className="card-header" id="headingThirteen">
                        <h6 className="mb-0">
                          <a
                            data-toggle="collapse"
                            href="#collapseThirteen"
                            aria-expanded="true"
                            aria-controls="collapseThirteen"
                          >
                            Is Bitcoin legal?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseThirteen"
                        className="collapse show"
                        aria-labelledby="headingThirteen"
                        data-parent="#accordion4"
                      >
                        <div className="card-body">
                          To the best of our knowledge, Bitcoin has not been
                          made illegal by legislation in most jurisdictions.
                          However, some jurisdictions (such as Argentina and
                          Russia) severely restrict or ban foreign currencies.
                          Other jurisdictions (such as Thailand) may limit the
                          licensing of certain entities such as Bitcoin
                          exchanges.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.6s"
                    >
                      <div className="card-header" id="headingFourteen">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseFourteen"
                            aria-expanded="false"
                            aria-controls="collapseFourteen"
                          >
                            Is Bitcoin useful for illegal activities?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseFourteen"
                        className="collapse"
                        aria-labelledby="headingFourteen"
                        data-parent="#accordion4"
                      >
                        <div className="card-body">
                          Bitcoin is money, and money has always been used both
                          for legal and illegal purposes. Cash, credit cards and
                          current banking systems widely surpass Bitcoin in
                          terms of their use to finance crime. Bitcoin can bring
                          significant innovation in payment systems and the
                          benefits of such innovation are often considered to be
                          far beyond their potential drawbacks.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.8s"
                    >
                      <div className="card-header" id="headingFifteen">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseFifteen"
                            aria-expanded="false"
                            aria-controls="collapseFifteen"
                          >
                            Can Bitcoin be regulated?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseFifteen"
                        className="collapse"
                        aria-labelledby="headingFifteen"
                        data-parent="#accordion4"
                      >
                        <div className="card-body">
                          The Bitcoin protocol itself cannot be modified without
                          the cooperation of nearly all its users, who choose
                          what software they use. Attempting to assign special
                          rights to a local authority in the rules of the global
                          Bitcoin network is not a practical possibility.
                        </div>
                      </div>
                    </div>
                    <div
                      className="card animation"
                      data-animation="fadeInUp"
                      data-animation-delay="1s"
                    >
                      <div className="card-header" id="headingSixteen">
                        <h6 className="mb-0">
                          <a
                            className="collapsed"
                            data-toggle="collapse"
                            href="#collapseSixteen"
                            aria-expanded="false"
                            aria-controls="collapseSixteen"
                          >
                            What about Bitcoin and taxes?
                          </a>
                        </h6>
                      </div>
                      <div
                        id="collapseSixteen"
                        className="collapse"
                        aria-labelledby="headingSixteen"
                        data-parent="#accordion4"
                      >
                        <div className="card-body">
                          Bitcoin is not a fiat currency with legal tender
                          status in any jurisdiction, but often tax liability
                          accrues regardless of the medium used. There is a wide
                          variety of legislation in many different jurisdictions
                          which could cause income, sales, payroll, capital
                          gains, or some other form of tax liability to arise
                          with Bitcoin.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
