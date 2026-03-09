import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("plans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const generate = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    // Generate a personalized plan based on the goal
    const goal = profile.mainGoal.toLowerCase();

    let steps = [];

    if (goal.includes("mrr") || goal.includes("revenue") || goal.includes("business")) {
      steps = [
        {
          week: 1,
          title: "Foundation & Clarity",
          description: "Define your unique value proposition and target audience",
          tasks: [
            "Write down your ideal customer profile",
            "List 3 problems you solve better than anyone",
            "Create your one-sentence pitch",
          ],
        },
        {
          week: 2,
          title: "Offer Design",
          description: "Craft an irresistible offer using the value equation",
          tasks: [
            "Define the dream outcome for your customer",
            "Identify and address their biggest objections",
            "Add bonuses that increase perceived value",
          ],
        },
        {
          week: 3,
          title: "Audience Building",
          description: "Start creating content and building your audience",
          tasks: [
            "Choose your primary platform",
            "Create 5 pieces of valuable content",
            "Engage with 20 potential customers daily",
          ],
        },
        {
          week: 4,
          title: "First Sales",
          description: "Launch and get your first paying customers",
          tasks: [
            "Reach out to 50 potential customers",
            "Offer a founding member discount",
            "Collect testimonials from first users",
          ],
        },
      ];
    } else if (goal.includes("fitness") || goal.includes("health") || goal.includes("weight")) {
      steps = [
        {
          week: 1,
          title: "Habit Stacking",
          description: "Attach new fitness habits to existing routines",
          tasks: [
            "Identify your daily anchor habits",
            "Plan a 10-minute morning movement routine",
            "Prepare your workout clothes the night before",
          ],
        },
        {
          week: 2,
          title: "Nutrition Foundation",
          description: "Build sustainable eating habits",
          tasks: [
            "Track your meals for awareness (not restriction)",
            "Add one serving of vegetables to each meal",
            "Prepare 3 healthy meals in advance",
          ],
        },
        {
          week: 3,
          title: "Progressive Overload",
          description: "Increase intensity gradually",
          tasks: [
            "Add 5 minutes to your daily movement",
            "Try one new form of exercise",
            "Find an accountability partner",
          ],
        },
        {
          week: 4,
          title: "Identity Shift",
          description: "Become the person who does this naturally",
          tasks: [
            "Reflect on your progress and wins",
            "Share your journey with someone",
            "Plan for next month's goals",
          ],
        },
      ];
    } else {
      steps = [
        {
          week: 1,
          title: "Vision Clarity",
          description: "Define exactly what success looks like",
          tasks: [
            "Write a detailed description of achieving your goal",
            "Identify the 3 biggest obstacles",
            "Find someone who has achieved this goal",
          ],
        },
        {
          week: 2,
          title: "System Design",
          description: "Create the habits and systems that guarantee success",
          tasks: [
            "Break your goal into daily actions",
            "Set up your environment for success",
            "Remove friction from good behaviors",
          ],
        },
        {
          week: 3,
          title: "Execution Mode",
          description: "Focus on consistent action over perfect planning",
          tasks: [
            "Complete your daily actions for 7 days straight",
            "Track your progress visually",
            "Celebrate small wins",
          ],
        },
        {
          week: 4,
          title: "Reflection & Iteration",
          description: "Learn from experience and optimize",
          tasks: [
            "Review what worked and what didn't",
            "Adjust your approach based on data",
            "Set goals for the next 30 days",
          ],
        },
      ];
    }

    const existing = await ctx.db
      .query("plans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: `Your Path to: ${profile.mainGoal}`,
        steps,
      });
      return existing._id;
    }

    return await ctx.db.insert("plans", {
      userId,
      title: `Your Path to: ${profile.mainGoal}`,
      steps,
      isRevealed: false,
      createdAt: Date.now(),
    });
  },
});

export const reveal = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const plan = await ctx.db
      .query("plans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!plan) throw new Error("Plan not found");

    await ctx.db.patch(plan._id, { isRevealed: true });
  },
});
