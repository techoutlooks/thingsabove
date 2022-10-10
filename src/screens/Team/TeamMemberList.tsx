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
const TeamMemberList = React.memo(styled(({team, onSelect }: Props) => {

  const state = useStore().getState();
  
  // prayers -> team warriors 
  // FIXME: eg. useProfileReducer(teamPrayers, pp => pp.map(p => p.userId))
  const teamPrayers = selectPrayersByTeamId(state, team.id)
  const memberIds = [...new Set(teamPrayers.map(p => p.user_id))]

  let members = useContacts(memberIds, true)


  console.log('<TeamPrayers />', `teamPrayers=${teamPrayers.length}`, `team=${team.title}`, 
  `members=${members.length}`)

  return (
    <View>
      <Text>Listen to more prayers from {' '}
          <Text style={{fontWeight: 'bold'}}>{team.title}</Text>
      </Text>
      <MemberList {...{members, onSelect}} />
    </View>
  )

})``
)

const MemberList = styled(({members, onSelect, style}: 
  {members: Contact[]} & Pick<Props, 'onSelect'>) => {

  const keyExtractor = useCallback((item, i) => item+i, [])
  const renderItem = useCallback(({item: contact, index}) => (
    <MemberAvatar {...{ index, contact, onPress: onSelect }} />
  ), [])

  return (
    <Row {...{style}}>
      <FlatList horizontal {...{
        data: members, keyExtractor, renderItem,
        ItemSeparatorComponent: () => (<Spacer width={10} />)
      }} />
    </Row>
  )
})`
  padding: 18px 0
`


const MemberAvatar = styled(({ index, contact, onPress, size, style }) => {
  const prayers = useSelector(selectPrayersByUserId(contact.id))
  return (
    <Avatar path={contact?.avatar[0]} size={size} style={style}
            onPress={() => onPress({contact, prayers})} 
    />)
}).attrs(p => ({ size: 70 }))`
  ${p => p.index>0 && `margin-left: -25px`}
  border: 2px solid ${p => p.theme.colors.cardBg};
  border-radius: ${p => p.size * .33}px; // same radius as inner img!
  
`

export default TeamMemberList;
