const getBody = (request) => {
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch (error) {
      return {};
    }
  }

  return request.body || {};
};

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return response.status(500).json({ error: "EmailJS environment variables are missing" });
  }

  try {
    const { transcript, timestamp } = getBody(request);
    const cleanTranscript = String(transcript || "").trim();

    if (!cleanTranscript) {
      return response.status(400).json({ error: "Transcript is required" });
    }

    const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey || undefined,
        template_params: {
          from_name: "Vala Works Voice Bot",
          to_email: "valaworks3@gmail.com",
          subject: "New Voice Inquiry from Website",
          transcript: cleanTranscript.slice(0, 12000),
          timestamp: timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        }
      })
    });

    if (!emailResponse.ok) {
      throw new Error(`EmailJS request failed: ${emailResponse.status}`);
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(500).json({ error: "Transcript email failed" });
  }
};
