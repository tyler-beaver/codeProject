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


// Improved detection: check visible text, input placeholders, and try shadow DOM
function detectJobApplication(form) {
  let text = "";
  try {
    text = (form.innerText || "").toLowerCase();
  } catch {}
  // Check input placeholders and labels
  const inputs = form.querySelectorAll('input,textarea,select,label');
  for (const el of inputs) {
    if (el.placeholder && el.placeholder.toLowerCase().match(/apply|application|resume|cover letter/)) return true;
    if (el.innerText && el.innerText.toLowerCase().match(/apply|application|resume|cover letter/)) return true;
    if (el.name && el.name.toLowerCase().match(/apply|application|resume|cover letter/)) return true;
  }
  // Try shadow DOM (best effort)
  if (form.shadowRoot) {
    const shadowText = (form.shadowRoot.innerText || "").toLowerCase();
    if (shadowText.match(/apply|application|resume|cover letter/)) return true;
  }
  // Fallback: visible text
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

    console.log("Form submitted and captured:", payload);
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
