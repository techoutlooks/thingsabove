import React, { useState, useRef } from 'react'
import styled from 'styled-components/native'
import { View, TouchableWithoutFeedback, Animated, Easing } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'


const SendIcon = React.memo(styled(({ onPress, style, show }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current
  
    React.useEffect(() => {
      const animation = show
        ? {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.poly(3)),
            useNativeDriver: true 
          }
        : {
            toValue: 0,
            duration: 100,
            easing: Easing.in(Easing.poly(3)),
            useNativeDriver: true 
          }
  
      Animated.timing(fadeAnim, animation).start()
    }, [show])
  
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={style}>
          <Animated.View
            style={{
              transform: [{ scale: fadeAnim || 0 }],
              opacity: fadeAnim,
            }}
          >
            <MaterialSendIcon />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    )
  })`
    align-self: stretch;
    align-items: center;
    justify-content: center;
    padding-right: 12px;
    padding-left: 12px;
  `
)
  
  const MaterialSendIcon = props => (
    <MaterialCommunityIcons name="send" size={24} color="#554691" {...props} />
  )
  

export default SendIcon;