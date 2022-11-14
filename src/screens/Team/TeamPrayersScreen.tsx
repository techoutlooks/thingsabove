import React, {useMemo, useState, useRef, useCallback, 
  useReducer, Reducer, useEffect, ComponentProps} from "react";
import {View, Text, ViewStyle } from "react-native";
import { useRoute } from '@react-navigation/native'
import {useSelector, useStore} from "react-redux";
import styled, {useTheme} from "styled-components/native";
import { Feather } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';

import BottomSheet, { BottomSheetView, BottomSheetFlatList 
} from "@gorhom/bottom-sheet";

import {Prayer, Team} from "@/types/models";
import { selectPrayerById, selectTeamById } from "@/state/prayers";

import { VideoPlayer, Avatar, PostPrayerButton, PrayerPlayList } from "@/components";
import { Spacer, RADIUS, BackIcon, Btn, SwitchButton, Row, 
  ScreenCard, ScreenHeader, ScreenHeaderCopy } from "@/components/uiStyle/atoms";

import TeamMemberList from "./TeamMemberList";



type T = {prayers: Prayer[], by: string}
type R = Reducer<T, T>


export default ({navigation}) => {

  // pick prayerIds routed from the Home/DiscoverScreen
  const { params: {teamId, prayerIds= []} } = useRoute()
  const navigateBack = useMemo(() => () => navigation.goBack(), [])
  const team = useSelector(selectTeamById(teamId))

  /* BottomSheet
  sheetLocked: allow bottom sheet to disappear when slided down?
  ========================== */
  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(true)
  const snapPoints = useMemo(() => ["10%", "40%"], [])
  const [sheetLocked, setSheetLocked] = useState(true)  

  // playback
  const [shouldPlay, setShouldPlay] = useState(false)   
  const [shouldReset, setShouldReset] = useState(false)    
  const [showPlayback, setShowPlayback] = useState(false)  
   

  const store = useStore()
  const [{prayers, by}, setPrayers] = useReducer<R, string[]>((s, a) => a, 
    prayerIds, prayerIds => ({ by: team?.title ?? 'Unkown', prayers: prayerIds.map(
      prayerId => selectPrayerById(prayerId)(store.getState())) })
  )

  const memberSelected = useCallback(({prayers, contact}) => { 
    setPrayers({prayers, by: contact.displayName})
    sheetRef.current?.snapToIndex(1) 
  }, [])

  const onPrayerListChange = useCallback(({flipped}) => setShowPlayback(flipped), [])

  // console.log('<PrayerScreen />', `team=${team?.title}`,
  //   `prayerIds=${prayerIds} prayers=${prayers.map(p =>p.id).length}`)


  return (
    <ScreenCard style={[{
      backgroundColor: isOpen? 'lightgray' : '#fff' 
    }]}>

      <View>
        <ScreenHeader leftIcon={<BackIcon onPress={navigateBack} />}>
          <Avatar path={team?.avatar_urls[0]} size={75} />
          <Spacer width={12} />
          <Text >
            Pray with <Text style={{ fontWeight: 'bold' }}>{team?.title}</Text>
          </Text>
        </ScreenHeader>

        <Section>
          {team && (<TeamSummary {...{team}} />) }
        </Section>
        <Section>
          <PostPrayerButton {...{team}} />
        </Section>
        <Section>
          {team && (<TeamMemberList {...{team, onSelect: memberSelected }} />) }
        </Section>
      </View>

      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={!sheetLocked}  
        enableOverDrag={false}
        onClose={() => setIsOpen(false)}
        style={{
          borderTopLeftRadius: RADIUS,
          borderTopRightRadius: RADIUS,
          display: 'flex', alignItems: 'center',
        }}
      >
        <BottomSheetView >

          <Row style={{justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <BottomSheetTitle> { by == team?.title ? 
                "Listen related prayers" : 
                (<Text>Prayers by <Text style={{fontWeight: 'bold'}}>{by}</Text></Text>) }
            </BottomSheetTitle>

            {/* playback for all Prayers */}
            {/* <Playback hidden={showPlayback}>
              <Playall {...{initiallyOn: shouldPlay, onChange: setShouldPlay }} />
            </Playback> */}

            {/* per-prayer's playback */}
            <Playback>
              <Playall {...{initiallyOn: shouldPlay, onChange: setShouldPlay }} />
              <Spacer width={5} />
              <Reset onReset={setShouldReset} />
            </Playback >
            
            {/* BottomSheet dimmed or definitively closed when slided down? */}
            <CloseSheet  {...{ locked: sheetLocked, onPress: 
              () => setSheetLocked(locked => !locked)  }} />
          </Row>

          {/* PrayerPlayList as BottomSheetFlatList. 
          Is aware of user interactions with prayers */}
          <PrayerPlayList
            {...{ 
              prayers, shouldPlay, shouldReset, 
              onChange: onPrayerListChange,
              customFlatList: useCallback(() => BottomSheetFlatList, [])
          }} />

        </BottomSheetView>
      </BottomSheet>

    </ScreenCard>
  )
}


const Playback = styled.View`
  flex-direction: row;
  align-items: center;
  ${p => p.hidden && `display: none`};
`
const Playall = styled(SwitchButton).attrs({
  size: 18, primary: true,
  icon: p => <SimpleLineIcons name='playlist' {...p} />
})``
const Reset = styled(Btn).attrs(props => ({
  size: 18, 
  icon: p => <SimpleLineIcons name='reload'  {...p} />, 
  onPressIn: () => props.onReset(true), 
  onPressOut: () => props.onReset(false)
}))``
const CloseSheet = styled(Btn).attrs(props => ({
  icon: p => <Feather name={props.locked ? 'lock' : 'unlock'} {...p} />,
  size: 18,
}))`
  margin-left: 18px;
`

const BottomSheetTitle = styled(ScreenHeaderCopy)`
  font-size: 14px;
  font-weight: 400;
  padding: 0 16px;
  margin: 0;
`
const TeamSummary = styled(({team}: {team: Team}) => (
  <>
    <Text style={{lineHeight: 36}}>Description</Text>
    <Text style={{fontWeight: '300', textAlign: 'justify'}}>
      {team?.description}
    </Text>
    <Spacer height={16} />
    <View >
      <VideoPlayer
        // ref={playerRef}
        height={200}
        uri={team.video_url}
        playing={false}
      />
    </View>
  </>
))``

const Section = styled(({children, ...p}) => (
  <>
    <View {...p}>{children}</View>
    <Spacer height={16} />
  </>
))`
  margin-left: 22px;
  margin-right: 22px;
`