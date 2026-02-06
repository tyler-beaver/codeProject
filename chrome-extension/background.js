chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "JOB_APPLICATION_DETECTED") return;

  console.log("📥 Background received job application message:", message.payload);
});
