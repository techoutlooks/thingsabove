import React from "react";
import { TouchableOpacity, Image } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons as Icon} from '@expo/vector-icons';
import { useTheme } from "styled-components/native";
import HomeStackNavigator  from "./HomeStackNavigator";
import ChatsStack  from "@/screens/Chats";
import { PrayersMapScreen } from "@/screens/Prayers";
import * as appImages from '../../assets';


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
          // tabBarIcon: ({size, color}) => (
          //   <Icon name="praying-hands" color={color} size={size} />)
          tabBarIcon: ({size, color}) => (
            <Image source={appImages.branding.icon} resizeMode='cover'
              style={{ width: 45, height: 40 }}
            />
          )
        }}
      />
      <Tab.Screen name="Heat Map" 
        component={PrayersMapScreen} 
        options={{
          tabBarIcon: ({size, color}) => (
            <Icon name="location-outline" color={color} size={size} />)
        }}
      />
      <Tab.Screen name="Friends" 
        component={ChatsStack} 
        options={{
          tabBarIcon: ({size, color}) => (
            <Icon name="person-outline" color={color} size={size} />)
        }}
      />
      <Tab.Screen name="Rooms" 
        component={ChatsStack} 
        options={{
          tabBarIcon: ({size, color}) => (
            <Icon name="flame-outline" color={color} size={size} />)
        }}
      />
      <Tab.Screen name="More"  
        component={ButtonScreen}
        options={({navigation})=> ({
          tabBarIcon: ({size, color}) => (
            <Icon name="ellipsis-horizontal-outline" color={color} size={size} />),
          tabBarButton: props => (
            <TouchableOpacity {...props} onPress={()=> navigation.toggleDrawer()} />)
      })}/>


    </Tab.Navigator>
  )

}

