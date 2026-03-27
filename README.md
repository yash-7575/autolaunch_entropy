# 🚀 Code Apex — Gemini-Powered Social Media Content Generator

A **RAG + SEO** optimized social media content generator using **Google Gemini API**. Generates LinkedIn posts, Twitter/X threads, and Instagram carousels from a single text description.

---

## 📁 Project Structure

```
caption-generator/
├── index.js              # Interactive CLI entry point
├── src/
│   ├── pipeline.js       # Orchestrator — ties everything together
│   ├── contentGenerator.js  # Gemini-powered post generator (all 3 platforms)
│   ├── seoOptimizer.js   # SEO keyword injection + metadata extraction
│   ├── ragService.js     # Embedding + cosine similarity retrieval (FAISS-style)
│   └── knowledgeBuilder.js  # Seeds LinkedIn/Twitter/Instagram knowledge bases
├── kb/                   # Auto-created — persisted KB embeddings (JSON)
├── output/               # Auto-created — saved JSON results
├── .env                  # Gemini API key (pre-configured)
└── package.json
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run
npm start
```

---

## 🎮 Usage

```
📝  Describe your post: We just launched a new API for developers
🎯  Campaign goal: Signups

⚙️  Generating content for all platforms...
  🔵 LinkedIn... ✅
  🐦 Twitter...  ✅
  📸 Instagram... ✅

═══════════════════════════════════════════════════
🔵  LINKEDIN POST
═══════════════════════════════════════════════════
[1200–1800 char SEO-optimized post with hook, story, and CTA]

📊 Readability: 9/10 | 🔥 Engagement: 8/10

🐦  TWITTER / X THREAD
═══════════════════════════════════════════════════
[1/5] Tweet 1 (hook) 🧵
[2/5] Tweet 2 ...
...

📸  INSTAGRAM POST
═══════════════════════════════════════════════════
Caption: [150–300 chars with emojis]
Slides: Hook → Problem → Solution → CTA
Hashtags: 30 relevant hashtags

💾  Save as JSON? (y/n)
```

---

## 🏗️ Architecture

```
User Input
    ↓
ContentPipeline (pipeline.js)
    ├─→ KnowledgeBuilder → seeds RAG KB (once, persisted to kb/)
    └─→ ContentGenerator
        ├─→ RAGService.retrieve() — Gemini text-embedding-004 cosine search
        ├─→ Gemini 2.0 Flash — generates platform content
        └─→ SEOOptimizer — keyword injection + metadata extraction
```

| Feature | Implementation |
|---|---|
| **LLM** | Gemini 2.0 Flash |
| **Embeddings** | Gemini text-embedding-004 |
| **RAG** | In-memory cosine similarity, persisted to `kb/*.json` |
| **SEO** | Platform keyword DB + Gemini rewrite + metadata JSON |
| **Persistence** | Idempotent — skips already-embedded documents on restart |
| **Parallel generation** | All 3 platforms generated concurrently via `Promise.all` |

---

## 🔑 Environment

```
GEMINI_API_KEY=your_api_key_here
```
