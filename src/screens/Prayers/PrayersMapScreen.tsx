import React, { useEffect, useRef, useState } from 'react';
import {useSelector } from "react-redux"
import styled, {useTheme} from 'styled-components/native'
import MapView, {LatLng, Marker, PROVIDER_GOOGLE} from "react-native-maps";
import isSameDay from 'date-fns/isSameWeek';

import { selectPrayers } from '@/state/prayers';

import {AppHeader} from "@/components"
import SearchBar from "@/components/uiStyle/SearchBar";
import {ScreenCard, Spacer, WIDTH} from "@/components/uiStyle/atoms"
import { Feather } from '@expo/vector-icons';

export default () => {

  // ui setup
  // ===========================

  const map = useRef()

  /* Data
  ============================== */
  const prayers = useSelector(selectPrayers)
  const [searchResults, setSearchResults] = useState(prayers)

  /* Data
  search: finds only first team matching query words
  ============================== */
  const [query, setQuery] = useState('')
  useEffect(() => {
    const regexes = query.split(' ').map(word => new RegExp(word, 'i'))
    const results = prayers.filter(p => regexes.some(
      regex => regex.test(p.title) || regex.test(p.description) ))
    setSearchResults(results)
    }, [query])


  return (
    <Container>

      <AppHeader>
        <SearchBar value={query} onChangeText={setQuery} 
          placeholder="Search teams..."  />
      </AppHeader>

      <MapView 
        ref={map}
        provider={PROVIDER_GOOGLE}
        style={{ width: '100%', height: '100%' }} 
        showsUserLocation={true}
        followsUserLocation={true}
        toolbarEnabled={ true }
        initialRegion={{
          latitude: 14.7273067, longitude: -17.2077234,
          latitudeDelta: 0.0922, longitudeDelta: 0.0421,
        }}
      >
        { searchResults.map(prayer => prayer.lat_lng && (
          <LocationMarker {...{
            key: prayer.id,
            highlighted: isSameDay(new Date(prayer.updated_at), Date.now()),
            coordinate: toCoords(prayer.lat_lng)
          }} />
        ))}
      </MapView>
      {/* <PopUp height={ 230 + toolbarHackHeight }>
        My legend here
      </PopUp> */}
    </Container>
  )
}

type LocationMarkerType = { 
  coordinate: LatLng, highlighted: boolean }

const LocationMarker = styled(({coordinate, highlighted, }: LocationMarkerType) => {
  const theme = useTheme()
  return (

    // <Marker {...{ coordinate }} >
    //   <Dot {...{highlighted }} />
    // </Marker>

    // <Marker {...{ 
    //   coordinate, 
    //   pinColor: highlighted ? theme.colors.primaryButtonBg : 'black' ,
    // }}/>
    
    <Marker {...{ 
      coordinate, 
    }}>
      <Feather 
        name="map-pin" size={30} 
        color={highlighted ? 'orangered': theme.colors.primaryButtonBg } 
      />
    </Marker>
  )
})``




/***
 * Dot on the map.
 * Highlighted dot size = highlightRatio * normal dot size
 */
const Dot = styled.View.attrs(p => ({ size: 12, highlightRatio: 1.2, ...p}))`
  ${p => `

  background-color: ${p.highlighted ? 
    p.theme.colors.primaryButtonBg : 'black' };
  
  width: ${p.highlighted ? p.highlightRatio*p.size : p.size}px; 
  height: ${p.highlighted ? p.highlightRatio*p.size : p.size}px; 
  border-radius: ${p.highlighted ? p.highlightRatio*p.size/2 : p.size/2}px;
  `}
`

const Container = styled(ScreenCard)`
`

/***
 * Deserialize string of LatLng 2-uple from db to object
 */
const toCoords = (latLng: string): LatLng => {
  const coords = latLng.split(',').map(v => parseFloat(v))
  return {latitude: coords[0], longitude: coords[1]}
}
