// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // Registration failed
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

// Add to home screen prompt handler
let deferredPrompt;
const addToHomeBtn = document.createElement('button');
addToHomeBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show add to home screen button if needed
  // This can be used to create a custom install button in your UI
  console.log('App can be installed, showing install prompt');
});

// When app is installed, log it
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed to home screen');
});

// Handle standalone mode detection
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('App is running in standalone mode');
} else {
  console.log('App is running in browser mode');
} 