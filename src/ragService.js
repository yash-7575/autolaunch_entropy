/**
 * ragService.js
 * RAG service using Gemini gemini-embedding-001 via the new @google/genai SDK.
 * Stores embeddings in-memory with JSON persistence to kb/ folder.
 */

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const KB_DIR = "./kb";

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class RAGService {
  constructor(apiKey) {
    this.ai = new GoogleGenAI({ apiKey });
    this.store = {};
    this._ensureKBDir();
  }

  _ensureKBDir() {
    if (!fs.existsSync(KB_DIR)) fs.mkdirSync(KB_DIR, { recursive: true });
  }

  _kbPath(platform) {
    return path.join(KB_DIR, `${platform}.json`);
  }

  _hashText(text) {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  async _embed(text) {
    const result = await this.ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });
    // Handle both single and array response formats for SDK robustness
    const embedding = result.embedding || (result.embeddings && result.embeddings[0]);
    if (!embedding || !embedding.values) {
      throw new Error("Failed to extract embedding values from API response");
    }
    return embedding.values;
  }

  loadPlatform(platform) {
    const filePath = this._kbPath(platform);
    if (fs.existsSync(filePath)) {
      this.store[platform] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      console.log(`  ✅ KB loaded from disk for [${platform}] (${this.store[platform].length} docs)`);
    } else {
      this.store[platform] = [];
    }
  }

  savePlatform(platform) {
    fs.writeFileSync(this._kbPath(platform), JSON.stringify(this.store[platform], null, 2));
  }

  async addDocument(platform, text, metadata = {}) {
    if (!this.store[platform]) this.store[platform] = [];
    const id = this._hashText(text);
    if (this.store[platform].some((doc) => doc.id === id)) return; // idempotent

    const embedding = await this._embed(text);
    this.store[platform].push({ id, text, metadata, embedding });
    this.savePlatform(platform);
  }

  async retrieve(platform, query, topK = 5) {
    if (!this.store[platform] || this.store[platform].length === 0) return [];

    const queryEmbedding = await this._embed(query);

    const scored = this.store[platform].map((doc) => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((doc) => doc.text);
  }
}
