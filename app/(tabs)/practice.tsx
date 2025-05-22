import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, ArrowRight } from 'lucide-react-native';
import { getQuestionsByCategory } from '@/utils/database';
import { QuestionCategory } from '@/types/Question';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';

export default function PracticeScreen() {
  const router = useRouter();
  const { categoryId } = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    categoryId ? parseInt(categoryId as string) : null
  );
  const [showFilter, setShowFilter] = useState(false);

  const practiceTopics = [
    {
      id: 1,
      title: 'Reading Comprehension',
      description: '20 questions to test your understanding of written texts',
      categoryId: 2, // Verbal Ability
    },
    {
      id: 2,
      title: 'Math Word Problems',
      description: '15 questions on real-world math applications',
      categoryId: 1, // Numerical Ability
    },
    {
      id: 3,
      title: 'Logical Reasoning',
      description: '25 questions to test your logical thinking skills',
      categoryId: 3, // Analytical Ability
    },
    {
      id: 4,
      title: 'Philippines Geography',
      description: '10 questions about Philippine geography',
      categoryId: 4, // General Information
    },
    {
      id: 5,
      title: 'Government Structure',
      description: '15 questions about Philippine government',
      categoryId: 5, // Philippine Constitution
    },
    {
      id: 6,
      title: 'Grammar and Usage',
      description: '20 questions on correct grammar and usage',
      categoryId: 2, // Verbal Ability
    },
    {
      id: 7,
      title: 'Data Interpretation',
      description: '15 questions analyzing charts and tables',
      categoryId: 3, // Analytical Ability
    },
    {
      id: 8,
      title: 'Fractions and Decimals',
      description: '12 questions on fraction and decimal operations',
      categoryId: 1, // Numerical Ability
    },
  ];

  useEffect(() => {
    // Fetch categories from the database
    const fetchCategories = async () => {
      try {
        // In a real app, fetch this from the database
        const allCategories = [
          { id: 1, name: 'Numerical Ability', color: '#0F3460' },
          { id: 2, name: 'Verbal Ability', color: '#950101' },
          { id: 3, name: 'Analytical Ability', color: '#38598B' },
          { id: 4, name: 'General Information', color: '#113F67' },
          { id: 5, name: 'Philippine Constitution', color: '#5C6D70' },
        ];
        setCategories(allCategories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredTopics = selectedCategory 
    ? practiceTopics.filter(topic => topic.categoryId === selectedCategory) 
    : practiceTopics;

  const handleTopicPress = (topicId: number) => {
    router.push({
      pathname: '/question',
      params: { topicId }
    });
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setShowFilter(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Practice" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F3460" />
          <Text style={styles.loadingText}>Loading practice materials...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Practice" 
        rightComponent={
          <TouchableOpacity onPress={toggleFilter}>
            <Filter size={24} color="#0F3460" />
          </TouchableOpacity>
        }
      />

      {showFilter && (
        <CategoryFilter 
          categories={categories} 
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      )}

      <View style={styles.content}>
        {selectedCategory && (
          <View style={styles.selectedCategoryContainer}>
            <Text style={styles.selectedCategoryText}>
              Filtering: {categories.find(c => c.id === selectedCategory)?.name}
            </Text>
            <TouchableOpacity 
              onPress={() => setSelectedCategory(null)}
              style={styles.clearFilterButton}
            >
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={filteredTopics}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.topicCard}
              onPress={() => handleTopicPress(item.id)}
            >
              <View style={styles.topicContent}>
                <Text style={styles.topicTitle}>{item.title}</Text>
                <Text style={styles.topicDescription}>{item.description}</Text>
              </View>
              <ArrowRight size={20} color="#0F3460" />
            </TouchableOpacity>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  selectedCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  selectedCategoryText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  clearFilterText: {
    color: '#0F3460',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 16,
  },
  topicCard: {
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
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
});