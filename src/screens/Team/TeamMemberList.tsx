import React, {useCallback, useMemo, ComponentProps} from "react";
import {Text, View, FlatList, ViewStyle} from "react-native";
import styled from "styled-components/native";
import {useStore, useSelector} from "react-redux";

import Prayer, {Team} from "@/types/Prayer";
import { useContacts } from "@/hooks";
import { Contact } from "@/state/contacts";

import {selectPrayersByUserId, selectPrayersByTeamId} from "../../state/prayers";
import { Spacer} from "@/components/uiStyle/atoms";
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
  // const teamPrayers = selectPrayersByTeamId(store.getState(), team.id)
  const teamPrayers = useMemo(() => selectPrayersByTeamId(state, team.id), [team.id])
  const memberIds = useMemo(() => [...new Set(teamPrayers.map(p => p.user_id))], [teamPrayers])
  const members = useContacts(memberIds)

  console.log('<TeamMemberList />', `teamPrayers=${teamPrayers.length}`, `team=${team.title}`, 
  `members=${members?.length}`)

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

type MemberListProps = { members: Contact[], 
  onSelect: Pick<MemberAvatarProps, 'onPress'>['onPress'],
} & Pick<MemberAvatarProps, 'style'>  

const MemberList = styled(({members, onSelect, style }: MemberListProps) => {

  const renderItem = useCallback(({item: contact, index}) => (
    <MemberAvatar {...{ index, contact, onPress: onSelect, overlap: -10 }} />
  ), [])

  return (
    <FlatList horizontal {...{
      data: members, renderItem, style
    }} />
  )
})`
  padding: 18px 0
`


type MemberAvatarProps = { 
  index: number, contact: Contact, overlap: number,
  onPress: ({contact, prayers}: {contact: Contact, prayers: Prayer[]}) => void 
} & Pick<ComponentProps<typeof Avatar>, 'size'|'style'>

const MemberAvatar = styled(
  ({ contact, onPress, size, style }: MemberAvatarProps) => {
    const prayers = useSelector(selectPrayersByUserId(contact.userId))
    return (
      <Avatar path={contact?.avatar?.[0]} size={size} style={style}
              onPress={() => onPress?.({contact, prayers})} 
      />
    )
}).attrs(p => ({ 
  size: 70, ...p 
}))`
  ${p => p.overlap && p.index>0 && `margin-left: ${p.overlap}px;`}
  border: 2px solid ${p => p.theme.colors.cardBg};
  border-radius: ${p => p.size/2}px; // same radius as inner img!
`

export default TeamMemberList;
