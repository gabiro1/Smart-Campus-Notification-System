import Question from "../models/Question.js";

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

export async function findSimilarQuestions(newContent, announcementId, threshold = 0.4) {
  const newTokens = normalize(newContent);

  const existing = await Question.find({ announcement: announcementId })
    .select("content")
    .lean();

  const matches = existing
    .map((q) => ({
      questionId: q._id,
      content: q.content,
      similarity: jaccardSimilarity(newTokens, normalize(q.content)),
    }))
    .filter((m) => m.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  return matches;
}
