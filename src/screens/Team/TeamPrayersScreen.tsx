import React, {useMemo, useState, useRef, useCallback, useReducer, Reducer} from "react";
import {View, Text, ViewStyle, TouchableOpacity} from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native'
import {useSelector, useStore} from "react-redux";
import styled, {useTheme} from "styled-components/native";
import { Feather } from '@expo/vector-icons';

import BottomSheet, { BottomSheetView, BottomSheetFlatList 
} from "@gorhom/bottom-sheet";

import Prayer, {Team} from "@/types/Prayer";
import { selectPrayerById, selectTeamById } from "@/state/prayers";

import { VideoPlayer, Avatar, PrayNowButton, PrayActionGroup } from "@/components";
import {Spacer, WIDTH, RADIUS,
    BackIcon, Btn, Button, Row, ScreenCard, ScreenHeader, ScreenHeaderCopy, 
} from "@/components/uiStyle/atoms";

import TeamMemberList from "./TeamMemberList";
import PrayerListItem from "./PrayerListItem"

type T = {prayers: Prayer[], by: string}
type R = Reducer<T, T>


export default ({navigation}) => {

  const { params: {teamId, prayerIds= []} } = useRoute()
  const navigateBack = useMemo(() => () => navigation.goBack(), [])
  const team = useSelector(selectTeamById(teamId))

  // BottomSheet
  // ==========================
  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(true)
  const snapPoints = useMemo(() => ["10%", "40%"], [])
  const [locked, setLocked] = useState(true)

  const store = useStore();
  const [{prayers, by}, setPrayers] = useReducer<R, string[]>((s, a) => a, 
    prayerIds, prayerIds => ({ by: team?.title ?? 'Unkown', prayers: prayerIds.map(
      prayerId => selectPrayerById(prayerId)(store.getState())) })
  )

  const memberSelected = useCallback(({prayers, contact}) => { 
    setPrayers({prayers, by: contact.displayName})
    sheetRef.current?.snapToIndex(1) 
  }, [])

  console.log('<PrayerScreen />', `prayerIds=${prayerIds}`, `team=`,team)


  return (
    <ScreenCard style={[{
      backgroundColor: isOpen? 'lightgray' : '#fff' 
    }]}>

      <View>
        <ScreenHeader leftIcon={<BackIcon onPress={navigateBack} />}>
          <Avatar path={team?.avatar_urls[0]} size={75} />
          <Spacer width={12} />
          <Text >
            Pray with <Text style={{fontWeight: 'bold'}}>{team?.title}</Text>
          </Text>
        </ScreenHeader>

        <Section>
          {team && (<TeamSummary {...{team}} />) }
        </Section>
        <Section>
          <PrayActionGroup {...{team}} />
        </Section>
        <Section>
          {team && (<TeamMemberList {...{team, onSelect: memberSelected }} />) }
        </Section>
      </View>

      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={!locked}  
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
            <CloseSheet  {...{ locked, onPress: () => setLocked(locked => !locked)  }} />
          </Row>
          <PrayerList {...{prayers}} />
        </BottomSheetView>
      </BottomSheet>

    </ScreenCard>
  )
}

const CloseSheet = styled(Btn).attrs(props => ({
  icon: p => <Feather name={props.locked ? 'lock' : 'unlock'} {...p} />,
  size: 18,
}))
` 
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
        playing={true}
      />
    </View>
  </>
))``



const PrayerList = styled(({prayers, style}: 
  {prayers: Prayer[], style?: ViewStyle}) => {
    
    const keyExtractor = useCallback((item, i) => item+i, [])
    const renderItem = useCallback(
      ({item: prayer}) => (<PrayerListItem {...{prayer}} />), [])

    return (
      <Row {...{style}}>
        <BottomSheetFlatList {...{
          data: prayers, keyExtractor, renderItem,
          ItemSeparatorComponent: () => (<Spacer height={8} />)
        }} />
      </Row>
    )
})`
    padding: 0 16px;
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
