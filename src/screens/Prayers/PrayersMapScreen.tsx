import React, {useEffect, useRef, useState, useMemo} from 'react';
import {View, Text, FlatList, Pressable, useWindowDimensions} from 'react-native';
import {useNavigation} from "@react-navigation/native"
import { FontAwesome5 } from '@expo/vector-icons'; 

import {useSelector, useStore} from "react-redux"
import styled, {useTheme} from 'styled-components/native'
import MapView, {LatLng, Marker} from "react-native-maps";

import {Team} from "@/types/Prayer";
import { Image } from "@/lib/supabase"
import { selectTeams, selectPrayersByTeamId } from '@/state/prayers';

import {AppHeader} from "@/components"
import SearchBar from "@/components/uiStyle/SearchBar";
import {ScreenCard, Spacer, WIDTH} from "@/components/uiStyle/atoms"


// style={[{width: windowWidth-60}]}
export default () => {

  // ui setup
  // ===========================

  const windowDimensions = useWindowDimensions();
  const flatList = useRef();
  const map = useRef()
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold:70
  })

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if(viewableItems.length>0) {
      setSelectedTeamId(viewableItems[0].item.id)
    }
  })

  // Data
  // ===========================
  const state = useStore().getState()
  const teams = useSelector(selectTeams)
  const [selectedTeamId, setSelectedTeamId] = useState<Team>();
  const selectedTeamPrayersCount = useMemo(() => 
    selectPrayersByTeamId(state, selectedTeamId).length, [selectedTeamId])

  // search: finds only first team matching query words
  const [query, setQuery] = useState('')
  useEffect(() => {
    const regexes = query.split(' ').map(word => new RegExp(word, 'i'))
    const team = teams.find(t => regexes.some(
      regex => regex.test(t.title) || regex.test(t.description) ))
    team && setSelectedTeamId(team.id)
  }, [query])



  /* Zoom/scroll 
    Zoom map -> selected team location 
    Scroll TeamCard Flatlist carousel -> selected team location 
  ============================== */
  useEffect(() => {
    if (!selectedTeamId || !flatList) { return }

    const index = teams.findIndex(p => p.id===selectedTeamId)
    flatList.current.scrollToIndex({index})

    const selectedTeam = teams[index]
    const coordinate = toLatLng(selectedTeam.lat_lng)
    const region = { ...coordinate, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    map.current.animateToRegion(region)

  }, [selectedTeamId])


  return (
    <Container>

      <AppHeader>
        <SearchBar value={query} onChangeText={setQuery} 
          placeholder="Search teams..." 
        />
      </AppHeader>

      <MapView
        ref={map}
        style={{ width: '100%', height: '100%' }} 
        initialRegion={{
          latitude: 5.6352343, longitude: -0.2338485,
          latitudeDelta: 0.0922, longitudeDelta: 0.0421,
        }}
      >
        {
          teams.map(team => (
            <LocationMarker
              key={team.id}
              isSelected={selectedTeamId===team.id}
              coordinate={toLatLng(team.lat_lng)} title={selectedTeamPrayersCount}
              onPress={ () => setSelectedTeamId(team.id)}
            />
          ))
        }
      </MapView>
      <View style={{
        position: 'absolute',
        bottom: 40,
      }}>
        <FlatList
          ref={flatList}
          data={teams}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={windowDimensions.width - 60}
          snapToAlignment={'start'}
          decelerationRate={'fast'}
          viewabilityConfig={viewabilityConfig.current}
          onViewableItemsChanged={onViewableItemsChanged.current}
          renderItem={
            ({item}) => <TeamCard team={item} />
          }
        />
        </View>
    </Container>
  )
}

type LocationMarkerType = {
  coordinate: LatLng, title: string, isSelected: boolean, onPress: any}

const LocationMarker = ({coordinate, title, isSelected, onPress}: LocationMarkerType) => {

  return (
    <Marker {...{ coordinate, onPress }} >
      <View style={{
        backgroundColor: isSelected ? 'black': 'white',
        paddingHorizontal: 5,
        borderRadius: 10,
        borderWidth:1,
        borderColor: 'grey'
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <FontAwesome5 name="pray" size={16} color="white" />
          <Text style={{
            fontWeight: 'bold', fontSize: 16,
            color: isSelected ? 'white': 'black',
            marginLeft: 5
          }}>
            {title}
          </Text>
        </View>
      </View>
    </Marker>
  )
}


const TeamCard = ({team}: {team: Team}) => {
  const navigation = useNavigation()
  const theme = useTheme()

  return (
    <TeamCardContainer>
      <Pressable 
        onPress={ () => navigation.navigate("Team", {
          screen: "TeamPrayers", params: {teamId: team.id }} )
      }
        style={{
          flexDirection: 'row', overflow: 'hidden', height: '100%',
          backgroundColor: 'white', borderRadius: 5,
        }}
      >
        <Image 
          path={`avatars/${team.avatar_urls?.[0]}`} 
          style={{
            aspectRatio: 1, resizeMode: 'contain', 
            backgroundColor: theme.colors.cardBg,
            borderWidth: 1, borderColor: theme.colors.mutedFg,
          }}
        />
        <View style={{padding: 10, flex: 1}}>
          <Text numberOfLines={1} style={{ fontWeight: 'bold' }} > 
            {team.title} 
          </Text>
          <Spacer height={12} />
          <Text numberOfLines={3} style={{ color: theme.colors.muted }}>
            {team.description}
          </Text>
        </View>
      </Pressable>
    </TeamCardContainer>
  )
}


const TeamCardContainer = styled.View`
  width: ${WIDTH-50}px;
  height: 120px;
  padding: 5px;

  // https://ethercreative.github.io/react-native-shadow-generator/
  shadowColor: #000;
  shadow-offset: 0px 3px;
  shadowOpacity: 0.27;
  shadowRadius: 4.65px;
  elevation: 6;
`

const Container = styled(ScreenCard)`
`


const toLatLng = (latLng: string): LatLng => {
  const coords = latLng.split(',').map(v => parseFloat(v))
  return {latitude: coords[0], longitude: coords[1]}
}
