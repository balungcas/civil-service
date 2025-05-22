import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Calendar, BookOpen, Award, TrendingUp } from 'lucide-react-native';
import { getStudyStatistics } from '@/utils/statistics';
import Header from '@/components/Header';
import ProgressCard from '@/components/ProgressCard';

export default function HomeScreen() {
  const router = useRouter();
  const [statistics, setStatistics] = useState({
    questionsAnswered: 0,
    quizzesTaken: 0,
    studyDays: 0,
    correctRate: 0
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      const stats = await getStudyStatistics();
      setStatistics(stats);
    };
    
    fetchStatistics();
  }, []);

  const categories = [
    {
      id: 1,
      title: 'Numerical Ability',
      questions: 120,
      icon: '🔢',
      color: '#0F3460'
    },
    {
      id: 2,
      title: 'Verbal Ability',
      questions: 150,
      icon: '📝',
      color: '#950101'
    },
    {
      id: 3,
      title: 'Analytical Ability',
      questions: 80,
      icon: '🧠',
      color: '#38598B'
    },
    {
      id: 4,
      title: 'General Information',
      questions: 100,
      icon: '🌎',
      color: '#113F67'
    },
    {
      id: 5,
      title: 'Philippine Constitution',
      questions: 75,
      icon: '📜',
      color: '#5C6D70'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Civil Service Exam Reviewer" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.greeting}>Hello, Reviewer!</Text>
          <Text style={styles.subtitle}>Ready to continue your preparation?</Text>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => router.push('/practice')}
          >
            <Text style={styles.startButtonText}>Start Practicing</Text>
            <ArrowRight size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <ProgressCard 
              icon={<BookOpen size={24} color="#0F3460" />}
              title="Questions"
              value={statistics.questionsAnswered}
            />
            <ProgressCard 
              icon={<Award size={24} color="#950101" />}
              title="Quizzes"
              value={statistics.quizzesTaken}
            />
            <ProgressCard 
              icon={<Calendar size={24} color="#113F67" />}
              title="Study Days"
              value={statistics.studyDays}
            />
            <ProgressCard 
              icon={<TrendingUp size={24} color="#38598B" />}
              title="Correct"
              value={`${statistics.correctRate}%`}
            />
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryCard}
              onPress={() => router.push({
                pathname: '/practice',
                params: { categoryId: category.id }
              })}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Text style={styles.categoryIconText}>{category.icon}</Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryMeta}>{category.questions} questions</Text>
              </View>
              <ArrowRight size={20} color="#0F3460" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Study Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Consistency is Key</Text>
            <Text style={styles.tipText}>
              Study for at least 30 minutes every day instead of cramming for hours once a week.
            </Text>
          </View>
        </View>
        
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    padding: 24,
    backgroundColor: '#0F3460',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#950101',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginRight: 8,
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#1E293B',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoriesSection: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryIconText: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginBottom: 4,
  },
  categoryMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  tipsSection: {
    padding: 16,
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#0F3460',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    lineHeight: 22,
  },
  footer: {
    height: 40,
  }
});