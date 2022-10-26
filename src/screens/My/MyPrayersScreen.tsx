import React, { useCallback, useReducer, Reducer, useState } from "react"
import { useSelector, useStore } from "react-redux"
import { Animated, FlatList, LayoutChangeEvent } from "react-native"
import styled, { useTheme } from "styled-components/native"
import { Feather } from '@expo/vector-icons';

import { selectPrayersByUserId } from "@/state/prayers"
import { useAuthId } from "@/hooks"
import { AppHeader, AnimatedPrayerView  } from "@/components"
import {ScreenCard, Text } from '@/components/uiStyle/atoms'


// formatDistance(0, prayer.duration * 1000, { includeSeconds: true })
export default () => {

  const userId = useAuthId() 
  // const prayers = useSelector(selectPrayersByUserId(userId))
  const store= useStore()
  const prayers = selectPrayersByUserId(userId)(store.getState())


  const theme = useTheme()
  
  return (
    <Container>
      <AppHeader title="My Prayers" />
      <Header1><Feather name="activity" size={18}  />{' '}  Prayed lately ...</Header1>
      <PrayerList {...{ prayers }} />
    </Container>
  )
}

const Header1 = styled(Text)`
  font-family: SFProDisplay-Bold;
  margin: 24px 0 8px 0;
`

const Container = styled(ScreenCard)`
  padding: 0 12px;
`

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

