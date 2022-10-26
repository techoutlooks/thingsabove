import {createNativeStackNavigator} from "@react-navigation/native-stack";

import AddContactScreen from './AddContactScreen'
import ViewContactScreen from './ViewContactScreen'

const Stack = createNativeStackNavigator();

export default () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="AddContact" component={AddContactScreen} />
      <Stack.Screen name="ViewContact" component={ViewContactScreen} />
    </Stack.Navigator>
  )

}






