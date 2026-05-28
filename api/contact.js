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

// FormSubmit activates per referring domain. This activated identity lets the
// brief deliver to the inbox without any account, API key, or activation click.
const ACTIVATED_REFERER = "https://vala-works.vercel.app/";
const ACTIVATED_ORIGIN = "https://vala-works.vercel.app";
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/valaworks3@gmail.com";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, company, budget, details } = getBody(request);

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim();
    const cleanDetails = String(details || "").trim();

    if (!cleanName || !cleanEmail || !cleanDetails) {
      return response.status(400).json({ error: "Name, email, and project details are required" });
    }

    const formResponse = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": ACTIVATED_ORIGIN,
        "Referer": ACTIVATED_REFERER
      },
      body: JSON.stringify({
        _subject: "New VALA WORKS project brief",
        _template: "table",
        _captcha: "false",
        Name: cleanName,
        Email: cleanEmail,
        Company: String(company || "").trim() || "Not provided",
        Budget: String(budget || "").trim() || "Not provided",
        "Project Details": cleanDetails.slice(0, 12000)
      })
    });

    const result = await formResponse.json().catch(() => ({}));

    if (!formResponse.ok || String(result.success) !== "true") {
      return response.status(502).json({ error: result.message || "Email service rejected the request" });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    return response.status(500).json({ error: "Brief email failed" });
  }
};
