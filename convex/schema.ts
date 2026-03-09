import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profile with bio and goals
  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bio: v.string(),
    mainGoal: v.string(),
    goalDeadline: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Generated plans for users
  plans: defineTable({
    userId: v.id("users"),
    title: v.string(),
    steps: v.array(v.object({
      week: v.number(),
      title: v.string(),
      description: v.string(),
      tasks: v.array(v.string()),
    })),
    isRevealed: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Predefined coaches (Board of Directors)
  coaches: defineTable({
    name: v.string(),
    title: v.string(),
    avatar: v.string(),
    expertise: v.string(),
    systemPrompt: v.string(),
    isOfficial: v.boolean(),
    createdByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_official", ["isOfficial"]),

  // Chat conversations
  conversations: defineTable({
    userId: v.id("users"),
    coachId: v.id("coaches"),
    lastMessageAt: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_coach", ["userId", "coachId"]),

  // Chat messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    coachId: v.optional(v.id("coaches")),
    content: v.string(),
    isFromUser: v.boolean(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});
