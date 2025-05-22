import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HeaderProps = {
  title: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
};

export default function Header({ title, leftComponent, rightComponent }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {leftComponent}
      </View>
      
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      
      <View style={styles.rightContainer}>
        {rightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#1E293B',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
});