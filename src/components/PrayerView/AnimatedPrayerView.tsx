import { useCallback, useReducer, memo } from "react"

import styled, {useTheme} from "styled-components/native"
import { Animated, Dimensions, StyleSheet } from "react-native"


import {Prayer} from "@/types/models"
import * as atoms from "@/components/uiStyle/atoms"

import { UnmemoizedPrayerView } from "./PrayerView"



const { height: wHeight } = Dimensions.get("window")
const Y_HEIGHT = wHeight - 64
const Y_MARGIN = 16
const INIT_HEIGHT = 400 + 2*Y_MARGIN


/**
 * Animated <PrayerView /> with dynamic height.
 * Vertical animation driven by `y`
 */
 const UnmemoizedAnimatedPrayerView = ({ prayer, index, y, style }
  : {prayer: Prayer, y: Animated.Value, index: number}) => {

  const [height, setHeight] = useReducer((s,a) => a + 2*Y_MARGIN, INIT_HEIGHT)
  const onLayout = useCallback( ({nativeEvent}) => setHeight(nativeEvent.layout.height), [])

  const position = Animated.subtract(index * height, y);
  const isDisappearing = -height
  const isAppearing = Y_HEIGHT
  const isTop = 0;
  const isBottom = Y_HEIGHT - height

  // console.log(`????? prayer.id=${prayer?.id} index=${index} height=${height} -> `, .00001 + index * height)
  const translateY = Animated.add(
    Animated.add(
      y,
      y.interpolate({
        inputRange: [0, .00001 + index * height],
        outputRange: [0, -index * height],
        extrapolateRight: "clamp",
      })
    ),
    position.interpolate({
      inputRange: [isBottom, isAppearing],
      outputRange: [0, -height / 4],
      extrapolate: "clamp",
    })
  )
  const scale = position.interpolate({
    inputRange: [isDisappearing, isTop, isBottom, isAppearing],
    outputRange: [0.5, 1, 1, 0.5],
    extrapolate: "clamp",
  })

  const opacity = position.interpolate({
    inputRange: [isDisappearing, isTop, isBottom, isAppearing],
    outputRange: [0.5, 1, 1, 0.5],
  })

  return (
    <Animated.View key={index} style={[ styles.card, 
      {opacity, transform: [{ translateY }, { scale }]} 
    ]} >
      <StyledPrayerView {...{ prayerId: prayer.id, style }} /> 
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: Y_MARGIN,
    alignSelf: "center",
  },
})

const StyledPrayerView = styled(UnmemoizedPrayerView)`
  background-color: ${p => p.theme.colors.sentMessageBg};
  border-radius: ${atoms.RADIUS}px;
`


const AnimatedPrayerView = memo(UnmemoizedAnimatedPrayerView)
export { UnmemoizedAnimatedPrayerView, AnimatedPrayerView } 
