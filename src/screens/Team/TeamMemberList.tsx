import React, {useCallback, useEffect} from "react";
import {Text, View} from "react-native";
import styled from "styled-components/native";
import {useStore, useSelector} from "react-redux";

import Prayer, {Team} from "@/types/Prayer";
import { useContacts } from "@/hooks";
import { Contact } from "@/state/contacts";

import {selectPrayersByUserId, selectPrayersByTeamId} from "../../state/prayers";
import {FlatList, Row, Spacer} from "@/components/uiStyle/atoms";
import { Avatar } from "@/components"



// import ImagedCardView from "react-native-imaged-card-view";


type Props = {
  team: Team,
  prayerIds?: string[],
  onSelect: ({contact, prayers}: {contact: Contact, prayers: Prayer[]}) => void
}


/***
 * <TeamPrayers/>
 * Prayers by team, filterd by `prayerIds` if supplied.
 */
const TeamMemberList = styled(({team, onSelect }: Props) => {

  const state = useStore().getState();
  
  // prayers -> team warriors 
  // FIXME: eg. useProfileReducer(teamPrayers, pp => pp.map(p => p.userId))
  const teamPrayers = selectPrayersByTeamId(state, team.id)
  const memberIds = teamPrayers.map(p => p.user_id)

  let members = useContacts(memberIds, true)
  members = [...new Map(members.map(m => [m[m.id], m])).values()]


  console.log('**** <TeamMemberList />', members)

  return (
    <View>
      <Text>Listen to more prayers from {' '}
          <Text style={{fontWeight: 'bold'}}>{team.title}</Text>
      </Text>
      <MemberList {...{members, onSelect}} />
    </View>
  )

})``


const MemberList = styled((props: 
  {members: Contact[]} & Pick<Props, 'onSelect'>) => {

  const keyExtractor = useCallback((item, i) => item+i, [])
  const renderItem = useCallback(({item: contact}) => (
    <MemberListItem {...{ contact, onPress: props.onSelect }} />
  ), [])

  return (
    <Row>
      <FlatList horizontal {...{
        data: props.members, keyExtractor, renderItem,
        ItemSeparatorComponent: () => (<Spacer width={10} />)
      }} />
    </Row>
  )
})``


const MemberListItem = ({contact, onPress}) => {
  const prayers = useSelector(selectPrayersByUserId(contact.id))
  return (
    <Avatar path={contact?.avatar[0]} size={60} 
            onPress={() => onPress({contact, prayers})} 
    />)
}

export default TeamMemberList;
