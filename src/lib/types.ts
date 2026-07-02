// Core data model for StudyLoop.
// (Mirrors what we'll later persist in Lemma tables: topics, questions, rounds.)

export type Topic = {
  id: string;
  name: string;
  summary: string;
};

export type Question = {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type Quiz = {
  title: string;
  topics: Topic[];
  questions: Question[];
};

/** questionId -> selected option index */
export type AnswerMap = Record<string, number>;

export type RoundResult = {
  round: number;
  questions: Question[];
  answers: AnswerMap;
  scoredAt: number;
};

export type TopicStat = {
  topicId: string;
  name: string;
  correct: number;
  total: number;
  mastery: number; // 0..1
  weak: boolean;
};

export type Session = {
  id: string;
  title: string;
  sourceText: string;
  topics: Topic[];
  rounds: RoundResult[];
  createdAt: number;
};
