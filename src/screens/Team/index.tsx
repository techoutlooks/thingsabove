import {createNativeStackNavigator} from "@react-navigation/native-stack";
import { useSelector } from "react-redux"; 
import {selectIsAuthed} from "@/state/auth"

import TeamPrayersScreen from "./TeamPrayersScreen"

const Stack = createNativeStackNavigator();


export default () => {

  const isAuthed = useSelector(selectIsAuthed)

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen 
        name="TeamPrayers" 
        component={TeamPrayersScreen} 
      />
    </Stack.Navigator>
  )
  
}

