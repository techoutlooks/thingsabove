import {createNativeStackNavigator} from "@react-navigation/native-stack";

import EditFriendsScreen from './EditFriendsScreen'
import ViewContactScreen from './ViewContactScreen'

const Stack = createNativeStackNavigator();

export default () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="EditFriends" component={EditFriendsScreen} />
      <Stack.Screen name="ViewContact" component={ViewContactScreen} />
    </Stack.Navigator>
  )

}






