import React, { useCallback, useReducer, Reducer, useState } from "react"
import { useSelector, useStore } from "react-redux"
import { Animated, FlatList, LayoutChangeEvent } from "react-native"
import styled, { useTheme } from "styled-components/native"
import { Feather as Icon } from '@expo/vector-icons';

import { selectPrayersByUserId } from "@/state/prayers"
import { useAuthId } from "@/hooks"
import { AppHeader, AnimatedPrayerView  } from "@/components"
import { Heading1, Container } from "./elements"


// formatDistance(0, prayer.duration * 1000, { includeSeconds: true })
export default ({ route }) => {

  
  const userId = useAuthId() 
  // const prayers = useSelector(selectPrayersByUserId(userId))
  const store= useStore()
  const prayers = selectPrayersByUserId(userId)(store.getState())


  const theme = useTheme()
  
  return (
    <Container>
      <AppHeader title="My Inbox" />
      <Heading1><Icon name="activity" size={18}  />{' '}  Shared with me ...</Heading1>
      <PrayerList {...{ prayers }} />
    </Container>
  )
}



const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

const PrayerList = styled(({prayers: data}) => {

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

