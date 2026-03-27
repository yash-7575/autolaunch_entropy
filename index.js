/**
 * index.js
 * Interactive CLI entry point for the Gemini-powered social media content generator.
 * Run: node index.js
 */

import "dotenv/config";
import readline from "readline";
import fs from "fs";
import path from "path";
import { ContentPipeline } from "./src/pipeline.js";

const OUTPUT_DIR = "./output";

// ─── Pretty Printer ────────────────────────────────────────────────────────

function printLinkedIn(result) {
  console.log("\n" + "═".repeat(70));
  console.log("🔵  LINKEDIN POST");
  console.log("═".repeat(70));
  console.log(result.content);
  console.log("\n── SEO Metadata ──");
  console.log(`  📊 Readability: ${result.metadata.readabilityScore}/10`);
  console.log(`  🔥 Engagement:  ${result.metadata.engagementPotential}/10`);
  console.log(`  📝 Char count:  ${result.charCount}`);
}

function printTwitter(result) {
  console.log("\n" + "═".repeat(70));
  console.log("🐦  TWITTER / X POST");
  console.log("═".repeat(70));
  console.log(result.tweet);
  console.log("\n── SEO Metadata ──");
  console.log(`  📊 Readability: ${result.metadata.readabilityScore}/10`);
  console.log(`  🔥 Engagement:  ${result.metadata.engagementPotential}/10`);
  console.log(`  📝 Char count:  ${result.charCount}`);
}

function printInstagram(result) {
  console.log("\n" + "═".repeat(70));
  console.log("📸  INSTAGRAM POST");
  console.log("═".repeat(70));
  console.log("\n── Caption ──");
  console.log(result.caption);
  console.log("\n── SEO Metadata ──");
  console.log(`  📊 Readability: ${result.metadata.readabilityScore}/10`);
  console.log(`  🔥 Engagement:  ${result.metadata.engagementPotential}/10`);
}

function printResults(results) {
  printLinkedIn(results.linkedin);
  printTwitter(results.twitter);
  printInstagram(results.instagram);
  console.log("\n" + "═".repeat(70));
}

// ─── Save to JSON ───────────────────────────────────────────────────────────

function saveResults(results, description) {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const slug = description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 40);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `${slug}_${timestamp}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
  console.log(`\n💾  Saved to: ${filepath}`);
}

// ─── Interactive REPL ───────────────────────────────────────────────────────

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║     🚀  Code Apex — Gemini-Powered Social Media Content Generator    ║");
  console.log("║         LinkedIn • Twitter/X • Instagram  |  RAG + SEO Optimized    ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");
  console.log('Type "exit" to quit.\n');

  const pipeline = new ContentPipeline();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  // Warm up KB on startup
  console.log("🔧  Initializing knowledge bases...");
  await pipeline.initialize();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const description = (await ask(rl, "\n📝  Describe your post: ")).trim();
    if (!description || description.toLowerCase() === "exit") break;

    const goal = (await ask(rl, "🎯  Campaign goal (e.g. Awareness, Signups, Traffic) [Awareness]: ")).trim() || "Awareness";

    const startTime = Date.now();
    let results;
    try {
      results = await pipeline.generate(description, goal);
    } catch (err) {
      console.error(`\n❌  Error: ${err.message}`);
      continue;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    printResults(results);
    console.log(`\n⏱️   Generated in ${elapsed}s`);

    const saveChoice = (await ask(rl, "\n💾  Save as JSON? (y/n) [n]: ")).trim().toLowerCase();
    if (saveChoice === "y" || saveChoice === "yes") {
      saveResults(results, description);
    }
  }

  console.log("\n👋  Goodbye!\n");
  rl.close();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
