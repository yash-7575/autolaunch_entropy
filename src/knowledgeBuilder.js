/**
 * knowledgeBuilder.js
 * Seeds LinkedIn, Twitter, and Instagram knowledge bases with best-practice documents.
 * Idempotent — safe to call on every startup (RAGService skips existing docs).
 */

export class KnowledgeBuilder {
  constructor(ragService) {
    this.rag = ragService;
  }

  async buildAll() {
    console.log("\n🔨 Building Knowledge Bases (idempotent — skips existing docs)...");
    await this.buildLinkedInKB();
    await this.buildTwitterKB();
    await this.buildInstagramKB();
    console.log("✅ All knowledge bases ready.\n");
  }

  async buildLinkedInKB() {
    const platform = "linkedin";
    this.rag.loadPlatform(platform);

    const docs = [
      {
        text: `LinkedIn post best practices: Ideal length is 1200–1800 characters. Start with a powerful hook in the first 2 lines (visible before "see more"). Use line breaks every 2–3 sentences. End with a clear call-to-action (CTA). Professional tone, data-driven claims perform best. Tag relevant people or companies to boost reach.`,
        metadata: { type: "best_practice" },
      },
      {
        text: `LinkedIn SEO keywords for tech posts: "developer community", "software engineering", "tech innovation", "digital transformation", "product launch", "API integration", "cloud computing", "machine learning", "artificial intelligence", "open source", "DevOps", "future of work"`,
        metadata: { type: "seo_keywords" },
      },
      {
        text: `LinkedIn post template:
[HOOK — Bold statement or surprising fact]

[PROBLEM — Pain point your audience faces]

[SOLUTION — How your product/feature solves it]

[IMPACT — Specific metric or outcome, e.g., "reduced build time by 40%"]

[SOCIAL PROOF — Testimonial, case study, or user count]

[CTA — "Follow me for more", "DM to learn more", "Link in comments"]

#Hashtag1 #Hashtag2 #Hashtag3`,
        metadata: { type: "template" },
      },
      {
        text: `LinkedIn engagement tips: Ask a question at the end to drive comments. Use bullet points (• or →) for readability. Post between 8–10 AM or 5–6 PM on weekdays. Use 3–5 hashtagags max. Videos get 5x more reach than static posts. Carousel PDFs get the highest dwell time.`,
        metadata: { type: "engagement_tips" },
      },
      {
        text: `LinkedIn hooks that work for tech content: "I built X in 30 days — here's what I learned:", "Most developers don't know this:", "Why we re-wrote our entire backend (and what happened next):", "We just crossed 10,000 users — here's the feature that made the difference:", "The mistake 90% of startups make when launching a developer tool:"`,
        metadata: { type: "hooks" },
      },
      {
        text: `LinkedIn storytelling framework for product launches: Start with a personal anecdote or team backstory. Explain the specific problem you were solving. Show the journey (failed attempts, pivots). Reveal the solution and key technical insight. Include a before/after metric. End with what's next and invite engagement.`,
        metadata: { type: "storytelling" },
      },
    ];

    for (const doc of docs) {
      await this.rag.addDocument(platform, doc.text, doc.metadata);
    }
    console.log(`  ✅ LinkedIn KB seeded (${docs.length} documents)`);
  }

