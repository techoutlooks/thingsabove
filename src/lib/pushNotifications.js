import * as Permissions from 'expo-permissions'
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    alert('Must use physical device for Push Notifications')
  } else {
    try {
      await assertPermission(Permissions.NOTIFICATIONS)
      const token = await Notifications.getExpoPushTokenAsync()
      console.log(token)

      console.log('OS', Platform.OS)
    } catch (err) {
      console.log('eer', err)
    }
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('messages', {
      name: 'messages',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    // Notifications.createChannelAndroidAsync('messages', {
    //   name: 'messages',
    //   sound: true,
    //   priority: 'max',
    //   vibrate: [0, 250, 250, 250],
    // })
  }
}

const assertPermission = async (permission) => {
  const { status: existingStatus } = await Permissions.getAsync(permission)
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Permissions.askAsync(permission)
    finalStatus = status
  }
  if (finalStatus !== 'granted') {
    throw new Error(`Could not get permission for ${permission}`)
  }
}
