// content.js
function monitorReplyBox() {
  const observer = new MutationObserver(async (mutations) => {
    mutations.forEach(async (mutation) => {
      const replyBox = document.querySelector('div[aria-label="Message Body"]');

      if (replyBox && !replyBox.dataset.autoReply) {
        const signature = replyBox.innerHTML;
        replyBox.innerHTML =
          "Generating the email from Gemini..." + "<br>" + signature;
        replyBox.dataset.autoReply = "true"; // Mark it as handled
        const lastMessage = getLastEmail();
        if (lastMessage) {
          chrome.runtime.sendMessage(
            { action: "generateResponse", lastMessage: lastMessage },
            (response) => {
              replyBox.innerHTML = response.response + "<br>" + signature;
            }
          );
        }
      }
    });
  });

  const targetNode = document.body;
  const config = { childList: true, subtree: true };
  observer.observe(targetNode, config);
}

function getLastEmail() {
  const emailThread = document.querySelectorAll(".ii.gt");
  if (emailThread.length > 0) {
    const lastEmail = emailThread[emailThread.length - 1].innerText;
    return lastEmail;
  }
  //   getRecipientName(emailThread)
  return null;
}

window.onload = monitorReplyBox;
