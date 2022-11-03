import React, { useState, useMemo, useEffect, useCallback, 
  useReducer, Reducer, memo  } from 'react'
import { useNavigation } from '@react-navigation/native'
import { FontAwesome5 } from '@expo/vector-icons';
import styled from 'styled-components/native'
import lodash from 'lodash'

import Prayer from '@/types/Prayer'
import * as atoms from '@/components/uiStyle/atoms/'

import {OnSelectArgs, SelectActions, SearchResultItem} from './SearchResultItem'


/***
 * @param initial: prayers to pick from
 * @param selectedIds: preselected prayers ids (subset of `initial`)
 * @param onSelect: called with picked prayers when a prayer item is selected
 */
type Props = { 
  initial: Prayer[],
  selectedIds?: string[],
  title?: string,
  onSelect?: (prayers: Prayer[]) => void 
}


type A =  { action: SelectActions, prayers: Prayer[] }
type I = { initial: Prayer[], selectedIds?: string[] } 

const initSelectedPrayers = ({initial, selectedIds}: I) => 
  initial.filter(p => !!selectedIds?.includes(p.id))

  

/**
 * Select prayer reducer
 * Adds/removes prayers as they are individually selected/deselected 
 */
type R = Reducer<Prayer[], A>
const selectPrayersReducer: R = (s, {action, prayers}) => {
  switch (action) {
    case SelectActions.ADD:
      return lodash.uniqBy([...s, ...prayers], 'id')
    case SelectActions.REMOVE:
      const ids = prayers.map(p => p.id)
      return s.filter(p => !ids.includes(p.id))
    case SelectActions.INIT:
      return prayers
  }
}


/***
 * Displays a view that enables user to 
 * - pick prayers from given list
 * - search the directory for prayers to add.

 */
export default ({ initial=[], selectedIds: initialSelectedIds=[], ...props } : Props) => {

  /* Data
  ========================= */

  const navigation = useNavigation()
  const initialData: I = { initial, selectedIds: initialSelectedIds }
  const [ selectedPrayers, setSelectedPrayers ] = useReducer<R, I>(
    selectPrayersReducer, initialData, initSelectedPrayers)

  // syncs reducer with props 
  useEffect(() => { !!initialSelectedIds?.length && setSelectedPrayers({ 
    action: SelectActions.INIT, prayers: initSelectedPrayers(initialData) }) 
  }, [initialSelectedIds])
  

  /* Search Prayer
  ========================= */

  const [query, setQuery] = useState('')
  const [resultPrayers, setResultPrayers] = useState<Prayer[]>([])

  useEffect(() => {
    const regex = new RegExp(`\\b[@:]?${query}`, 'i')
    const matches = initial.filter(prayer => ( 
      !selectedPrayers.filter(p => p.id==prayer.id).length  &&   // exclude already selected prayers
      (prayer.title.match(regex) || prayer.description.match(regex)) 
    ))

    const prayers = lodash.orderBy(matches,
      ['displayName'], ['asc']).slice(0, 20)

    setResultPrayers(prayers) 

  }, [query, initial, selectedPrayers])



  /* Callbacks
  ========================= */

  const onSelect = useCallback(({action, prayer}: OnSelectArgs) => {
    setSelectedPrayers({action, prayers: [prayer]}) }, [])

  const add = useCallback(() => {
    props?.onSelect?.(selectedPrayers)  }, [selectedPrayers])

  const renderPrayer = useCallback(({ item: prayer }) => (
    <SearchResultItem {...{ prayer, onSelect }} />), [])

  const renderSelectedPrayer = useCallback(({ item: prayer }) => (
    <SearchResultItem initiallyOn {...{ prayer, onSelect }} />), [])

  const navigateBack = useMemo(() => () => navigation.goBack(), [])

  // console.log(`<PrayerPickerCard /> selectedPrayers=${selectedPrayers.length}`, 
  //  selectedPrayers.map(p => p.title))

  return (
    <ScreenCard>
      <atoms.ScreenHeader
        title={props.title || "Pick Prayers"}
        leftIcon={<atoms.BackIcon onPress={navigateBack} />}
      />
      <PrayerList inverted
        data={resultPrayers}
        initialNumToRender={15}
        keyboardShouldPersistTaps="handled"
        renderItem={renderPrayer}
      />
      <PrayerList selected 
        data={selectedPrayers}
        initialNumToRender={15}
        keyboardShouldPersistTaps="handled"
        renderItem={renderSelectedPrayer}
      />
      <ScreenFooter>
        <SearchBar autoFocus value={query} onChangeText={setQuery} 
          postIcon="account-search-outline" 
        />
        <AddButton onPress={add} />
      </ScreenFooter>
      
    </ScreenCard>
  )
}


const PrayerList = styled(atoms.FlatList)`
  ${p => p.selected && `
    border-top-width: 1px; border-top-style: solid; 
    border-top-color: ${p.theme.colors.mutedFg}
  `}
`

const AddButton = styled(atoms.Btn)
  .attrs(p => ({ 
    color: p.theme.colors.primaryButtonBg,
    icon: p => <FontAwesome5 name="praying-hands" {...p} />
  }))
`
  margin: 0 0 0 16px;
`

const SearchBar = styled(atoms.SearchInput)` 
flex: 1;
`

const ScreenFooter = styled(atoms.ScreenFooter)`
  align-items: center;
  justify-content: space-between;
  padding: 0; // cancel padding from ancestor
  margin-top: 32px;
`

const ScreenCard = styled(atoms.ScreenCard)`
 padding: 16px;
 margin: 16px;
 width: 100%

`
