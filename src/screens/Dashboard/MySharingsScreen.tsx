import React, { useCallback, useReducer, Reducer, useState } from "react"
import { useSelector, useStore } from "react-redux"
import { Animated, FlatList, LayoutChangeEvent } from "react-native"
import styled, { useTheme } from "styled-components/native"
import { Feather as Icon } from '@expo/vector-icons';

import { ItemTypes, Shareable, Sharing } from "@/types/models"
import { DirectionTypes } from "@/state/sharings"
import * as atoms from "@/components/uiStyle/atoms"
import { useAuthId, useShareables } from "@/hooks"
import { AppHeader, AnimatedPrayerViewList  } from "@/components"
import { Heading1, Container } from "./elements"


const screenData = { 
  [DirectionTypes.RECEIVED]: {
    title: "Inbox", 
    heading: "All Received Items "
  },
  [DirectionTypes.SENT]: {
    title: "Sentbox", 
    heading: "All Sent Items "
  }
}



export default ({ route }) => {

  const { params: { direction }} = route

  const { sent: sentPrayers, received: receivedPrayers } = useShareables({ 
    itemType: ItemTypes.PRAYER, limit: 100 })

  
  return (
    <Container>

      <AppHeader title={screenData[direction]?.title} />
      <atoms.Spacer height={24} />
      <Heading1>
        <Icon name="activity" size={18}  />
        {' '}{screenData[direction]?.heading}
      </Heading1>
      <atoms.Spacer height={16} />

      <AnimatedPrayerViewList {...{ prayers: 
        direction===DirectionTypes.RECEIVED ? receivedPrayers : sentPrayers }} />

    </Container>
  )
}




