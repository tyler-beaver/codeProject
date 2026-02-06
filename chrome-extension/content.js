function extractFormData(form) {
  const data = new FormData(form);
  const fields = {};

  for (const [key, value] of data.entries()) {
    if (typeof value === "string" && value.trim() !== "") {
      fields[key] = value;
    }
  }

  return fields;
}

function detectJobApplication(form) {
  const text = form.innerText.toLowerCase();

  const keywords = [
    "apply",
    "application",
    "resume",
    "cover letter",
    "submit application"
  ];

  return keywords.some(word => text.includes(word));
}

document.addEventListener(
  "submit",
  (event) => {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) return;
    if (!detectJobApplication(form)) return;

    const payload = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      fields: extractFormData(form)
    };

    chrome.runtime.sendMessage({
      type: "JOB_APPLICATION_DETECTED",
      payload
    });

    console.log("Job application captured:", payload);
  },
  true // capture phase is important
);



// Optional: intercept fetch for AJAX-heavy apps
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const response = await originalFetch(...args);

  const url = args[0]?.toString() || "";

  if (url.toLowerCase().includes("apply")) {
    chrome.runtime.sendMessage({
      type: "POSSIBLE_JOB_APPLICATION",
      payload: {
        url: window.location.href,
        networkRequest: url,
        timestamp: new Date().toISOString()
      }
    });
  }

  return response;
};
