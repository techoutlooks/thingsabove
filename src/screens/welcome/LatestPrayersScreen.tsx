import React, {useEffect, useRef, useState, useReducer, Reducer} from 'react';
import { SectionList, View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native'
import { useSelector } from "react-redux"

import {getPrayersByTopic} from "@/state/prayers"
import Prayer from "@/types/Prayer"
import {AppHeader} from "@/components"
import SearchBar from "@/components/uiStyle/SearchBar";
import {Avatar, FlatList, RADIUS, Row, ScreenCard, ScreenFooter, Spacer
} from '@/components/uiStyle/atoms'

import PrayerCard from "./PrayerCard"


type P = Record<string, Prayer[]>
type S = {
  topic: string
  data: Prayer[], 
}[]



/***
 * Infinite scroll prayers list view 
 * Prayers sorted by: time DESC, ...
 */
export default () => {


  /* SectionList
  ========================== */
  const prayersByTopic = useSelector(getPrayersByTopic)

  const mapToSectionList = (prayersByTopic: P) =>
    Object.entries(prayersByTopic)
      .map(([topic, prayers]) => ({ topic, data: prayers }))
  
  const [sections, setSections] =
    useReducer<Reducer<S, S>, P>((s, a) => a, prayersByTopic, mapToSectionList)
  
  useEffect(() => {
    setSections(mapToSectionList(prayersByTopic)) }, [prayersByTopic])


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
        <SearchBar value={query} onChangeText={setQuery}/>
      </AppHeader>

      <SectionList
        style={{padding: 16}}
        stickySectionHeadersEnabled={false}
        sections={sections}
        keyExtractor={(item, i) => item+i}
        renderItem={() => null}
        renderSectionHeader={({section: {topic, data}}) => (
          <>
            <SectionHeader>{topic.toUpperCase()}</SectionHeader>
            <FlatList
              horizontal
              data={data}
              keyExtractor={(item, i) => item+i}
              renderItem={({item: prayer}) => (<PrayerCard {...{prayer}} />) }
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => (<Spacer width={10} /> )}
            /> 
          </>
        )}
      />

    </Container>
  )
}


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
  // padding: 20px;

`