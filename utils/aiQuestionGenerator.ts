import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question, QuestionCategory } from '@/types/Question';
import { getPerformanceByCategory } from './statistics';
import { insertAIQuestion } from './database';

const genAI = new GoogleGenerativeAI('AIzaSyB1u8rjz34N2Hr3VDvZG095qu2LtlvQWtY');

const PROMPT_TEMPLATE = `Generate a multiple-choice question for the Philippine Civil Service Examination.

Category: {category}
Difficulty: {difficulty}

The question should:
1. Be relevant to the Philippine context
2. Have 4 options with only one correct answer
3. Include a detailed explanation
4. Be appropriate for the specified difficulty level

Format the response as a JSON object with the following structure:
{
  "questionText": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": "string",
  "explanation": "string",
  "difficulty": "string",
  "topic": "string"
}`;

const generatePrompt = (category: string, difficulty: string): string => {
  return PROMPT_TEMPLATE
    .replace('{category}', category)
    .replace('{difficulty}', difficulty);
};

export const generateAIQuestion = async (): Promise<Question> => {
  try {
    // Get user performance data to determine area of focus
    const performanceByCategory = await getPerformanceByCategory();
    
    // Find the category with lowest performance
    let lowestPerformanceCategory = performanceByCategory.reduce(
      (lowest, current) => current.correctRate < lowest.correctRate ? current : lowest, 
      performanceByCategory[0]
    );

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Generate the question
    const prompt = generatePrompt(
      lowestPerformanceCategory.categoryName,
      lowestPerformanceCategory.correctRate < 60 ? 'easy' :
      lowestPerformanceCategory.correctRate < 80 ? 'medium' : 'hard'
    );

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the generated content
    const generatedQuestion = JSON.parse(text);

    // Format the question for our database
    const questionData: Omit<Question, 'id'> = {
      questionText: generatedQuestion.questionText,
      options: generatedQuestion.options,
      correctAnswer: generatedQuestion.correctAnswer,
      explanation: generatedQuestion.explanation,
      categoryId: lowestPerformanceCategory.categoryId,
      categoryName: lowestPerformanceCategory.categoryName,
      difficulty: generatedQuestion.difficulty.toLowerCase(),
      topic: generatedQuestion.topic
    };

    // Save to database
    const newQuestionId = await insertAIQuestion(questionData);

    return {
      ...questionData,
      id: newQuestionId
    };
  } catch (error) {
    console.error('Error generating AI question:', error);
    throw error;
  }
};

export const reviewAIQuestion = async (questionId: number, approved: boolean): Promise<void> => {
  try {
    if (approved) {
      await approveAIQuestion(questionId);
    } else {
      // In a real app, you might want to mark it as rejected instead of deleting
      await deleteAIQuestion(questionId);
    }
  } catch (error) {
    console.error('Error reviewing AI question:', error);
    throw error;
  }
};

const approveAIQuestion = async (questionId: number): Promise<void> => {
  // Implementation in database.ts
};

const deleteAIQuestion = async (questionId: number): Promise<void> => {
  // Implementation in database.ts
};