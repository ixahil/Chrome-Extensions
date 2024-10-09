// background.js
console.log("Starting background script");

const apiKey = chrome.runtime.getManifest().env.API_KEY;

let key = apiKey;

const prompt = {
  text:
    "You are an email assistant. Read the email content below and perform the following tasks:\n\n" +
    "1. Classify the email into one of the following categories: Inquiry, Complaint, Feedback, Spam, Promotion.\n" +
    "3. take Recipient Name and Sender name from email if you don't get the name just use there" +
    "2. Draft a professional response based on the email content.\n\n" +
    "Email Content: {email_content}\n\n" +
    "Provide your output clearly as plain text with the following format:\n" +
    "Classification: [Category]\n" +
    "\n" +
    "[Your response here]\n\n" +
    "Make sure the response follows this format:\n" +
    "- Start the email with greeting Recipient" +
    '- End the email with "Best regards," on a new line.\n' +
    '- Place sender name on the line directly below "Best regards,".\n\n' +
    "Ensure there are no special characters or unnecessary formatting in the output.",
};

async function generateResponse(lastMessage) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
      key,
    {
      method: "POST",
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [prompt],
          },
          { role: "user", parts: [{ text: lastMessage }] },
        ],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  const responseText = data.candidates[0].content.parts[0].text;

  // Format the response
  return responseText
    .replace(/\n/g, "<br>") // Replace newlines with <br> for HTML rendering
    .trim(); // Remove any leading or trailing whitespace
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateResponse") {
    generateResponse(request.lastMessage).then((response) => {
      sendResponse({ response });
    });
    return true; // Keep the message channel open for sendResponse
  }
});
