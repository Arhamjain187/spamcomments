// Add an event listener to the "Check Spam" button
document.getElementById('check-spam').addEventListener('click', () => {
    // Reload the current tab to trigger the content script
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      chrome.tabs.reload(tabs[0].id);
    });
  });
  