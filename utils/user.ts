import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Clear user data (for logout)
export const clearUserData = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    // For web, use localStorage
    localStorage.removeItem('user_data');
    return;
  }
  
  try {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_profile');
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw error;
  }
};