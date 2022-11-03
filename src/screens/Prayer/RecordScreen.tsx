import React, {Reducer, useEffect, useCallback, useRef} from 'react'
import { View, Text, Alert } from 'react-native';
import { useStore, useSelector } from 'react-redux'
import styled from 'styled-components/native'

import { PrayerInput, selectPrayerById, selectTeamById } from '@/state/prayers';
import Prayer from '@/types/Prayer';
import {useAuthId, useLocation} from "@/hooks";

import {ScreenCard, Btn, Spacer} from '@/components/uiStyle/atoms'
import { RecordedItem } from "@/components/audio-recorder/lib";
import {AR, AppHeader} from '@/components'

import { useScreensContext } from "./PrayerContext"


type S = PrayerInput<RecordedItem>
type R = Reducer<S, Partial<S>>

export default ({navigation, route}) => {

  const store = useStore()
  const { params: {teamId, prayerId=null} } = route
  
  // Data & Context
  // ==========================

  const userId = useAuthId()
  const team = useSelector(selectTeamById(teamId))
  const {prayerInput, sync, status} = useScreensContext()
  const { location: lat_lng, error: locationErrorMsg} = useLocation(
    {shouldFormatToLatLng: true}) // geolocation is hidden.
  const locationRef = useRef(); locationRef.current = lat_lng;

  useEffect(() => { // sync existing prayer to context
    const prayer = prayerId && selectPrayerById(prayerId)(store.getState())
    prayer && sync(prayer) 
  }, [prayerId])


  // Callbacks
  // ==========================

  const onSave = () => {
    navigation.navigate("Prayer", {screen: "EditInfo"})
  }

  const navigateBack = useCallback(() => {

    // notify unfinished prayer iff 
    // unsaved prayer having at least one recording and a title
    const hasUnfinishedPrayer = !status.saved &&
      !!prayerInput && (!!prayerInput.recordings?.length || 'title' in  prayerInput)

    if (hasUnfinishedPrayer) { 
      Alert.alert("Unfinished prayer", "Quit praying now?", [
        { text: "Quit", onPress: () => navigation.goBack() },
        { text: "Stay", style: "cancel"} ])
    } else {
      navigation.goBack() }

  }, [prayerInput, status.saved])

  const onChange = useCallback(recordings => {
    sync({recordings, prayerId, userId, teamId, lat_lng: locationRef.current})

  }, [prayerId, userId, teamId, lat_lng])


  return (
    <Container>

      <AppHeader {...{
        title: prayerInput?.prayerId ? "Edit Prayer" : "Pray Now",
        navigateBack
      }} />

      <Section>
        <Text>Praying with {' '}
            <Text style={{fontWeight: 'bold'}}>{team?.title}</Text>
        </Text>
        <Text>{prayerInput?.title || 'Untitled Prayer'}</Text>
        <Spacer height={16} />

        <NewPrayerActions>
          <Action label="Save" onPress={onSave} 
            disabled={!prayerInput?.recordings?.length} 
          />
          <Spacer width={8} />
          <Action label="Delete" 
            onPress={null} 
          />
        </NewPrayerActions>
      </Section>

      <AR.Recorder {...{ onChange }} />
    </Container>
  )
}

const NewPrayerActions = styled.View
`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`



const Action = styled(Btn)`
  background-color: transparent;
  border: ${p => p.theme.colors.fg} 2px;
  //margin-top: 16px;
`
const Section = styled(({children, ...p}) => (
  <>
    <View {...p}>{children}</View>
    <Spacer height={16} />
  </>
))`
  margin-left: 22px;
  margin-right: 22px;
`
const Container = styled(ScreenCard)`
  align-items: flex-start;
`


