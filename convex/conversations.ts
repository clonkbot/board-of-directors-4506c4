import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const withCoaches = await Promise.all(
      conversations.map(async (conv) => {
        const coach = await ctx.db.get(conv.coachId);
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .order("desc")
          .first();
        return { ...conv, coach, lastMessage };
      })
    );

    return withCoaches.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

export const getOrCreate = mutation({
  args: { coachId: v.id("coaches") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_user_coach", (q) =>
        q.eq("userId", userId).eq("coachId", args.coachId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      userId,
      coachId: args.coachId,
      lastMessageAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }

    // Get user profile for context
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Get coach
    const coach = await ctx.db.get(conversation.coachId);
    if (!coach) throw new Error("Coach not found");

    // Insert user message
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      content: args.content,
      isFromUser: true,
      createdAt: Date.now(),
    });

    // Generate AI-like response (in a real app, this would call an AI API)
    const responses = getCoachResponses(coach.name, args.content, profile);
    const response = responses[Math.floor(Math.random() * responses.length)];

    // Insert coach response
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      coachId: conversation.coachId,
      content: response,
      isFromUser: false,
      createdAt: Date.now() + 1,
    });

    // Update conversation timestamp
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });
  },
});

function getCoachResponses(coachName: string, userMessage: string, profile: { name: string; mainGoal: string } | null): string[] {
  const userName = profile?.name || "friend";
  const goal = profile?.mainGoal || "your goals";

  const baseResponses: Record<string, string[]> = {
    "Simon Sinek": [
      `${userName}, before we discuss tactics, let me ask you: WHY is "${goal}" important to you? Understanding your deeper motivation will fuel you through the hard days.`,
      `People don't buy what you do, they buy why you do it. How does achieving "${goal}" connect to your greater purpose?`,
      `The goal of a leader is not to be in charge, but to take care of those in their charge. Who will benefit when you achieve ${goal}?`,
      `Start with why, ${userName}. The what and how will follow naturally once you're clear on your purpose.`,
    ],
    "James Clear": [
      `${userName}, forget about the goal for a moment. What's the smallest action you can take TODAY that moves you toward "${goal}"? That's your new daily habit.`,
      `You don't rise to the level of your goals, you fall to the level of your systems. What system can we build to make progress toward "${goal}" automatic?`,
      `Every action is a vote for the person you want to become. Who is the person who naturally achieves "${goal}"? Start acting like them now.`,
      `1% better every day. In a year, you'll be 37x better. What's your 1% improvement for today, ${userName}?`,
    ],
    "Naval Ravikant": [
      `${userName}, achieving "${goal}" is about leverage. Code, media, and capital don't sleep. How can you build something that works for you while you sleep?`,
      `Specific knowledge is knowledge that you cannot be trained for. What do you know about achieving "${goal}" that others don't?`,
      `Play long-term games with long-term people. "${goal}" is a milestone, not the destination. What infinite game are you really playing?`,
      `Wealth is created by owning equity, not by selling time. How can you turn "${goal}" into ownership rather than employment?`,
    ],
    "Brené Brown": [
      `${userName}, pursuing "${goal}" takes courage, and courage requires vulnerability. What fear is holding you back that you haven't admitted yet?`,
      `Vulnerability is not weakness; it's our greatest measure of courage. What's the brave conversation you need to have to move toward "${goal}"?`,
      `You can't get to courage without walking through vulnerability. What would you attempt if you knew you couldn't fail at "${goal}"?`,
      `Shame cannot survive being spoken. What story are you telling yourself about why you can't achieve "${goal}"? Let's examine that together.`,
    ],
    "Alex Hormozi": [
      `${userName}, let's get tactical about "${goal}". What's the highest-leverage activity you could do right now? Do more of that, less of everything else.`,
      `Volume negates luck. If you're trying to hit "${goal}", how many attempts are you making daily? 10x that number.`,
      `The value equation: Dream Outcome × Perceived Likelihood of Achievement / Time Delay × Effort & Sacrifice. How can we maximize this for "${goal}"?`,
      `Stop overthinking, start overworking. "${goal}" requires action, not more planning. What are you doing in the next 60 minutes to move forward?`,
    ],
  };

  return baseResponses[coachName] || [
    `That's a great question, ${userName}. Let me help you think through this in relation to "${goal}".`,
    `I appreciate you sharing that. Here's how I see it connecting to your journey toward "${goal}"...`,
    `Interesting perspective, ${userName}. Let's explore how this can accelerate your progress on "${goal}".`,
  ];
}
