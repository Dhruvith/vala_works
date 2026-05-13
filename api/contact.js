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

const asString = (value) => String(value || "").trim();

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
    const body = getBody(request);
    const name = asString(body.Name);
    const email = asString(body.Email);
    const company = asString(body.Company);
    const budget = asString(body.Budget);
    const details = asString(body["Project Details"]);
    const honey = asString(body._honey);

    if (honey) {
      return response.status(200).json({ ok: true });
    }

    if (!name || !email || !budget || !details) {
      return response.status(400).json({ error: "Missing required fields" });
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
          from_name: name,
          from_email: email,
          to_email: "valaworks3@gmail.com",
          subject: "New VALA WORKS project brief",
          company,
          budget,
          details,
          transcript: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Company: ${company}`,
            `Budget: ${budget}`,
            "",
            "Project Details:",
            details
          ].join("\n"),
          timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        }
      })
    });

    if (!emailResponse.ok) {
      throw new Error(`EmailJS request failed: ${emailResponse.status}`);
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(500).json({ error: "Contact email failed" });
  }
};
