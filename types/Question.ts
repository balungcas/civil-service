export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  categoryId: number;
  categoryName: string;
  difficulty: QuestionDifficulty;
  topic?: string;
}

export interface QuestionCategory {
  id: number;
  name: string;
  color: string;
}

export interface QuizResult {
  id?: number;
  quizId: number;
  score: number;
  completedQuestions: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  date: Date;
}