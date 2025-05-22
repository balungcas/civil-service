import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

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

export interface StudyStatistics {
  questionsAnswered: number;
  quizzesTaken: number;
  studyDays: number;
  correctRate: number;
}

export const getStudyStatistics = async (): Promise<StudyStatistics> => {
  // For web mockup, return mock data
  if (Platform.OS === "web") {
    return {
      questionsAnswered: 152,
      quizzesTaken: 12,
      studyDays: 8,
      correctRate: 75
    };
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Get questions answered count
        tx.executeSql(
          `SELECT COUNT(*) as count FROM question_history`,
          [],
          (_, questionsResult) => {
            const questionsAnswered = questionsResult.rows.item(0).count;
            
            // Get quizzes taken
            tx.executeSql(
              `SELECT COUNT(*) as count FROM quiz_results`,
              [],
              (_, quizzesResult) => {
                const quizzesTaken = quizzesResult.rows.item(0).count;
                
                // Get study days (unique days)
                tx.executeSql(
                  `SELECT COUNT(DISTINCT DATE(timestamp)) as count FROM question_history`,
                  [],
                  (_, daysResult) => {
                    const studyDays = daysResult.rows.item(0).count;
                    
                    // Get correct rate
                    tx.executeSql(
                      `SELECT AVG(correct) * 100 as rate FROM question_history`,
                      [],
                      (_, rateResult) => {
                        const correctRate = Math.round(rateResult.rows.item(0).rate || 0);
                        
                        resolve({
                          questionsAnswered,
                          quizzesTaken,
                          studyDays,
                          correctRate
                        });
                      },
                      (_, error) => {
                        reject(error);
                        return false;
                      }
                    );
                  },
                  (_, error) => {
                    reject(error);
                    return false;
                  }
                );
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
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

export const getPerformanceByCategory = async (): Promise<{categoryId: number; categoryName: string; correctRate: number}[]> => {
  // For web mockup, return mock data
  if (Platform.OS === "web") {
    return [
      { categoryId: 1, categoryName: 'Numerical Ability', correctRate: 65 },
      { categoryId: 2, categoryName: 'Verbal Ability', correctRate: 80 },
      { categoryId: 3, categoryName: 'Analytical Ability', correctRate: 72 },
      { categoryId: 4, categoryName: 'General Information', correctRate: 85 },
      { categoryId: 5, categoryName: 'Philippine Constitution', correctRate: 78 },
    ];
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT 
            q.category_id as categoryId, 
            q.category_name as categoryName, 
            AVG(h.correct) * 100 as correctRate
          FROM question_history h
          JOIN questions q ON h.question_id = q.id
          GROUP BY q.category_id
          ORDER BY q.category_id`,
          [],
          (_, result) => {
            const stats = [];
            for (let i = 0; i < result.rows.length; i++) {
              const item = result.rows.item(i);
              stats.push({
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                correctRate: Math.round(item.correctRate || 0)
              });
            }
            resolve(stats);
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