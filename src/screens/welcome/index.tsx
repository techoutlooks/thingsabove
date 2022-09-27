import {createNativeStackNavigator} from "@react-navigation/native-stack";

import DiscoverScreen from "./DiscoverScreen"
import PrayersByTopicScreen from "./PrayersByTopicScreen"
import TeamsMapScreen from "./TeamsMapScreen";


const Stack = createNativeStackNavigator();

/***
 * Create or Edit a prayer i successive screens
 */
export default () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen name="PrayersByTopic" component={PrayersByTopicScreen} />
      <Stack.Screen name="TeamsMap" component={TeamsMapScreen} />
    </Stack.Navigator>
  )
}



