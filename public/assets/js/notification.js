/*===================================
File Name    : notification.js
Description  : Notifications JS.
Author       : Bestwebcreator.
Template Name: Cryptocash – ICO, Cryptocurrency Website & ICO Landing Page HTML + Dashboard Template
Version      : 1.6
===================================*/

var times = [3120, 4442, 5224, 7510, 8636, 16002, 17222];
var countries = [
  "eng",
  "us",
  "eng_flage",
  "fn",
  "rus_flage",
  "chn_flage",
  "frn_flage",
];

// Check if device is mobile
function isMobile() {
  return window.innerWidth <= 768;
}

function time() {
  return times[parseInt(Math.random() * 7)] + 8000;
}

function notification() {
  // Only show notification if not on mobile
  if (!isMobile()) {
    spop({
      template:
        '<div class="sale_notification d-flex align-items-center"><img src="assets/images/wc_icon3.png" alt="" /> <div class="notification_inner"> <h3>' +
        Math.floor(Math.random() * 60000 + 3000) +
        ' TNTC</h3><p>AirDrop Claimed  <img src="/logo.png" alt="" /></p></div></div>',
      group: "submit-satus",
      style: "nav-fixed",
      position: "bottom-left",
      autoclose: 5000,
      icon: false,
    });
  }
  clearInterval(themeInterval);
  themeInterval = setInterval("notification()", time());
}

// Only start the notification interval if not on mobile
var themeInterval = !isMobile() ? setInterval("notification()", time()) : null;

// Add resize listener to handle orientation changes
window.addEventListener('resize', function() {
  if (isMobile() && themeInterval) {
    clearInterval(themeInterval);
    themeInterval = null;
  } else if (!isMobile() && !themeInterval) {
    themeInterval = setInterval("notification()", time());
  }
});