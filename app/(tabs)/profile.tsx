import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Bell, Moon, CircleHelp as HelpCircle, LogOut, Sparkles } from 'lucide-react-native';
import Header from '@/components/Header';
import { clearUserData } from '@/utils/user';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [aiQuestionsEnabled, setAiQuestionsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out? Your progress data will still be saved.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              await clearUserData();
              Alert.alert("Logged Out", "You have been successfully logged out.");
            } catch (error) {
              console.error("Error logging out:", error);
            }
          }
        }
      ]
    );
  };

  const toggleSwitch = (setting) => {
    switch (setting) {
      case 'notifications':
        setNotificationsEnabled(previous => !previous);
        break;
      case 'darkMode':
        setDarkModeEnabled(previous => !previous);
        break;
      case 'aiQuestions':
        setAiQuestionsEnabled(previous => !previous);
        break;
    }
  };

  const handleAIQuestionsInfo = () => {
    Alert.alert(
      "AI-Generated Questions",
      "When enabled, the app will occasionally include new questions generated by AI based on your performance and areas that need improvement. These questions are reviewed by our team for quality and relevance.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profile & Settings" />
      
      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileIconContainer}>
            <Text style={styles.profileIconText}>JD</Text>
          </View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>johndoe@example.com</Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>152</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>75%</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Bell size={20} color="#0F3460" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Study Reminders</Text>
            </View>
            <Switch
              trackColor={{ false: "#CBD5E1", true: "#0F3460" }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#CBD5E1"
              onValueChange={() => toggleSwitch('notifications')}
              value={notificationsEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Moon size={20} color="#0F3460" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              trackColor={{ false: "#CBD5E1", true: "#0F3460" }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#CBD5E1"
              onValueChange={() => toggleSwitch('darkMode')}
              value={darkModeEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Sparkles size={20} color="#0F3460" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>AI-Generated Questions</Text>
              <TouchableOpacity onPress={handleAIQuestionsInfo} style={styles.infoButton}>
                <HelpCircle size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Switch
              trackColor={{ false: "#CBD5E1", true: "#0F3460" }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#CBD5E1"
              onValueChange={() => toggleSwitch('aiQuestions')}
              value={aiQuestionsEnabled}
            />
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <LogOut size={20} color="#950101" style={styles.actionIcon} />
            <Text style={styles.actionText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>
            © 2025 Civil Service Exam Reviewer
          </Text>
        </View>
      </ScrollView>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F3460',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileIconText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginTop: 1,
    marginBottom: 16,
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
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
  },
  infoButton: {
    marginLeft: 8,
    padding: 2,
  },
  actionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#950101',
  },
  aboutSection: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
});