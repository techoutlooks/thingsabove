import React, {useState, ReactElement, ComponentProps, useEffect} from "react";
import styled from "styled-components/native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useSharedValue, useAnimatedGestureHandler, useAnimatedStyle, 
  withSpring, interpolate, Extrapolate, runOnJS,

} from "react-native-reanimated";


import useLayout from "./useLayout";
import { Row } from "./elements";
import {PADDING, RADIUS} from "./constants";
import {getChildren} from "@/lib/utils";



/**
 * **Swiper** component with:
 * - dynamic height based on swipeable content
 * - Swiper width = swipeable width + PADDING
 * @param param0 
 * @returns 
 */
type Props = {
  text: string, 
  reset: boolean, // 
  onToggle?: (swipedOn: boolean) => void
} & ComponentProps<typeof Container>
const Swiper = 
  ({children, text, reset, 
    onLayout: callback, onToggle, ...rest}: Props) => {
  
  // get/set dims of container & swipeable dynamically, since dims (by flexbox)
  // are unpredictable. also pass dims to `onLayout()` callback registered by 
  // this component
  const [{width}, onLayout] = useLayout({padding: true}) 
  const [swipeableDims, onSwipeableLayout] = useLayout({padding: true, callback })
  const [swipedOn, setSwipedOn] = useState(false)
  
  // animation drive (screen horizontal swipe)
  const x = useSharedValue(0)
  const swipeRange = width - swipeableDims.width - 2*PADDING;
  const onGestureEvent = useAnimatedGestureHandler({
    onActive: e => {x.value = e.translationX},
    onEnd: e => {
      if(x.value < swipeRange/2) {
        x.value = withSpring(0)
        runOnJS(setSwipedOn)(false)
      } else {
        x.value = withSpring(swipeRange)
        runOnJS(setSwipedOn)(true)
      }
    }
  })

  // animated styles
  const rStyles = {
    swipeable: useAnimatedStyle(() => ({
      transform: [{translateX: x.value}]
    })),
    swipeText: useAnimatedStyle(() => ({
      opacity: interpolate(x.value, 
        [0, swipeRange], [1,0], Extrapolate.CLAMP),
      transform: [{translateX: interpolate(x.value, 
        [0, swipeRange], [0, width/2 - swipeableDims.width], Extrapolate.CLAMP)}] 
      })),
    swipeOverlay: useAnimatedStyle(() => ({
      opacity: interpolate(x.value, [0, swipeRange], [0, 1]),
      width: swipeableDims.width + x.value
    }))
  }

  // call `onToggle()` callback asynchrounously if supplied
  useEffect(() => { onToggle && onToggle(swipedOn) }, [swipedOn])

  useEffect(() => { x.value = 0; setSwipedOn(false) }, [reset])


  // <Swipeable/> : apply rStyles, props dynamically. 
  // assumed to be Swiper's only child !
  const swipeable = React.cloneElement(
    getChildren(children, ['Swipeable'])[0], {
    style:[rStyles.swipeable],
    onLayout: onSwipeableLayout
  });

  const underlay = getChildren(children, ['Underlay'])[0];

  return (
    <Container 
      {...{...rest, ...{style: {height: swipeableDims.height}}, onLayout}} 
    >
        {underlay}
        <SwipeOverlay 
          style={[{...swipeableDims}, rStyles.swipeOverlay]} />
        <PanGestureHandler 
          {...{onGestureEvent, children:swipeable }} />
        <SwipeText style={[rStyles.swipeText]} >{text}</SwipeText>
    </Container>
  );
};


const Underlay = styled.View`
  z-index: 2;
  position: absolute; top: 0; bottom: 0; left: 0; right: 0; // absoluteFill
`
const SwipeOverlay = styled(Animated.View)`
  background-color: ${p => p.theme.colors.cardBg};

  position: absolute;
  left: 0;
  // border-radius: ${RADIUS};
  z-index: 3;
`
const SwipeText = styled(Animated.Text)`
  color: ${p => p.theme.colors.titleFg};
  z-index: 4;
`
const Swipeable = styled(Animated.View)`
  position: absolute;
  left: ${PADDING}px;
  z-index: 5;
`
const Container = styled(Row)`
  width: 100%;
  background-color: ${p => p.theme.colors.inputBgDown};
  border-radius: 10px;
  padding: ${PADDING}px; 
`


Swipeable.defaultProps = {
  __TYPE: 'Swipeable'
}

Underlay.defaultProps = {
  __TYPE: 'Underlay'
}


export {Swiper, Swipeable, Underlay};
