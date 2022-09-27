
import { useCallback } from 'react'
import { Text, TouchableOpacity } from "react-native"
import styled from "styled-components/native"

import { selectPrayerById } from '@/state/prayers'
import Prayer from "@/types/prayer"
import { useScreensContext } from "./PrayerContext"

import { AppHeader, PrayerView } from "@/components";
import {ScreenCard } from '@/components/uiStyle/atoms'
import { useSelector } from 'react-redux'



/***
 * <PreviewScreen /> Previews a prayer.
 * Expects `prayerId` from route; otherwise picks it from context.
 * `prayerId` is available from context iff prayer is being edited, 
 * ie. if we navigated here from `EditInfoScreen`
 * 
 */
export default ({ navigation, route }) => {

  const { params: { prayerId } } = route
  const { prayerInput } = useScreensContext()
  const prayer = useSelector(selectPrayerById(
    prayerId ?? prayerInput?.prayerId ))

  return (
    <Container>
      <AppHeader title={`Prayer Preview (${prayer?.published ? 'Published' : 'Private'})`} />      
      <PrayerView {...{prayerId: prayer?.id}} />
    </Container>
  )
}


const Container = styled(ScreenCard)`
  padding: 0 12px;
`
