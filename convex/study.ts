import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const topicValidator = v.object({
  id: v.string(),
  name: v.string(),
  summary: v.string(),
});

const questionValidator = v.object({
  id: v.string(),
  topicId: v.string(),
  question: v.string(),
  options: v.array(v.string()),
  answerIndex: v.number(),
  explanation: v.string(),
});

const topicStatValidator = v.object({
  topicId: v.string(),
  name: v.string(),
  correct: v.number(),
  total: v.number(),
  mastery: v.number(),
  weak: v.boolean(),
});

export const upsertSession = mutation({
  args: {
    sessionId: v.string(),
    title: v.string(),
    sourceText: v.string(),
    topics: v.array(topicValidator),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        topics: args.topics,
      });
      return existing._id;
    }
    return ctx.db.insert("sessions", args);
  },
});

export const saveRound = mutation({
  args: {
    sessionId: v.string(),
    round: v.number(),
    score: v.number(),
    total: v.number(),
    questions: v.array(questionValidator),
    answers: v.record(v.string(), v.number()),
    topicStats: v.array(topicStatValidator),
    weakTopics: v.array(v.string()),
    scoredAt: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("rounds", args);
  },
});

export const getSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .unique();
    if (!session) return null;
    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
    rounds.sort((a, b) => a.round - b.round);
    return { session, rounds };
  },
});

export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").order("desc").take(12);
    return Promise.all(
      sessions.map(async (s) => {
        const rounds = await ctx.db
          .query("rounds")
          .withIndex("by_sessionId", (q) => q.eq("sessionId", s.sessionId))
          .collect();
        return {
          sessionId: s.sessionId,
          title: s.title,
          roundCount: rounds.length,
          createdAt: s.createdAt,
        };
      })
    );
  },
});

export const latestSession = query({
  args: {},
  handler: async (ctx) => {
    const session = await ctx.db.query("sessions").order("desc").first();
    if (!session) return null;
    const rounds = await ctx.db
      .query("rounds")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", session.sessionId))
      .collect();
    rounds.sort((a, b) => a.round - b.round);
    return { session, rounds };
  },
});

// Demo helper: wipe all study data (used to reset before demo recordings).
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").collect();
    const rounds = await ctx.db.query("rounds").collect();
    for (const r of rounds) await ctx.db.delete(r._id);
    for (const s of sessions) await ctx.db.delete(s._id);
    return { deleted: sessions.length + rounds.length };
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").collect();
    const rounds = await ctx.db.query("rounds").collect();
    const questionsAnswered = rounds.reduce((sum, r) => sum + r.total, 0);
    return {
      sessions: sessions.length,
      rounds: rounds.length,
      questionsAnswered,
    };
  },
});
