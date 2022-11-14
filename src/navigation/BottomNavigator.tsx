import React from "react";
import { TouchableOpacity, Image } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons as Icon} from '@expo/vector-icons';
import styled, { useTheme } from "styled-components/native";
import ChatsStack  from "@/screens/Chats";
import { PrayersMapScreen } from "@/screens/Prayers";

import AppStackNavigator  from "./AppStackNavigator";
import { LogoIcon } from "@/components";


const Tab = createBottomTabNavigator();
const ButtonScreen = () => null;



export default () => {
  const theme = useTheme()
  
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarLabelStyle: { fontSize: 12, fontFamily: 'SFProDisplay-Medium' },
        tabBarActiveTintColor: theme.colors.primaryButtonBg,
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Heat Map") {
              iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === "Friends") {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === "Rooms") {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === "More") {
            iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
          } 

          return <Icon name={iconName} size={18} color={color} />;
        }
    })}>
      <Tab.Screen name="Discover" 
        component={AppStackNavigator} 
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({size, color, focused}) => (
            <Logo {...{disabled: !focused}} />)
        }}
      />
      <Tab.Screen name="Heat Map" component={PrayersMapScreen} />
      <Tab.Screen name="Friends" component={ChatsStack} />
      <Tab.Screen name="Rooms" component={ChatsStack} />
      <Tab.Screen name="More"  component={ButtonScreen} 
        options={({navigation})=> ({
          tabBarButton: props => (
            <TouchableOpacity {...props} onPress={()=> navigation.toggleDrawer()} />)
      })}/>


    </Tab.Navigator>
  )

}


const Logo = styled(LogoIcon)`
  width: 45px; height: 55px;
  margin: 0 20px;
  border-width: 0;

`



