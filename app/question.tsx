import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Bookmark, Check, X } from 'lucide-react-native';
import { getQuestion, markQuestionAnswered } from '@/utils/database';
import { toggleBookmark, isQuestionBookmarked } from '@/utils/bookmarks';
import { Question as QuestionType } from '@/types/Question';
import Header from '@/components/Header';

export default function QuestionScreen() {
  const { questionId, topicId } = useLocalSearchParams();
  const router = useRouter();
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        // In a real app, this would fetch from the database
        const mockQuestion = {
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
        };
        setQuestion(mockQuestion);
        
        // Check if question is bookmarked
        const bookmarkStatus = await isQuestionBookmarked(parseInt(questionId as string));
        setIsBookmarked(bookmarkStatus);
      } catch (error) {
        console.error("Error loading question:", error);
      }
    };
    
    loadQuestion();
  }, [questionId, topicId]);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    setIsCorrect(option === question?.correctAnswer);
    
    // In a real app, save the answer to the database
    if (question) {
      markQuestionAnswered(question.id, option === question.correctAnswer);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!question) return;
    
    try {
      const newBookmarkState = await toggleBookmark(question.id);
      setIsBookmarked(newBookmarkState);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleNextQuestion = () => {
    // In a real app, fetch the next question
    setSelectedOption(null);
    setIsAnswered(false);
    
    // For demo purposes, just going back to practice screen
    if (Platform.OS === 'web') {
      // For web, use window.history to navigate back
      router.back();
    } else {
      // For native platforms
      router.push('/practice');
    }
  };

  if (!question) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Question" leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0F3460" />
          </TouchableOpacity>
        } />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={question.topic || "Practice Question"} 
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0F3460" />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={handleBookmarkToggle}>
            <Bookmark 
              size={24} 
              color={isBookmarked ? "#FFD700" : "#0F3460"} 
              fill={isBookmarked ? "#FFD700" : "transparent"} 
            />
          </TouchableOpacity>
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
              <Text style={styles.categoryText}>{question.categoryName}</Text>
            </View>
            <Text style={styles.difficultyText}>
              {question.difficulty === 'easy' ? 'Easy' : 
              question.difficulty === 'medium' ? 'Medium' : 'Hard'}
            </Text>
          </View>
          
          <Text style={styles.questionText}>{question.questionText}</Text>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option && styles.selectedOption,
                  isAnswered && option === question.correctAnswer && styles.correctOption,
                  isAnswered && selectedOption === option && option !== question.correctAnswer && styles.incorrectOption
                ]}
                onPress={() => handleOptionSelect(option)}
                disabled={isAnswered}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={[
                  styles.optionText,
                  isAnswered && option === question.correctAnswer && styles.correctOptionText,
                  isAnswered && selectedOption === option && option !== question.correctAnswer && styles.incorrectOptionText
                ]}>
                  {option}
                </Text>
                {isAnswered && option === question.correctAnswer && (
                  <Check size={20} color="#16A34A" style={styles.resultIcon} />
                )}
                {isAnswered && selectedOption === option && option !== question.correctAnswer && (
                  <X size={20} color="#DC2626" style={styles.resultIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {isAnswered && (
          <View style={styles.explanationCard}>
            <Text style={styles.resultTitle}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </Text>
            <Text style={styles.explanationTitle}>Explanation:</Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}
      </ScrollView>
      
      {isAnswered && (
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>Next Question</Text>
            <ArrowRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
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
  correctOption: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  incorrectOption: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
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
  correctOptionText: {
    color: '#166534',
  },
  incorrectOptionText: {
    color: '#991B1B',
  },
  resultIcon: {
    marginLeft: 8,
  },
  explanationCard: {
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
  resultTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#1E293B',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    lineHeight: 24,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
  nextButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginRight: 8,
  },
});