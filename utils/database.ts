import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Question } from '@/types/Question';

// Open database
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

// Initialize database
export const initializeDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Questions table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_text TEXT NOT NULL,
            options TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            explanation TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            category_name TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            topic TEXT,
            ai_generated INTEGER DEFAULT 0,
            approved INTEGER DEFAULT 1
          );`
        );
        
        // Categories table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT NOT NULL
          );`
        );
        
        // User progress table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS question_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            correct INTEGER NOT NULL,
            timestamp TEXT NOT NULL
          );`
        );
        
        // Quiz results table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id INTEGER NOT NULL,
            score REAL NOT NULL,
            completed_questions INTEGER NOT NULL,
            correct_answers INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            time_spent INTEGER NOT NULL,
            date TEXT NOT NULL
          );`
        );
        
        // Bookmarks table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            timestamp TEXT NOT NULL
          );`
        );
        
        // Insert initial categories if they don't exist
        tx.executeSql(
          `INSERT OR IGNORE INTO categories (id, name, color) VALUES 
          (1, 'Numerical Ability', '#0F3460'),
          (2, 'Verbal Ability', '#950101'),
          (3, 'Analytical Ability', '#38598B'),
          (4, 'General Information', '#113F67'),
          (5, 'Philippine Constitution', '#5C6D70');`
        );
      },
      (error) => {
        console.error("Database initialization error:", error);
        reject(error);
      },
      () => {
        resolve();
      }
    );
  });
};

// Get questions by category
export const getQuestionsByCategory = async (categoryId: number | null): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        const query = categoryId 
          ? `SELECT * FROM questions WHERE category_id = ? AND approved = 1` 
          : `SELECT * FROM questions WHERE approved = 1`;
        
        const params = categoryId ? [categoryId] : [];
        
        tx.executeSql(
          query,
          params,
          (_, result) => {
            const questions: Question[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              const item = result.rows.item(i);
              questions.push({
                id: item.id,
                questionText: item.question_text,
                options: JSON.parse(item.options),
                correctAnswer: item.correct_answer,
                explanation: item.explanation,
                categoryId: item.category_id,
                categoryName: item.category_name,
                difficulty: item.difficulty,
                topic: item.topic
              });
            }
            resolve(questions);
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

// Get specific question by ID
export const getQuestion = async (questionId: number): Promise<Question | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM questions WHERE id = ? AND approved = 1`,
          [questionId],
          (_, result) => {
            if (result.rows.length > 0) {
              const item = result.rows.item(0);
              resolve({
                id: item.id,
                questionText: item.question_text,
                options: JSON.parse(item.options),
                correctAnswer: item.correct_answer,
                explanation: item.explanation,
                categoryId: item.category_id,
                categoryName: item.category_name,
                difficulty: item.difficulty,
                topic: item.topic
              });
            } else {
              resolve(null);
            }
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

// Mark question as answered
export const markQuestionAnswered = async (questionId: number, correct: boolean): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO question_history (question_id, correct, timestamp) VALUES (?, ?, ?)`,
          [questionId, correct ? 1 : 0, new Date().toISOString()],
          (_, result) => {
            resolve();
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

// Insert a new AI-generated question
export const insertAIQuestion = async (question: Omit<Question, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO questions (
            question_text, 
            options, 
            correct_answer, 
            explanation, 
            category_id, 
            category_name, 
            difficulty, 
            topic, 
            ai_generated, 
            approved
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
          [
            question.questionText,
            JSON.stringify(question.options),
            question.correctAnswer,
            question.explanation,
            question.categoryId,
            question.categoryName,
            question.difficulty,
            question.topic || null,
          ],
          (_, result) => {
            resolve(result.insertId);
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

// Approve an AI-generated question
export const approveAIQuestion = async (questionId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE questions SET approved = 1 WHERE id = ?`,
          [questionId],
          (_, result) => {
            resolve();
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

// Get pending AI-generated questions for review
export const getPendingAIQuestions = async (): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM questions WHERE ai_generated = 1 AND approved = 0`,
          [],
          (_, result) => {
            const questions: Question[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              const item = result.rows.item(i);
              questions.push({
                id: item.id,
                questionText: item.question_text,
                options: JSON.parse(item.options),
                correctAnswer: item.correct_answer,
                explanation: item.explanation,
                categoryId: item.category_id,
                categoryName: item.category_name,
                difficulty: item.difficulty,
                topic: item.topic
              });
            }
            resolve(questions);
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