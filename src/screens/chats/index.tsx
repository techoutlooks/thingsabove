import {createNativeStackNavigator} from "@react-navigation/native-stack";
import { useSelector } from "react-redux"; 
import {selectIsAuthed} from "@/state/auth"

import ChatsScreen from '@/screens/Chats/ChatsScreen'
import ChatScreen from '@/screens/Chats/chat'
import NewChatScreen from '@/screens/Chats/newChat'
// import StartChatScreen from './screens/startChat'

const Stack = createNativeStackNavigator();


export default () => {

  const isAuthed = useSelector(selectIsAuthed)

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
    <Stack.Screen name="Chats" component={ChatsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="NewChat" component={NewChatScreen} />
      {/* <Stack.Screen name="StartChat" component={StartChatScreen}/> */}
    </Stack.Navigator>
  )
  
}






