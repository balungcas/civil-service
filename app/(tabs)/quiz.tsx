import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, CircleCheck as CheckCircle, Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';

export default function QuizScreen() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: 'Quick Practice',
      description: '10 random questions - 10 minutes',
      icon: <Clock size={24} color="#0F3460" />,
      questions: 10,
      timeLimit: 10, // in minutes
      difficulty: 'Mixed',
    },
    {
      id: 2,
      title: 'Full Mock Exam',
      description: '100 questions - 2 hours 30 minutes',
      icon: <Trophy size={24} color="#950101" />,
      questions: 100,
      timeLimit: 150, // in minutes
      difficulty: 'Hard',
    },
    {
      id: 3,
      title: 'Verbal Ability Focus',
      description: '25 verbal questions - 30 minutes',
      icon: <CheckCircle size={24} color="#38598B" />,
      questions: 25,
      timeLimit: 30, // in minutes
      difficulty: 'Medium',
      categoryId: 2, // Verbal Ability
    },
    {
      id: 4,
      title: 'Numerical Skills',
      description: '20 math questions - 30 minutes',
      icon: <Clock size={24} color="#113F67" />,
      questions: 20,
      timeLimit: 30, // in minutes
      difficulty: 'Medium',
      categoryId: 1, // Numerical Ability
    },
    {
      id: 5,
      title: 'Philippine Constitution',
      description: '15 questions - 20 minutes',
      icon: <CheckCircle size={24} color="#5C6D70" />,
      questions: 15,
      timeLimit: 20, // in minutes
      difficulty: 'Medium',
      categoryId: 5, // Philippine Constitution
    },
  ]);

  const handleStartQuiz = (quizId: number) => {
    const selectedQuiz = quizzes.find(quiz => quiz.id === quizId);
    
    Alert.alert(
      "Start Quiz",
      `You are about to start a ${selectedQuiz?.title} with ${selectedQuiz?.questions} questions. You will have ${selectedQuiz?.timeLimit} minutes to complete it.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Start", 
          onPress: () => router.push({
            pathname: '/quiz-session',
            params: { quizId: quizId }
          })
        }
      ]
    );
  };

  const renderQuizCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.quizCard}
      onPress={() => handleStartQuiz(item.id)}
    >
      <View style={styles.quizIconContainer}>
        {item.icon}
      </View>
      <View style={styles.quizInfo}>
        <Text style={styles.quizTitle}>{item.title}</Text>
        <Text style={styles.quizDescription}>{item.description}</Text>
        <View style={styles.quizMetaContainer}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
          <Text style={styles.questionCount}>
            {item.questions} questions
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Quiz Mode" />
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Available Quizzes</Text>
        <Text style={styles.sectionDescription}>
          Take timed quizzes to test your knowledge under exam conditions
        </Text>
        
        <FlatList
          data={quizzes}
          renderItem={renderQuizCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 24,
  },
  listContent: {
    paddingBottom: 16,
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quizIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
  },
  quizMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#0F3460',
  },
  questionCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
});