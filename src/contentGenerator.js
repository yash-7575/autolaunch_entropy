/**
 * contentGenerator.js
 * Optimized platform-specific content generation.
 * Combines generation, SEO injection, and metadata extraction into a SINGLE API call per platform.
 */

import { GoogleGenAI } from "@google/genai";
import { SEO_KEYWORDS } from "./constants.js";

export class ContentGenerator {
  constructor(apiKey, ragService) {
    this.ai = new GoogleGenAI({ apiKey });
    this.rag = ragService;
  }

  async _generateJSON(prompt, retryCount = 0) {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: { 
          temperature: 0.7, 
          maxOutputTokens: 4096,
          responseMimeType: "application/json"
        },
      });
      
      let raw = response.text.trim();
      // Robust cleaning
      raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      
      try {
        return JSON.parse(raw);
      } catch (parseErr) {
        // Try to repair: common issue is literal newlines in strings
        const repaired = raw.replace(/\n/g, "\\n").replace(/\\\n/g, "\\n");
        return JSON.parse(repaired);
      }
    } catch (err) {
      if ((err.code === 429 || err.status === "RESOURCE_EXHAUSTED") && retryCount < 3) {
        process.stdout.write(` (Quota hit, retrying in 10s... attempt ${retryCount + 1}) `);
        await new Promise(r => setTimeout(r, 10000));
        return this._generateJSON(prompt, retryCount + 1);
      }
      console.error(`\n❌ JSON Error at pos ${err.pos || "unknown"}:`, err.message.slice(0, 100));
      throw err;
    }
  }

  buildFeatureBrief(description, goal = "Awareness") {
    return {
      feature_name: description.slice(0, 80),
      description,
      target_audience: "professionals and developers",
      key_benefit: description,
      campaign_goal: goal,
    };
  }

  // ─────────────── LinkedIn ───────────────

  async generateLinkedInPost(featureBrief) {
    const query = `LinkedIn post for ${featureBrief.description}`;
    const context = await this.rag.retrieve("linkedin", query, 5);
    const keywords = SEO_KEYWORDS.linkedin;

    const prompt = `You are an expert LinkedIn strategist. Write a short, punchy post (500-800 characters) about: ${featureBrief.description}.
Goal: ${featureBrief.campaign_goal}.

Use these KB best practices:
${context.join("\n\n")}

SEO Rules:
- Naturally weave in these keywords: ${keywords.primary.join(", ")}
- Use short sentences and line breaks.
- Put exactly 3-5 highly relevant hashtags (optimal for LinkedIn algorithm) directly at the very end of the post text.

Return a JSON object in this format:
{
  "content": "Full post text here, ending with hashtags",
  "metadata": {
    "primaryKeywords": ["kw1", "kw2"],
    "readabilityScore": 1-10,
    "engagementPotential": 1-10
  }
}`;

    const result = await this._generateJSON(prompt);
    return { ...result, platform: "linkedin", charCount: result.content.length };
  }

  // ─────────────── Twitter ───────────────

  async generateTwitterPost(featureBrief) {
    const query = `Twitter post for ${featureBrief.description}`;
    const context = await this.rag.retrieve("twitter", query, 5);
    const keywords = SEO_KEYWORDS.twitter;

    const prompt = `You are an expert Twitter creator. Write a single, highly engaging tweet about: ${featureBrief.description}.

Use these KB best practices:
${context.join("\n\n")}

SEO Rules:
- Use these relevant tags inline or at the end: ${keywords.primary.join(", ")}
- Must be under 280 characters.
- Post must be completely ready to publish, including 2-4 targeted hashtags (ideal for Twitter reach).

Return a JSON object:
{
  "tweet": "Full tweet text here, including hashtags",
  "metadata": {
    "readabilityScore": 1-10,
    "engagementPotential": 1-10
  }
}`;

    const result = await this._generateJSON(prompt);
    return { ...result, platform: "twitter", charCount: result.tweet.length };
  }

  // ─────────────── Instagram ───────────────

  async generateInstagramPost(featureBrief) {
    const query = `Instagram caption for ${featureBrief.description}`;
    const context = await this.rag.retrieve("instagram", query, 5);
    const keywords = SEO_KEYWORDS.instagram;

    const prompt = `You are an expert Instagram creator. Write a short, punchy caption about: ${featureBrief.description}.

Use these KB best practices:
${context.join("\n\n")}

SEO Rules:
- Naturally weave in these keywords: ${keywords.primary.join(", ")}
- Include emojis.
- Include 20-30 highly relevant hashtags right at the bottom of the caption text to maximize Instagram algorithm engagement.

Return a JSON object:
{
  "caption": "Full caption text, with all hashtags included at the end",
  "metadata": {
    "readabilityScore": 1-10,
    "engagementPotential": 1-10
  }
}`;

    const result = await this._generateJSON(prompt);
    return { ...result, platform: "instagram" };
  }
}
