
import React, { useEffect, useCallback } from "react"
import { Feather as Icon } from '@expo/vector-icons'
import styled, {useTheme} from "styled-components/native"

import { ItemTypes, Shareable, Sharing } from "@/types/models"
import { DirectionTypes } from "@/state/sharings"
import { useLatestPrayers, useShareables } from "@/hooks"
import * as atoms from "@/components/uiStyle/atoms"
import { AppHeader  } from "@/components"
import LatestItemsList from "./LatestItemsList"


/***
 * Fetches last 10 shared items in each category.
 */
export default ({ navigation }) => {

  const { sent, received} = useShareables({ itemType: ItemTypes.PRAYER })
  const prayers = useLatestPrayers()
  
  const mkNavigateToSarings = useCallback((direction: DirectionTypes) => 
    () => navigation.navigate("Dashboard", { screen: "MySharings", 
            params: { direction } }), [])

  const navigateToPrayers = useCallback(() => 
    navigation.navigate("Dashboard", { screen: "MyPrayers" }), [])
  

  return (
    <Container>
      <AppHeader title="My Dashboard" />

      <LatestItemsList items={received} 
        heading="Received Lately ..." 
        onViewAll={mkNavigateToSarings(DirectionTypes.RECEIVED)}
      />
      <LatestItemsList items={sent} 
        heading="Shared Lately ..." 
        onViewAll={mkNavigateToSarings(DirectionTypes.SENT)}
      />
      
      <LatestItemsList items={prayers} 
        heading="Prayed Lately ..." 
        onViewAll={navigateToPrayers}
      />      
    </Container>
  )
}



export const Container = styled(atoms.ScreenCard)`
  padding: 0 16px;
  justify-content: flex-start;
`