chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "JOB_APPLICATION_DETECTED") return;

  (async () => {
    try {
      const result = await chrome.storage.local.get("supabaseUserId");
      const userId = result.supabaseUserId;
      if (!userId) {
        console.warn("No user ID found in storage");
        return;
      }

      const backend = "https://codeproject-1dnl.onrender.com"; // your backend
      const apiUrl = `${backend}/api/applications/user/${userId}`;

      const jobData = message.payload.fields;

      const payload = {
        name: jobData.company || jobData.name || jobData.employer || "",
        description: jobData.position || jobData.title || jobData.description || "",
        interview_date: jobData.interview_date || "",
        interview_time: jobData.interview_time || "",
        url: message.payload.url,
        timestamp: message.payload.timestamp
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log("✅ Sent to dashboard:", response.status);
    } catch (error) {
      console.error("❌ Failed to send job data:", error);
    }
  })();

  return true; // keep async alive
});
