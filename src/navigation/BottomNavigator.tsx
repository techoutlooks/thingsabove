import React from "react";
import { TouchableOpacity } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 as Icon} from '@expo/vector-icons';
import { useTheme } from "styled-components/native";
import HomeStackNavigator  from "./HomeStackNavigator";
import ChatsStack  from "@/screens/Chats";


const Tab = createBottomTabNavigator();

const ButtonScreen = () => null;

export default () => {
  const theme = useTheme()
  
  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primaryButtonBg
      }}
    >
      <Tab.Screen name="Discover" 
        component={HomeStackNavigator} 
        options={{
          tabBarIcon: ({size, color}) => (<Icon name="praying-hands" color={color} size={size} />)
        }}
      />
      <Tab.Screen name="Messages" 
        component={ChatsStack} 
        options={{
          tabBarIcon: ({size, color}) => (<Icon name="comment-dots" color={color} size={size} />)
        }}
      />
      <Tab.Screen name="More"  
        component={ButtonScreen}
        options={({navigation})=> ({
          tabBarIcon: ({size, color}) => (<Icon name="angle-double-right" color={color} size={size} />),
          tabBarButton: props => <TouchableOpacity {...props} onPress={()=> navigation.toggleDrawer()} />
      })}/>


    </Tab.Navigator>
  )

}

