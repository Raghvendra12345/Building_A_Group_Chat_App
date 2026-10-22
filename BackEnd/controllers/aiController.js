const ai = require("../config/gemini");

const predictMessage = async (req, res) => {
  try {
    const { text, tone = "casual" } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Text must be 500 characters or fewer",
      });
    }

    const prompt = `
You are an AI typing assistant in a chat application.

The user is currently writing: "${text}"

Preferred tone: ${tone}

Suggest exactly 3 short, natural ways to continue the user's message.
Return only valid JSON in this format:
{"suggestions":["suggestion 1","suggestion 2","suggestion 3"]}

Rules:
- Suggestions must continue the existing text naturally.
- Each suggestion should be concise.
- Do not send the message.
- Do not include explanations or Markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let result = response.text.trim();

    // Handle a response wrapped in a JSON code block.
    result = result
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");

    const parsed = JSON.parse(result);

    if (
      !Array.isArray(parsed.suggestions) ||
      parsed.suggestions.length !== 3 ||
      !parsed.suggestions.every(
        (item) => typeof item === "string" && item.trim(),
      )
    ) {
      throw new Error("Gemini returned an invalid suggestion format");
    }

    return res.status(200).json({
      success: true,
      suggestions: parsed.suggestions,
    });
  } catch (error) {
    console.error("Gemini API error:", error.message);

    if (
      error.status === 429 ||
      error.message?.includes("429") ||
      error.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      return res.status(429).json({
        success: false,
        message: "AI quota reached. Please try again later.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to generate AI suggestions right now.",
    });
  }
};

const generateSmartReplies = async (req, res) => {
  try {
    const { message, tone = "casual" } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Incoming message is required",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message must be 1000 characters or fewer",
      });
    }

    const prompt = `
You are an AI assistant generating quick replies for a chat application.

Incoming message: "${message}"
Preferred reply tone: ${tone}

Generate exactly 3 short, relevant possible replies.
Return only valid JSON in this format:
{"replies":["reply 1","reply 2","reply 3"]}

Rules:
- Replies must be relevant to the incoming message.
- Use natural conversational language.
- Vary the responses where appropriate.
- Do not assume facts about the user.
- Do not include explanations or Markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let result = response.text.trim();

    result = result
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");

    const parsed = JSON.parse(result);

    if (
      !Array.isArray(parsed.replies) ||
      parsed.replies.length !== 3 ||
      !parsed.replies.every((item) => typeof item === "string" && item.trim())
    ) {
      throw new Error("Gemini returned an invalid reply format");
    }

    return res.status(200).json({
      success: true,
      replies: parsed.replies,
    });
  } catch (error) {
    console.error("Gemini API error:", error.message);

    if (
      error.status === 429 ||
      error.message?.includes("429") ||
      error.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      return res.status(429).json({
        success: false,
        message: "AI quota reached. Please try again later.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to generate AI suggestions right now.",
    });
  }
};

module.exports = { predictMessage, generateSmartReplies };
