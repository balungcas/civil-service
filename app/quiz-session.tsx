import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView, BackHandler, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, ArrowLeft, ArrowRight, X } from 'lucide-react-native';
import { Question as QuestionType } from '@/types/Question';
import { saveQuizResult } from '@/utils/quizResults';
import Header from '@/components/Header';

export default function QuizSessionScreen() {
  const { quizId } = useLocalSearchParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{questionId: number; selectedOption: string; isCorrect: boolean}[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef(null);

  // Format time remaining into minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    // Handle back button on Android to show confirmation before leaving
    const backAction = () => {
      Alert.alert(
        "Exit Quiz?",
        "Are you sure you want to exit? Your progress will be lost.",
        [
          { text: "Stay", style: "cancel" },
          { text: "Exit", style: "destructive", onPress: () => router.back() }
        ]
      );
      return true;
    };

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', backAction);
    }

    return () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', backAction);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        // In a real app, fetch from the database
        // For now, using mock data
        const mockQuiz = {
          id: parseInt(quizId as string),
          title: "Quick Practice",
          timeLimit: 10, // minutes
          questions: 5
        };
        
        setQuiz(mockQuiz);
        setTimeRemaining(mockQuiz.timeLimit * 60);
        
        // Start timer
        timerIntervalRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              // Time's up
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
              }
              handleSubmitQuiz();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Mock questions
        const mockQuestions = [
          {
            id: 101,
            questionText: "What article of the Philippine Constitution guarantees the Bill of Rights?",
            options: ["Article I", "Article II", "Article III", "Article IV"],
            correctAnswer: "Article III",
            explanation: "Article III of the Philippine Constitution contains the Bill of Rights, which guarantees the fundamental rights and liberties of Filipino citizens.",
            categoryId: 5,
            categoryName: "Philippine Constitution",
            difficulty: "medium"
          },
          {
            id: 102,
            questionText: "Which statement is true about the writ of habeas data in the Philippines?",
            options: [
              "It protects one's right against illegal searches and seizures",
              "It protects a person's right to privacy in information",
              "It is used to produce a detained person in court",
              "It is used to stop an ongoing construction"
            ],
            correctAnswer: "It protects a person's right to privacy in information",
            explanation: "The writ of habeas data is a remedy available to any person whose right to privacy in life, liberty, or security is violated or threatened by an unlawful act of any official or employee, or of a private individual or entity engaged in the gathering, collecting, or storing of data about the person.",
            categoryId: 5,
            categoryName: "Philippine Constitution",
            difficulty: "hard"
          },
          {
            id: 103,
            questionText: "If x² + 9x + c = 0 has equal roots, what is the value of c?",
            options: ["20.25", "18", "20", "9"],
            correctAnswer: "20.25",
            explanation: "For a quadratic equation ax² + bx + c = 0 to have equal roots, the discriminant must be zero: b² - 4ac = 0. Here, a = 1, b = 9. So, 9² - 4(1)(c) = 0, which gives c = 81/4 = 20.25.",
            categoryId: 1,
            categoryName: "Numerical Ability",
            difficulty: "medium"
          },
          {
            id: 104,
            questionText: "Which of the following is NOT one of the three branches of the Philippine government?",
            options: [
              "Executive Branch",
              "Legislative Branch",
              "Judicial Branch",
              "Administrative Branch"
            ],
            correctAnswer: "Administrative Branch",
            explanation: "The three branches of the Philippine government are the Executive, Legislative, and Judicial branches. There is no Administrative Branch in the government structure.",
            categoryId: 5,
            categoryName: "Philippine Constitution",
            difficulty: "easy"
          },
          {
            id: 105,
            questionText: "Which figure of speech is used in the sentence: 'The clouds sailed across the sky'?",
            options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
            correctAnswer: "Personification",
            explanation: "Personification is attributing human characteristics to non-human objects. In this case, clouds are described as 'sailing,' which is a human or vessel action.",
            categoryId: 2,
            categoryName: "Verbal Ability",
            difficulty: "easy"
          }
        ];
        
        setQuestions(mockQuestions);
      } catch (error) {
        console.error("Error loading quiz:", error);
      }
    };
    
    loadQuiz();
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [quizId]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return; // Already answered
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    setSelectedOption(option);
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        selectedOption: option,
        isCorrect: isCorrect
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Last question, show confirmation to submit
      Alert.alert(
        "Submit Quiz",
        "Are you sure you want to submit your answers?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit", onPress: handleSubmitQuiz }
        ]
      );
    }
  };

  const handleSubmitQuiz = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    setQuizSubmitted(true);
    
    // Calculate results
    const totalQuestions = questions.length;
    const answeredQuestions = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Save results
    saveQuizResult({
      quizId: parseInt(quizId as string),
      score,
      completedQuestions: answeredQuestions,
      correctAnswers,
      totalQuestions,
      timeSpent: quiz.timeLimit * 60 - timeRemaining,
      date: new Date()
    });
  };

  const handleExitQuiz = () => {
    router.push('/quiz');
  };

  if (!quiz || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Quiz" leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0F3460" />
          </TouchableOpacity>
        } />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (quizSubmitted) {
    // Show results screen
    const totalQuestions = questions.length;
    const answeredQuestions = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Quiz Results" />
        
        <ScrollView style={styles.content}>
          <View style={styles.resultsCard}>
            <Text style={styles.resultTitle}>Quiz Complete!</Text>
            
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{score}%</Text>
            </View>
            
            <View style={styles.resultStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{correctAnswers}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{answeredQuestions}</Text>
                <Text style={styles.statLabel}>Answered</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalQuestions}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
            
            <Text style={styles.resultFeedback}>
              {score >= 80 ? "Excellent work! You're well prepared for the exam." :
               score >= 60 ? "Good job! Keep practicing to improve further." :
               "Keep studying! Review the areas where you made mistakes."}
            </Text>
          </View>
          
          <View style={styles.answersSection}>
            <Text style={styles.sectionTitle}>Question Review</Text>
            
            {questions.map((question, index) => {
              const answer = answers.find(a => a.questionId === question.id);
              const isAnswered = !!answer;
              const isCorrect = answer?.isCorrect;
              
              return (
                <View key={question.id} style={styles.answerCard}>
                  <View style={styles.answerHeader}>
                    <Text style={styles.questionNumber}>Question {index + 1}</Text>
                    {isAnswered ? (
                      <View style={[
                        styles.resultBadge,
                        isCorrect ? styles.correctBadge : styles.incorrectBadge
                      ]}>
                        <Text style={[
                          styles.resultBadgeText,
                          isCorrect ? styles.correctBadgeText : styles.incorrectBadgeText
                        ]}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.skippedBadge}>
                        <Text style={styles.skippedBadgeText}>Skipped</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.answerQuestionText}>{question.questionText}</Text>
                  
                  {isAnswered && (
                    <View style={styles.answerDetail}>
                      <Text style={styles.answerLabel}>Your answer:</Text>
                      <Text style={[
                        styles.answerValue,
                        isCorrect ? styles.correctAnswerText : styles.incorrectAnswerText
                      ]}>
                        {answer.selectedOption}
                      </Text>
                      
                      {!isCorrect && (
                        <>
                          <Text style={styles.answerLabel}>Correct answer:</Text>
                          <Text style={styles.correctAnswerText}>{question.correctAnswer}</Text>
                        </>
                      )}
                      
                      <Text style={styles.explanationText}>{question.explanation}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
        
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.exitButton}
            onPress={handleExitQuiz}
          >
            <Text style={styles.exitButtonText}>Return to Quizzes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={`Question ${currentQuestionIndex + 1}/${questions.length}`} 
        leftComponent={
          <TouchableOpacity onPress={() => {
            Alert.alert(
              "Exit Quiz?",
              "Are you sure you want to exit? Your progress will be lost.",
              [
                { text: "Stay", style: "cancel" },
                { text: "Exit", style: "destructive", onPress: () => router.back() }
              ]
            );
          }}>
            <X size={24} color="#0F3460" />
          </TouchableOpacity>
        }
        rightComponent={
          <View style={styles.timerContainer}>
            <Clock size={18} color={timeRemaining < 60 ? "#DC2626" : "#0F3460"} />
            <Text style={[
              styles.timerText,
              timeRemaining < 60 && styles.timerWarning
            ]}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
        }
      />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <View style={styles.questionMeta}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{currentQuestion.categoryName}</Text>
            </View>
            <Text style={styles.difficultyText}>
              {currentQuestion.difficulty === 'easy' ? 'Easy' : 
               currentQuestion.difficulty === 'medium' ? 'Medium' : 'Hard'}
            </Text>
          </View>
          
          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option && styles.selectedOption,
                ]}
                onPress={() => handleOptionSelect(option)}
                disabled={!!selectedOption}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.actionBar}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            !selectedOption && styles.nextButtonDisabled
          ]}
          onPress={handleNextQuestion}
          disabled={!selectedOption}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Submit Quiz"}
          </Text>
          <ArrowRight size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0F3460',
    marginLeft: 4,
  },
  timerWarning: {
    color: '#DC2626',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#0F3460',
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  questionText: {
    fontSize: 18,
    fontFamily: 'Roboto-Medium',
    color: '#1E293B',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedOption: {
    backgroundColor: '#E2E8F0',
    borderColor: '#0F3460',
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F3460',
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  progressInfo: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  nextButton: {
    backgroundColor: '#0F3460',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginRight: 8,
  },
  // Results styles
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: '#1E293B',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0F3460',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
  },
  resultStats: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#0F3460',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  resultFeedback: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 24,
  },
  answersSection: {
    padding: 16,
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  answerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#1E293B',
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  correctBadge: {
    backgroundColor: '#DCFCE7',
  },
  incorrectBadge: {
    backgroundColor: '#FEE2E2',
  },
  skippedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  resultBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  correctBadgeText: {
    color: '#16A34A',
  },
  incorrectBadgeText: {
    color: '#DC2626',
  },
  skippedBadgeText: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  answerQuestionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginBottom: 12,
  },
  answerDetail: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  answerValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  correctAnswerText: {
    color: '#16A34A',
    marginBottom: 12,
  },
  incorrectAnswerText: {
    color: '#DC2626',
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    lineHeight: 22,
    marginTop: 8,
  },
  exitButton: {
    backgroundColor: '#0F3460',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  exitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});