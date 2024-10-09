document.addEventListener("DOMContentLoaded", () => {
  const logContainer = document.getElementById("log");
  const testButton = document.getElementById("testButton");

  // Function to log messages to the popup
  function logMessage(message) {
    const timestamp = new Date().toISOString();
    logContainer.textContent += `${timestamp} - ${message}\n`;
  }

  // Test button click event
  testButton.addEventListener("click", () => {
    logMessage("Test button clicked");
    // Example: Send a message to background script and log the response
    chrome.runtime.sendMessage({ action: "test" }, (response) => {
      logMessage("Response from background script: " + response.message);
    });
  });

  // Log some initial message
  logMessage("Popup loaded");
});

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "log") {
    console.log(request.message);
    document.getElementById("log").textContent += `${request.message}\n`;
    sendResponse({ status: "logged" });
  }
});
