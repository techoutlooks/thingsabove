import {createNativeStackNavigator} from "@react-navigation/native-stack";

import DiscoverScreen from "./DiscoverScreen"
import LatestPrayersScreen from "./LatestPrayersScreen"
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
      <Stack.Screen name="LatestPrayers" component={LatestPrayersScreen} />
      <Stack.Screen name="TeamsMap" component={TeamsMapScreen} />
    </Stack.Navigator>
  )
}



