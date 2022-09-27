import React, {Reducer, useCallback, useEffect, useReducer, useState} from 'react'
import { SectionList, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native"
import styled from 'styled-components/native'
import {useStore} from "react-redux";
import _orderBy from 'lodash/orderBy'

import SearchBar from "@/components/uiStyle/SearchBar";
import Prayer, {Team} from "@/types/Prayer";
import {Avatar, FlatList, RADIUS, Row, ScreenCard, ScreenFooter, Spacer} from '@/components/uiStyle/atoms'
import {getPrayersByCategory, selectTeamsByPrayerId} from "@/state/prayers";
import SearchResultItem from "./SearchResultItem";
import {AppHeader} from "@/components"
//

type P = Record<string, Prayer[]>
type S = {
  data: {team: Team, prayerIds: string[]}[], 
  title: string
}[]


/***
 * getTeamPrayersByCategory() : Higher order function 
 * - Associates prayers with the teams that prayed them.
 *   eg.  prayer1 -> teams 1,2,3 ; prayer2 -> teams 1,4 yields:
 *        team1: [prayer1, prayer2], team2: [prayer1], team3: [prayer1]
 * - Sort result in each category (eg. trending, recommended, ...) is then
 *   formatted for display by RN's <SectionList />.
 * 
 * Nota: With any prayer inside a given category, lists all teams the prayer was prayed to.
 * 
 * @param state: root state from redux
 * @return {(prayersByCategory: P) => S}
 */
const getTeamPrayersByCategory = (state) => (prayersByCategory: P) => {

  return Object.entries(prayersByCategory)
    .map(([category, prayers]) => {

      const teamsById = ({} as Record<string, Team>)
      const prayerIdsByTeamId = ({} as Record<string, string[]>)

      prayers.forEach(prayer => {
        const teams = selectTeamsByPrayerId(state, prayer.id)
        teams.forEach(team => {
          teamsById[team.id] = team
          prayerIdsByTeamId[team.id] =
            [ ...(prayerIdsByTeamId[team.id] || []) , prayer.id]
        })
      })

      const data = Object.entries(prayerIdsByTeamId)
        .map(([teamId, prayerIds]) => ({
          team: teamsById[teamId], prayerIds: [...new Set(prayerIds)] }))

      return { data, title: category }
    })
}


export default () => {

  // DATA
  // ==========================

  // load prayers by category
  const store = useStore()
  const prayersByCategory = getPrayersByCategory(store.getState())

  const mapToSectionList = getTeamPrayersByCategory(store.getState())

  // prayersByCategory -> team1: [prayer1, prayer2]
  const [resultPrayers, setResultPrayers] =
    useReducer<Reducer<S, P>, P>((s, a) => mapToSectionList(a),
      prayersByCategory, mapToSectionList)

  // prayer matches (title, description, topics) for search query
  const [query, setQuery] = useState('')
  useEffect(() => {

    const regexes = query.split(' ')
      .map(word => new RegExp(word, 'i'))

    const matches = Object.entries(prayersByCategory)
      .map(([category, prayers]) => {
        let rPrayers = prayers.filter(p => regexes.some(
          regex => regex.test(p.title) || regex.test(p.description) || p.topics.some(t => regex.test(t))
        ))
        rPrayers = _orderBy(rPrayers, ['updated_at', 'title'], ['desc', 'asc'])
          .slice(0, 20)
        return [category, rPrayers]
      })

    setResultPrayers(Object.fromEntries(matches))
  }, [query])

  const keyExtractor = useCallback((item, i) => item+i, []) 
  const renderSearchResult = useCallback(({item: {team, prayerIds}}) =>
    <SearchResultItem {...{team, prayerIds}} /> , [])

  // console.log('<HomeScreen />', `resultPrayers=`, store.getState())

  return (
    <Container>

      <AppHeader hideGoBack>
        <SearchBar value={query} onChangeText={setQuery}
          placeholder="What would you like to pray?"
        />
      </AppHeader>
      
      <ContentNav items={[
        { name: "Teams", screen: "Welcome/TeamsMap", active: true },
        { name: "Prayers", screen: "Welcome/PrayersByTopic" },
        { name: "My Prayers", screen: "MyPrayers" }
      ]} />

      <SectionList
        style={{padding: 16}}
        stickySectionHeadersEnabled={false}
        sections={resultPrayers}
        keyExtractor={keyExtractor}
        renderItem={() => null}
        renderSectionHeader={({section: {title, data}}) => (
          <>
            <SectionHeader>{title}</SectionHeader>
            <FlatList
              horizontal
              data={data}
              keyExtractor={keyExtractor}
              renderItem={renderSearchResult}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => (<Spacer width={10} />)}
            />
          </>
        )}
      />
      <ScreenFooter>
      </ScreenFooter>
    </Container>

  )
}




// Styles
// ==========================



const ContentNav = styled(({items, style}) => {
	const keyExtractor = useCallback((item, i) => item+i, [])
	const renderItem = useCallback(({item}) => (<Chip {...item} />), [])
	return (
		<Row {...{style}}>
			<FlatList {...{
				data: items, keyExtractor, renderItem, horizontal: true,
				ItemSeparatorComponent: () => (<Spacer width={8} />)
			}} />
		</Row>
	)
})`
	padding: 12px 16px;
`

const Chip = styled(({name, screen: path, active, style}) => {
	const navigation = useNavigation()
  const [stack, screen] = path.split("/")
	return (
		<TouchableOpacity style={style}
			onPress={() => navigation.navigate(stack, {screen}) } 
		>
			<Text>{name}</Text>
		</TouchableOpacity>
	)
})`
	padding: 12px;
	border: 1px solid ${p => p.theme.colors.mutedFg};
	border-radius: ${RADIUS}px;
  // ${ p => p.active && `background-color: ${p.theme.colors.primaryButtonBg}` }
`



const SectionHeader = styled.Text.attrs({
    numberOfLines: 1, ellipsizeMode: 'tail',
})`
  margin: 15px 0;
  font-size: 16px;
  font-weight: bold;
  color: ${p => p.theme.colors.titleFg};
`


const Container = styled(ScreenCard)`
  //padding: 12px 16px;
  padding: 20px;

`



