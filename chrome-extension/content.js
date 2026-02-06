console.log("✅ Content script loaded");

// Detect all form submissions
document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  // Extract all non-empty fields
  const formData = {};
  for (const [key, value] of new FormData(form).entries()) {
    if (value && value.trim() !== "") {
      formData[key] = value;
    }
  }

  // Log everything to console for testing
  console.log("📤 Form submitted!", {
    url: window.location.href,
    title: document.title,
    fields: formData
  });

  // Send to background script
  chrome.runtime.sendMessage({
    type: "JOB_APPLICATION_DETECTED",
    payload: {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      fields: formData
    }
  });
}, true);
