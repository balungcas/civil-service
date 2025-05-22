import { View, Text, StyleSheet } from 'react-native';

type ProgressCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
};

export default function ProgressCard({ icon, title, value }: ProgressCardProps) {
  return (
    <View style={styles.card}>
      {icon}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  value: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
});