import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { QuizResult } from '@/types/Question';

const openDatabase = () => {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }
  return SQLite.openDatabase("civilservice.db");
};

const db = openDatabase();

// Save quiz result
export const saveQuizResult = async (result: QuizResult): Promise<number> => {
  // For web mockup
  if (Platform.OS === "web") {
    return 1;
  }
  
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO quiz_results (
            quiz_id, 
            score, 
            completed_questions, 
            correct_answers, 
            total_questions, 
            time_spent, 
            date
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            result.quizId,
            result.score,
            result.completedQuestions,
            result.correctAnswers,
            result.totalQuestions,
            result.timeSpent,
            result.date.toISOString()
          ],
          (_, insertResult) => {
            resolve(insertResult.insertId);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

// Get quiz history
export const getQuizHistory = async (): Promise<QuizResult[]> => {
  // For web mockup, return mock data
  if (Platform.OS === "web") {
    return [
      {
        id: 1,
        quizId: 1,
        score: 80,
        completedQuestions: 10,
        correctAnswers: 8,
        totalQuestions: 10,
        timeSpent: 480,
        date: new Date(Date.now() - 86400000) // Yesterday
      },
      {
        id: 2,
        quizId: 2,
        score: 65,
        completedQuestions: 100,
        correctAnswers: 65,
        totalQuestions: 100,
        timeSpent: 7550,
        date: new Date(Date.now() - 172800000) // 2 days ago
      }
    ];
  }
  
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM quiz_results ORDER BY date DESC`,
          [],
          (_, result) => {
            const quizResults: QuizResult[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              const item = result.rows.item(i);
              quizResults.push({
                id: item.id,
                quizId: item.quiz_id,
                score: item.score,
                completedQuestions: item.completed_questions,
                correctAnswers: item.correct_answers,
                totalQuestions: item.total_questions,
                timeSpent: item.time_spent,
                date: new Date(item.date)
              });
            }
            resolve(quizResults);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};