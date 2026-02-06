chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === "JOB_APPLICATION_DETECTED") {
    try {
      // Try to get userId from localStorage or prompt
      let userId = localStorage.getItem("supabaseUserId");
      if (!userId) {
        userId = prompt("Enter your user ID for job tracking:");
        if (userId) localStorage.setItem("supabaseUserId", userId);
      }
      if (!userId) return;
      const backend = "https://tyler-beaver.onrender.com"; // Replace with your Render backend URL
      const apiUrl = `${backend}/api/applications/user/${userId}`;
      const jobData = message.payload.fields;
      // Only send required fields
      const payload = {
        name: jobData.company || jobData.name || "",
        description: jobData.position || jobData.description || "",
        interview_date: jobData.interview_date || "",
        interview_time: jobData.interview_time || ""
      };
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      console.log("Sent to dashboard:", response.status);
    } catch (error) {
      console.error("Failed to send job data:", error);
    }
  }
});
