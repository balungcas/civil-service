import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Question } from '@/types/Question';

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

// Get all bookmarked questions
export const getBookmarkedQuestions = async (): Promise<Question[]> => {
  // For web mockup, return mock data
  if (Platform.OS === "web") {
    return [
      {
        id: 1,
        questionText: "Which of the following is NOT a function of the Executive Branch in the Philippine government?",
        options: [
          "Implementation of laws",
          "Prosecution of crimes",
          "Interpretation of laws",
          "Diplomatic relations"
        ],
        correctAnswer: "Interpretation of laws",
        explanation: "The Interpretation of laws is a function of the Judicial Branch, not the Executive Branch. The Executive Branch is responsible for implementing laws, prosecution of crimes (through the Department of Justice), and maintaining diplomatic relations with other countries.",
        categoryId: 5,
        categoryName: "Philippine Constitution",
        difficulty: "medium",
        topic: "Government Structure"
      },
      {
        id: 2,
        questionText: "Which of the following is the correct order of operations in arithmetic?",
        options: [
          "Addition, Subtraction, Multiplication, Division",
          "Parentheses, Exponents, Multiplication/Division, Addition/Subtraction",
          "Parentheses, Multiplication, Division, Addition, Subtraction",
          "Exponents, Parentheses, Addition, Subtraction, Multiplication, Division"
        ],
        correctAnswer: "Parentheses, Exponents, Multiplication/Division, Addition/Subtraction",
        explanation: "The correct order of operations in arithmetic can be remembered using the acronym PEMDAS: Parentheses, Exponents, Multiplication/Division (from left to right), Addition/Subtraction (from left to right).",
        categoryId: 1,
        categoryName: "Numerical Ability",
        difficulty: "easy",
        topic: "Basic Mathematics"
      }
    ];
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT q.* FROM questions q
           INNER JOIN bookmarks b ON q.id = b.question_id
           ORDER BY b.timestamp DESC`,
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

// Check if a question is bookmarked
export const isQuestionBookmarked = async (questionId: number): Promise<boolean> => {
  // For web mockup
  if (Platform.OS === "web") {
    // Mock: Question with ID 1 is bookmarked
    return questionId === 1;
  }
  
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM bookmarks WHERE question_id = ?`,
          [questionId],
          (_, result) => {
            resolve(result.rows.length > 0);
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

// Toggle bookmark status
export const toggleBookmark = async (questionId: number): Promise<boolean> => {
  const isBookmarked = await isQuestionBookmarked(questionId);
  
  // For web mockup
  if (Platform.OS === "web") {
    return !isBookmarked;
  }
  
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        if (isBookmarked) {
          // Remove bookmark
          tx.executeSql(
            `DELETE FROM bookmarks WHERE question_id = ?`,
            [questionId],
            (_, result) => {
              resolve(false);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        } else {
          // Add bookmark
          tx.executeSql(
            `INSERT INTO bookmarks (question_id, timestamp) VALUES (?, ?)`,
            [questionId, new Date().toISOString()],
            (_, result) => {
              resolve(true);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        }
      }
    );
  });
};

// Remove a bookmark
export const removeBookmark = async (questionId: number): Promise<void> => {
  // For web mockup
  if (Platform.OS === "web") {
    return;
  }
  
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM bookmarks WHERE question_id = ?`,
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