import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getBookmarkedQuestions, removeBookmark } from '@/utils/bookmarks';
import { Question } from '@/types/Question';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';

export default function BookmarksScreen() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const bookmarkedQuestions = await getBookmarkedQuestions();
      setBookmarks(bookmarkedQuestions);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = (questionId: number) => {
    Alert.alert(
      "Remove Bookmark",
      "Are you sure you want to remove this bookmark?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              await removeBookmark(questionId);
              setBookmarks(bookmarks.filter(item => item.id !== questionId));
            } catch (error) {
              console.error("Error removing bookmark:", error);
            }
          }
        }
      ]
    );
  };

  const handleQuestionPress = (questionId: number) => {
    router.push({
      pathname: '/question',
      params: { questionId }
    });
  };

  const renderBookmarkItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookmarkCard}
      onPress={() => handleQuestionPress(item.id)}
    >
      <View style={styles.bookmarkContent}>
        <Text style={styles.categoryLabel}>{item.categoryName}</Text>
        <Text style={styles.questionText} numberOfLines={2}>{item.questionText}</Text>
        <View style={styles.bookmarkMeta}>
          <Text style={styles.difficultyText}>
            {item.difficulty === 'easy' ? 'Easy' : 
             item.difficulty === 'medium' ? 'Medium' : 'Hard'}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveBookmark(item.id)}
      >
        <Trash2 size={20} color="#950101" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Bookmarked Questions" />
      
      <View style={styles.content}>
        {bookmarks.length > 0 ? (
          <FlatList
            data={bookmarks}
            renderItem={renderBookmarkItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon={<Bookmark size={48} color="#0F3460" />}
            title="No Bookmarks Yet"
            description="Questions you bookmark will appear here for easy access later."
            actionText="Start Practicing"
            onAction={() => router.push('/practice')}
          />
        )}
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
  listContent: {
    paddingBottom: 16,
  },
  bookmarkCard: {
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
  bookmarkContent: {
    flex: 1,
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#0F3460',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 22,
  },
  bookmarkMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  removeButton: {
    padding: 8,
  },
});