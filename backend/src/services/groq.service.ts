import Groq from "groq-sdk";
import config from "../config/index.js";

let groq: Groq | null = null; // Lazy load

export const getGroqClient = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      console.warn(
        "⚠️ GROQ_API_KEY is missing. Smart search will be disabled.",
      );
      return null;
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
};

/**
 * Uses Groq (Llama 3) to translate a natural language query into search terms.
 *
 * Example:
 * Input: "movies about time travel paradoxes"
 * Output: ["time travel", "paradox", "sci-fi", "future", "past"]
 */
export async function expandQuery(query: string): Promise<string[]> {
  const client = getGroqClient();
  if (!client) return [query];

  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a search assistant for a media database (movies, books, games). 
          Your goal is to extract 3-5 relevant search keywords, genres, or potential titles from the user's description.
          Return ONLY a JSON array of strings. No other text.
          
          Example:
          User: "movie where guy wakes up on beach"
          Output: ["time loop", "war", "aliens", "Edge of Tomorrow"]`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [query];

    // Parse JSON response
    const parsed = JSON.parse(content);
    // Handle { "keywords": [...] } or just [...]
    const keywords = Array.isArray(parsed)
      ? parsed
      : parsed.keywords || parsed.tags || [query];

    return Array.isArray(keywords) ? keywords : [query];
  } catch (error) {
    console.error("Groq expansion error:", error);
    return [query]; // Fallback to original query
  }
}

export default { expandQuery };
