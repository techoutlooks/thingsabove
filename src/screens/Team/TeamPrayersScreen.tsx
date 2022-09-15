import React, {useMemo, useState, useRef, useCallback, useReducer, Reducer} from "react";
import {View, Text, Pressable, TouchableOpacity} from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native'
import {useSelector, useStore} from "react-redux";
import styled, {useTheme} from "styled-components/native";
import { SimpleLineIcons, Feather } from '@expo/vector-icons';

import BottomSheet, { BottomSheetBackdrop, BottomSheetView, BottomSheetFlatList } from "@gorhom/bottom-sheet";

import Prayer, {Team} from "@/types/Prayer";
import {selectPrayerById, selectTeamById, selectUsersByPrayerIds} from "@/state/prayers";

import { VideoPlayer, Avatar } from "@/components";
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

  const state = useStore().getState();
  const [{prayers, by}, setPrayers] = useReducer<R, string[]>((s, a) => a, 
    prayerIds, prayerIds => ({ by: team?.title ?? 'Unkown', prayers: prayerIds.map(
      prayerId => selectPrayerById(state, prayerId)) })
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
          <Pray {...{team}} />
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
            <BottomSheetTitle> Prayers { by == team?.title ? 
                "matching your query" : 
                (<Text>by <Text style={{fontWeight: 'bold'}}>{by}</Text></Text>) }
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


const PrayerList = styled(({prayers, style}: {prayers: Prayer[]}) => {
    
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



const Pray = styled(({team, style}) => {
    const navigation = useNavigation()
    return (
        <View {...{style}}>
            <PostPrayer label="Post Prayer" />
            <Spacer width={8} />
            <PrayNow onPress={() => navigation.navigate("PrayNow", {
                screen: "PrayNowOne", params: {teamId: team.id} }) }/>
        </View>
    )
})`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  
`


const PostPrayer = styled(Btn)`
    background-color: transparent;
    border: ${p => p.theme.colors.fg} 2px;
    //margin-top: 16px;
`


const PrayNow = styled(Button).attrs(p => ({
    icon: () => <SimpleLineIcons name="microphone" size={36} color={p.theme.colors.fg} />
}))`
    background-color: transparent;
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
