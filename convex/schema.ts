import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    sessionId: v.string(),
    title: v.string(),
    sourceText: v.string(),
    topics: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        summary: v.string(),
      })
    ),
    createdAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),

  rounds: defineTable({
    sessionId: v.string(),
    round: v.number(),
    score: v.number(),
    total: v.number(),
    questions: v.array(
      v.object({
        id: v.string(),
        topicId: v.string(),
        question: v.string(),
        options: v.array(v.string()),
        answerIndex: v.number(),
        explanation: v.string(),
      })
    ),
    answers: v.record(v.string(), v.number()),
    topicStats: v.array(
      v.object({
        topicId: v.string(),
        name: v.string(),
        correct: v.number(),
        total: v.number(),
        mastery: v.number(),
        weak: v.boolean(),
      })
    ),
    weakTopics: v.array(v.string()),
    scoredAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),
});
