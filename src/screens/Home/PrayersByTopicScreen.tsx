import React, {memo, useEffect, useCallback, useState, useRef, useReducer, Reducer} from 'react';
import { SectionList, SectionListData, FlatList } from 'react-native';
import styled from 'styled-components/native'
import { useSelector } from "react-redux"
import {useNavigation} from "@react-navigation/native";

import {getPrayersByTopic} from "@/state/prayers"
import {Prayer} from "@/types/models"
import {AppHeader, PrayerCard} from "@/components"
import SearchBar from "@/components/uiStyle/SearchBar";
import { ScreenCard, Spacer, WIDTH } from '@/components/uiStyle/atoms'



type P = Record<string, Prayer[]>
type SectionT = { topic: string, data: Prayer[] }
type S = SectionT[]



/***
 * Infinite scroll prayers list view 
 * Prayers sorted by: time DESC, ...
 */
export default ({navigation}) => {


  /* SectionList
  ========================== */
  const prayersByTopic = useSelector(getPrayersByTopic({published: true}))

  const mapToSectionList = (prayersByTopic: P) =>
    Object.entries(prayersByTopic)
      .map(([topic, prayers]) => ({ topic, data: prayers }))
  
  const [sections, setSections] =
    useReducer<Reducer<S, S>, P>((s, a) => a, prayersByTopic, mapToSectionList)
  
  // FIXME: apply RT store changes to the section list
  // useEffect(() => {
  //   setSections(mapToSectionList(prayersByTopic)) }, [prayersByTopic])

  const keyExtractor = useCallback((item, i) => item+i, []) 


  /* Search
  ========================== */
  const [query, setQuery] = useState('')
  useEffect(() => {
    const regexes = query.split(' ').map(word => new RegExp(word, 'i'))
    const matches = mapToSectionList(prayersByTopic).map(({topic, data}) => ({
      topic, data: data.filter(prayer => regexes.some(
        regex => regex.test(prayer.title) || regex.test(prayer.description) 
                  || prayer.topics.some(t => regex.test(t))
      )) 
    }))
    setSections(matches)
  }, [query])


  return (
    <Container>
      <AppHeader>
        <SearchBar 
          value={query} onChangeText={setQuery}
          placeholder="Search prayers and topics ..."
        />
      </AppHeader>

      <SectionList
        style={{padding: 16}}
        stickySectionHeadersEnabled={false}
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={() => null}
        renderSectionHeader={({section}) => (
          <Section {...{...section }} />
        )}
      />
    </Container>
  )
}


const UnStyledSection = styled(({topic, data}: SectionListData<Prayer, SectionT>) => {

  const navigation = useNavigation()
  const flatList = useRef()

  const keyExtractor = useCallback((item, i) => item+i, []) 
  
  const renderPrayerCard = ({item: prayer, index}) => {
    
    const hasNext = index < data.length - 1

    const onPress = () => navigation.navigate('Prayer', {
      screen: "Preview", params: { prayerId: prayer.id }})

    const onNext = () => { // scroll to next item in current section
      const index = data.findIndex(s => prayer.id===s.id)
      flatList?.current?.scrollToIndex({index: index + 1}) }

    return (<PrayerCard {...{ prayer, onPress, hasNext, onNext }} />) 
  }

  return (
    <>
      {!!data.length && (<SectionHeader>{topic.toUpperCase()}</SectionHeader>) }
      <FlatList
        ref={flatList}
        horizontal
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderPrayerCard}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => (<Spacer width={10} /> )}
        snapToInterval={WIDTH - 20} // id. as rendered card
        decelerationRate={'fast'}
      /> 
    </>
  )
})``

const Section = memo(UnStyledSection)



const SectionHeader = styled.Text.attrs({
  numberOfLines: 1, ellipsizeMode: 'tail',
})`
  margin: 15px 0;
  font-size: 12px;
  font-weight: 400;
  color: ${p => p.theme.colors.titleFg};
`

const Container = styled(ScreenCard)`
  //padding: 12px 16px;
`