  async buildTwitterKB() {
    const platform = "twitter";
    this.rag.loadPlatform(platform);

    const docs = [
      {
        text: `Twitter/X thread best practices: First tweet is the hook — must be < 80 characters and extremely punchy. Each tweet should be self-contained (readable without context). Use numbered tweets (1/, 2/) for discoverability. Thread length: 5–10 tweets is optimal. Last tweet = CTA + link.`,
        metadata: { type: "best_practice" },
      },
      {
        text: `Twitter SEO hashtags for tech: #DevCommunity #TechNews #100DaysOfCode #OpenSource #WebDev #JavaScript #Python #AI #MachineLearning #Startup #ProductLaunch #SaaS #Coding #Programming #TechTwitter`,
        metadata: { type: "seo_keywords" },
      },
      {
        text: `Twitter thread template:
Tweet 1 (Hook): [Punchy statement that makes people stop scrolling] 🧵
Tweet 2: [Context — what is this about and why it matters]
Tweet 3: [The core insight, feature or announcement]
Tweet 4: [Technical detail, how-it-works, or surprising fact]
Tweet 5 (CTA): [What to do next — follow, retweet, click link, reply]`,
        metadata: { type: "template" },
      },
      {
        text: `Twitter character optimization: Keep tweets at 200–250 chars to leave room for retweets. Use line breaks for visual rhythm. One idea per tweet — don't cram. Use emojis as visual bullets (not decoration). Questions generate 2x more engagement than statements.`,
        metadata: { type: "engagement_tips" },
      },
      {
        text: `Twitter hooks that go viral for product launches: "We just shipped X 🚀", "Hot take:", "Unpopular opinion:", "Nobody is talking about this:", "After 6 months of building in public, we finally:", "The API that changed everything for us:"`,
        metadata: { type: "hooks" },
      },
    ];

    for (const doc of docs) {
      await this.rag.addDocument(platform, doc.text, doc.metadata);
    }
    console.log(`  ✅ Twitter KB seeded (${docs.length} documents)`);
  }

  async buildInstagramKB() {
    const platform = "instagram";
    this.rag.loadPlatform(platform);

    const docs = [
      {
        text: `Instagram caption best practices: First 125 characters are shown before "more" — make them count. Use line breaks for readability. Mix short punchy sentences with longer explanations. Hashtags go at the end or in first comment (30 max). Strong visual description helps non-visual audiences.`,
        metadata: { type: "best_practice" },
      },
      {
        text: `Instagram hashtags for tech and developer content: #DeveloperLife #CodeNewbie #WomenInTech #TechStartup #SoftwareDeveloper #AppDevelopment #TechCommunity #ProgrammerHumor #BuildInPublic #IndieHacker #ProductHunt #TechFounder #StartupLife #GrowthHacking #DigitalMarketing`,
        metadata: { type: "seo_keywords" },
      },
      {
        text: `Instagram carousel post template:
Slide 1 (Hook): Bold text + striking visual. "The [X] that changed how we build software"
Slide 2 (Problem): "Here's the problem most [audience] face..." + simple visual
Slide 3 (Solution): "We built [feature] to fix this" + screenshot or diagram
Slide 4 (Features): 3 bullet points with icons showcasing key capabilities
Slide 5 (CTA): "Try it for free" / "Link in bio" + brand colors`,
        metadata: { type: "template" },
      },
      {
        text: `Instagram caption formula: Hook (first line grabs attention) → Value (what's in it for them) → Story or Proof (builds credibility) → CTA (save, share, comment, click link in bio). Use 5–10 emojis throughout. Call out your target audience explicitly ("Hey developers 👋").`,
        metadata: { type: "engagement_tips" },
      },
      {
        text: `Instagram emoji strategy: Use emojis as bullet points (✅ ⚡ 🔥 💡 🚀 🎯). Put the key emoji in the first line of caption. Don't overuse — max 1–2 per sentence. Emojis that drive engagement: 👇 (drives scroll), 🔄 (drives shares), 💬 (drives comments), 🔗 (drives link clicks).`,
        metadata: { type: "engagement_tips" },
      },
    ];

    for (const doc of docs) {
      await this.rag.addDocument(platform, doc.text, doc.metadata);
    }
    console.log(`  ✅ Instagram KB seeded (${docs.length} documents)`);
  }

  /** Add real past performance data to improve future recommendations */
  async addPastPerformance(platform, postContent, metrics) {
    const text = `High-performing past post for ${platform}:
Content: "${postContent}"
Performance: Likes: ${metrics.likes}, Comments: ${metrics.comments}, Shares: ${metrics.shares}, Reach: ${metrics.reach}
Key patterns: ${metrics.notes}`;

    await this.rag.addDocument(platform, text, { type: "past_performance", ...metrics });
    console.log(`  📈 Past performance data added for ${platform}`);
  }
}
