export interface TestCase {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
  isPublic: boolean;
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  options: { a: string; b: string; c: string; d: string };
  // correctAnswer and explanation stripped from API response
  correctAnswer?: string;
  explanation?: string;
}

export interface RubricItem {
  criterion: string;
  weight: number;
  description: string;
  keyPoints: string[];
}

export interface Problem {
  id: string;
  type: "coding" | "quiz" | "system_design";
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  weekNumber: number;
  tags: string;
  theory: string;
  hints: string;
  visualizationComponent: string | null;
  sortOrder: number;
  prerequisites?: string[];

  // Coding
  starterCode?: string | null;
  solution?: string | null;
  testCases?: TestCase[] | null;

  // Quiz
  questions?: QuizQuestion[] | null;

  // System design
  designPrompt?: string | null;
  sampleAnswer?: string | null;
  rubric?: RubricItem[] | null;
}

export interface QuizResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmitResponse {
  score: number;
  total: number;
  percentage: number;
  results: QuizResult[];
}

export interface CodeRunResult {
  status: "passed" | "failed" | "error";
  message?: string;
  tests: { name: string; ok: boolean; msg?: string }[];
  passed: number;
  total: number;
  durationMs: number;
}
