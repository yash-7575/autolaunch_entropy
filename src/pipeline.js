/**
 * pipeline.js
 * ContentPipeline — orchestrates RAG setup and content generation for all 3 platforms.
 */

import "dotenv/config";
import { RAGService } from "./ragService.js";
import { KnowledgeBuilder } from "./knowledgeBuilder.js";
import { ContentGenerator } from "./contentGenerator.js";

export class ContentPipeline {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env file");

    this.rag = new RAGService(apiKey);
    this.generator = new ContentGenerator(apiKey, this.rag);
    this.initialized = false;
  }

  /** Initialize KB (idempotent — safe to call each startup) */
  async initialize() {
    if (this.initialized) return;
    const builder = new KnowledgeBuilder(this.rag);
    await builder.buildAll();
    this.initialized = true;
  }

  /**
   * Generate content for all 3 platforms.
   * @param {string} description - Plain text description of the feature/news
   * @param {string} goal - Campaign goal (Awareness, Signups, Traffic, etc.)
   * @returns {{ linkedin, twitter, instagram }}
   */
  async generate(description, goal = "Awareness") {
    await this.initialize();

    const featureBrief = this.generator.buildFeatureBrief(description, goal);

    console.log("\n⚙️  Generating content for all platforms...");

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    process.stdout.write("  🔵 LinkedIn... ");
    const linkedin = await this.generator.generateLinkedInPost(featureBrief);
    console.log("✅");

    await sleep(5000);

    process.stdout.write("  🐦 Twitter... ");
    const twitter = await this.generator.generateTwitterPost(featureBrief);
    console.log("✅");

    await sleep(5000);

    process.stdout.write("  📸 Instagram... ");
    const instagram = await this.generator.generateInstagramPost(featureBrief);
    console.log("✅");

    return { linkedin, twitter, instagram, featureBrief, generatedAt: new Date().toISOString() };
  }
}
