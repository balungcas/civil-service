import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { QuestionCategory } from '@/types/Question';

type CategoryFilterProps = {
  categories: QuestionCategory[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
};

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory && styles.selectedCategory
          ]}
          onPress={() => onSelectCategory(null)}
        >
          <Text style={[
            styles.categoryButtonText,
            !selectedCategory && styles.selectedCategoryText
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory,
              { borderColor: category.color }
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.selectedCategoryText,
              selectedCategory === category.id && { color: category.color }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  selectedCategory: {
    backgroundColor: '#F1F5F9',
    borderColor: '#0F3460',
  },
  selectedCategoryText: {
    color: '#0F3460',
  },
});