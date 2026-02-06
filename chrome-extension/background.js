chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "JOB_APPLICATION_DETECTED") return;

  (async () => {
    try {
      // Use chrome.storage.local for MV3 background
      const { supabaseUserId: userId } = await chrome.storage.local.get("supabaseUserId");
      if (!userId) {
        console.warn("No user ID stored");
        return;
      }
      const backend = "https://tyler-beaver.onrender.com";
      const apiUrl = `${backend}/api/applications/user/${userId}`;
      const jobData = message.payload.fields;
      const payload = {
        name: jobData.company || jobData.name || "",
        description: jobData.position || jobData.description || "",
        interview_date: jobData.interview_date || "",
        interview_time: jobData.interview_time || ""
      };
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      console.log("Sent to dashboard:", response.status);
    } catch (error) {
      console.error("Failed to send job data:", error);
    }
  })();

  return true; // keep async alive for MV3
});
