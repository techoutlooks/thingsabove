
import React, { useEffect, useReducer, Reducer } from "react"
import { ViewProps } from "react-native"
import { Feather as Icon } from '@expo/vector-icons'
import styled, {useTheme} from "styled-components/native"

import { ItemTypes, Shareable, Sharing } from "@/types/models"
import { useShareables, useSharingsArgs } from "@/hooks"
import * as atoms from "@/components/uiStyle/atoms"


/**
 * Reducer 
 * Get actual content (prayers, etc.) back from shared items pointers (sharings)
 * ie., Sharing -> Shareable */
type A = Pick<ReturnType<typeof useShareables>, 'received'|'sent'>
type S = atoms.Accordion.ListType[] 
type R = Reducer<S, A>


const makeAccordionData: R = (s, a) => Object.entries(a)
  .map(([direction, shareables]) => ({
    title: direction,
    items: shareables.map((s => ({ name: s.title, points: 'nay' })))
  }))



type Props = ViewProps & Pick<useSharingsArgs, 'limit'>

export default ({ limit, ...props}: Props) => {

  const prayers = useShareables({ itemType: ItemTypes.PRAYER, limit })
  const [prayersItems, setPrayers] = useReducer<R, A>(makeAccordionData, prayers, makeAccordionData)
  
  // keep notifications up-to-date with state
  useEffect(() => { setPrayers(prayers) }, [prayers.received, prayers.sent])

  return (
    <Container {...props}>
      <atoms.Accordion.Accordion {...{ data: prayersItems }} />
    </Container>
  )
}


export const Container = styled.View `
  padding: 16px;
`
