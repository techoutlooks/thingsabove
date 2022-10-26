/***
 * Ring pulse animation
 * Adapted from:
 * https://www.codedaily.io/tutorials/Creating-Animated-Rings-with-React-Native-Reanimated
 */
 import React, { useEffect } from "react";
 import { ViewProps } from "react-native";
 import styled from 'styled-components/native'
 
 import Animated, { useAnimatedStyle, useSharedValue, 
   withDelay, withRepeat, withTiming, interpolate } from "react-native-reanimated";
 


/***
 * @param {number} delay: Delay to start
 * @param {number} duration: How long the animation should last
 */
type Props = { 
  delay: number, 
  duration?: number 
} & ViewProps



export default({ delay, duration=4000, style }: Props) => {

const ring = useSharedValue(0);

const rStyle = useAnimatedStyle(() => ({
  opacity: 0.8 - ring.value,
  transform: [{ scale: interpolate(ring.value, [0, 1], [0, 4]) }],
}))

useEffect(() => {
  ring.value = withDelay(delay, withRepeat(
    withTiming(1, { duration }), -1, false ))
}, [])

return <Ring style={[style, rStyle]} />
}


const Ring = styled(Animated.View).attrs(p => ({ 
  width: 80, height: 80, borderRadius: 40,
  borderWidth: 10, borderColor: "tomato",
  ...p
}))`
  position: absolute;
`
 