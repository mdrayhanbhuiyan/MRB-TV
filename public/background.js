// Bangla IPTV Player Pro - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log("Bangla IPTV Player Pro extension installed successfully.");
});

// Listener for launching in a full-tab from the extension action if needed
chrome.action.onClicked.addListener((tab) => {
  // If the popup is not set, this launches a full tab
  // But since we use default_popup, the popup will show directly.
});
