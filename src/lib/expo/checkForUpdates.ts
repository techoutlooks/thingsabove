import { Alert } from 'react-native';
import {
  checkForUpdateAsync,
  reloadAsync,
  fetchUpdateAsync,
} from 'expo-updates';

const checkForUpdates = async (showSuccess = false): Promise<void> => {
  console.log('Checking for updates...');

  if (__DEV__) {
    if (showSuccess) {
      Alert.alert('Development', "Can't check for updates in development.");
    }
    return;
  }

  try {
    const update = await checkForUpdateAsync();
    if (update.isAvailable) {
      await fetchUpdateAsync();
      Alert.alert(
        'App successfully updated',
        'The app has been updated to the latest version. The app will now restart.',
        [{ text: 'OK', onPress: async () => reloadAsync() }],
        { cancelable: false }
      );
    } else if (showSuccess) {
      Alert.alert(
        'Up to date',
        'You already have the latest version of the app.'
      );
    }
  } catch (error) {
    console.log(error);
    Alert.alert('Error', 'An error occurred while checking for updates.');
  }
};

export default checkForUpdates;
