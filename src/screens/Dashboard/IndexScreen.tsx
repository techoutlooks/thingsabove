
import React, { useEffect, useReducer, Reducer } from "react"
import { Feather as Icon } from '@expo/vector-icons'
import styled, {useTheme} from "styled-components/native"

import { ItemTypes, Shareable, Sharing } from "@/types/models"
import { useLatestPrayers, useShareables } from "@/hooks"
import * as atoms from "@/components/uiStyle/atoms"
import { AppHeader  } from "@/components"
import SharedItemList from "./SharedItemList"



export default () => {

  const { sent, received} = useShareables({ itemType: ItemTypes.PRAYER })
  const prayers = useLatestPrayers()
  

  return (
    <Container>
      <AppHeader title="My Dashboard" />
      <SharedItemList items={received} heading="Received Lately ..." />
      <SharedItemList items={sent} heading="Shared Lately ..." />
      <SharedItemList items={prayers} heading="Prayed Lately ..." />      
    </Container>
  )
}

export const Container = styled(atoms.ScreenCard)`
  padding: 0 16px;
  justify-content: flex-start;
  // flex: 1;
`