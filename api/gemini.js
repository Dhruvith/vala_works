const SYSTEM_PROMPT = [
  "You are a helpful voice assistant for VALA WORKS, a digital marketing studio based in Hyderabad, India.",
  "Your job is to warmly greet visitors, understand what they need: brand strategy, performance marketing, content creation, social media management, or web design.",
  "Collect their name, email, company name, and project brief.",
  "Keep responses short, 2 to 3 sentences max, since they will be spoken aloud.",
  "Be warm, professional, and conversational.",
  "After collecting their details, confirm you will have the team reach out.",
  "Do not use markdown, bullet points, or special characters in responses."
].join(" ");

const fallback =
  "I am having trouble thinking clearly right now. Please leave your name, email, company, and project brief, and the VALA WORKS team will follow up.";

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(200).json({ text: fallback });
  }

  try {
    const { history } = getBody(request);
    const safeHistory = Array.isArray(history) ? history.slice(-16) : [];
    const contents = safeHistory
      .filter((item) => item && typeof item.text === "string")
      .map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.text.slice(0, 1800) }]
      }));

    contents.unshift({
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }]
    });

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 120
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini request failed: ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return response.status(200).json({ text: text || fallback });
  } catch (error) {
    return response.status(200).json({ text: fallback });
  }
};
