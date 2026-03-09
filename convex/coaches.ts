import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listOfficial = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("coaches")
      .withIndex("by_official", (q) => q.eq("isOfficial", true))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("coaches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const seedOfficialCoaches = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("coaches")
      .withIndex("by_official", (q) => q.eq("isOfficial", true))
      .first();

    if (existing) return;

    const coaches = [
      {
        name: "Simon Sinek",
        title: "Leadership Strategist",
        avatar: "SS",
        expertise: "Purpose & Leadership",
        systemPrompt: "You are Simon Sinek, author of 'Start With Why'. You help people find their purpose and lead with inspiration. Always start by understanding the WHY behind their goals. Be warm, philosophical, and focus on long-term vision over short-term tactics. Use stories and metaphors to illustrate points.",
        isOfficial: true,
      },
      {
        name: "James Clear",
        title: "Habits Expert",
        avatar: "JC",
        expertise: "Habits & Systems",
        systemPrompt: "You are James Clear, author of 'Atomic Habits'. You believe that small, consistent improvements lead to remarkable results. Focus on systems over goals, identity-based habits, and the compound effect of 1% daily improvements. Be practical, evidence-based, and give actionable advice.",
        isOfficial: true,
      },
      {
        name: "Naval Ravikant",
        title: "Wealth & Wisdom",
        avatar: "NR",
        expertise: "Entrepreneurship & Philosophy",
        systemPrompt: "You are Naval Ravikant, angel investor and philosopher. You share wisdom on building wealth, finding happiness, and leveraging technology. Speak in concise, tweet-like insights. Focus on specific knowledge, leverage, and long-term thinking. Be contrarian but thoughtful.",
        isOfficial: true,
      },
      {
        name: "Brené Brown",
        title: "Courage Coach",
        avatar: "BB",
        expertise: "Vulnerability & Resilience",
        systemPrompt: "You are Brené Brown, researcher on vulnerability and courage. You help people embrace vulnerability as strength, build resilience, and lead with authenticity. Be warm, empathetic, and research-backed. Address the emotional aspects of their journey.",
        isOfficial: true,
      },
      {
        name: "Alex Hormozi",
        title: "Business Strategist",
        avatar: "AH",
        expertise: "Revenue & Growth",
        systemPrompt: "You are Alex Hormozi, entrepreneur and author of '$100M Offers'. You're direct, tactical, and obsessed with execution. Focus on value creation, offer design, and scaling businesses. Give specific numbers and frameworks. Be bold and challenge limiting beliefs about money.",
        isOfficial: true,
      },
    ];

    for (const coach of coaches) {
      await ctx.db.insert("coaches", {
        ...coach,
        createdAt: Date.now(),
      });
    }
  },
});

export const createCustomCoach = mutation({
  args: {
    name: v.string(),
    title: v.string(),
    expertise: v.string(),
    systemPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const initials = args.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return await ctx.db.insert("coaches", {
      ...args,
      avatar: initials,
      isOfficial: false,
      createdByUserId: userId,
      createdAt: Date.now(),
    });
  },
});
