import React, { useCallback } from "react"
import { Animated, FlatList, LayoutChangeEvent } from "react-native"
import styled, { useTheme } from "styled-components/native"

import { AnimatedPrayerView } from "./AnimatedPrayerView"



const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

export default styled(({prayers: data}) => {

  // items animation drive
  const y = new Animated.Value(0)
  const onScroll = Animated.event(
    [{ nativeEvent: {contentOffset: { y }}}], { useNativeDriver: true })

  // item rendered 
  const keyExtractor = useCallback((item, i) => `${i}.${item.id}`, [])
  const renderItem = useCallback(({item: prayer, index}) => (
    <AnimatedPrayerView {...{ y, index, prayer }} /> ), [y])

  return (
    <AnimatedFlatList {...{ 
      data, renderItem, keyExtractor, onScroll,
      scrollEventThrottle: 16, bounces: false,
      showsVerticalScrollIndicator: false
    }} />
  )

})``
