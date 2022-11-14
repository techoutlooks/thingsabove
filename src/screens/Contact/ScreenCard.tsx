import React, { useMemo, useState, memo } from 'react'
import { useSelector } from "react-redux"
import styled, { useTheme } from 'styled-components/native'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity, View, ViewStyle, Alert } from "react-native"
import { Entypo as ButtonIcon } from '@expo/vector-icons';
import { Feather as Icon } from '@expo/vector-icons';
import  { format, formatDistance } from 'date-fns'

import { bolderize } from "@/lib/utils"
import { useFriends, useAuthProfile } from "@/hooks"
import { countPrayersByUserId, selectTeamsCountByUserId } from "@/state/prayers"
import { Contact } from "@/state/contacts"
import * as atoms from '@/components/uiStyle/atoms';
import { Avatar, SkeletonCard as Loader, ShareContact,
  RecordPrayerButton as RecordPrayer, ChatNowButton as ChatNow } from "@/components"

import PrayerList from "./PrayerList"


const ICON_SIZE = 36
const BUTTON_SIZE = 36
type Props = { contact: Contact }



const ContactScreenCard = memo(({ contact }: Props) => {

  const [isOnline, ] = useState(false)
  const {friends, friendsCount} = useFriends()
  const prayersCount = useSelector(countPrayersByUserId(contact?.userId, { published: true}))
  const teamsCount = useSelector(selectTeamsCountByUserId(contact?.userId))
  const stats = [ 
    { icon: 'activity', label: "Prayers", count: prayersCount  }, 
    { icon: 'users', label: "Friends", count: friendsCount  }, 
    { icon: 'slack', label: "Teams", count: teamsCount  }, 
  ] 

  // whether contact is already friend
  const isFriend = !!friends.filter(({userId}) => userId==contact?.userId)?.length

  return !contact ? ( <Loader /> ) : (
    <ScreenCard>

      <ScreenHeaderContainer>
        <ScreenHeader>
          <Avatar path={contact?.avatar?.[0]} size={80} />
          <IMProfile>
            <DisplayName>{contact?.displayName}</DisplayName>
            <Status {...{isOnline }}>@{contact?.username}</Status>
          </IMProfile>
        </ScreenHeader>

        <IMStats {...{ stats }} />

        <Buttons>
          <RecordPrayerButton />
          <ChatNowButton />
          <ShareFriend {...{ contact }} />
          {isFriend && (<UnFriendButton {...{ contact }} />) }
        </Buttons>
      </ScreenHeaderContainer>

      <Section>
        <About>{contact?.about}</About>
        <JoinedOn>{ contact?.joinedOn }</JoinedOn>
        <LastSeen>{ contact?.joinedOn }</LastSeen>

      </Section>

      <Section>
        <Header1>Latest Prayers</Header1>
        <PrayerList {...{contact}} />
      </Section>

      <ScreenFooter>
      </ScreenFooter>

    </ScreenCard>  
  )
})

export default ContactScreenCard


const Header1 = styled(atoms.Text)`
  font-family: SFProDisplay-Bold;
  height: 40px;
`



/* Stats 
============================================================ */

type S = { label: string, count: number, icon?: string }

const IMStats = styled(({ stats, ...props }: {stats: S[], style?: ViewStyle}) => {

  const { backgroundColor, borderWidth, borderColor, borderRadius,
    ...style } = props.style[0]

  const Stat = useMemo(() => ({ label, count, icon }: S) => (
    <atoms.Row style={{ width: 132, backgroundColor, borderColor, borderWidth, borderRadius }}>
      <Icon name={icon} size={ICON_SIZE} style={style} />
      <View style={{ flexDirection: 'column', alignItems: 'center'}}>
        <atoms.Text {...{style, children: label}} />
        <atoms.Text {...{style: [style, { fontFamily: 'SFProDisplay-Bold' }], children: count }} />
      </View>
    </atoms.Row>
  ), [])

  return (
    <atoms.Row>{ stats?.map(
      (stat, key) => <Stat {...{...stat, key}} />) }
    </atoms.Row>
  )
})`
  font-size: 16px;
  // border-radius: 15px; 
  // border: 1px solid ${p => p.theme.colors.mutedFg};
  color: ${p => p.theme.colors.messageFg};

`



const IMProfile = styled.View`
  margin-left: 16px;
`

const IsOnline = styled(({ isOnline, ...p }) => (
    <atoms.Text {...p}>{' '}{ isOnline ? 'Online' : 'Offline' }</atoms.Text>
))`
  font-family: SFProDisplay-Bold;
  color: ${p => p.theme.colors.primaryButtonBg}
`


/* Buttons
============================================================ */

const Buttons = styled.View`
  width: 100%;
  border-top-width: 1px; 
  border-top-style: solid;
  border-top-color: ${p => p.theme.colors.inputDisabledBg};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const Button = (buttonType: React.FC<any>) => 
  styled(buttonType).attrs(p => {
    const size = BUTTON_SIZE
    const color = p.theme.colors.primaryButtonBg
    return {
      label: p.label, size, color,
      icon:  (props) => <ButtonIcon {...{name: p.name, ...props}} /> }
  })`
    flex:1;
    background-color: transparent;
  `

const ShareFriend = styled(ShareContact).attrs(p => ({
  size: BUTTON_SIZE, label: "Share",
  color: p.theme.colors.primaryButtonBg,
  icon: (props) => <ButtonIcon {...{name: 'v-card', ...props}} /> 
}))`
flex: 1;
background-color: transparent;
`

const UnFriendButton = styled(({ contact, ...props}) => {
  const { name, label, size, color, ...p } = props
  const { profile: me, update } = useAuthProfile()

  const onPress = () => {  me?.friends_ids &&
    Alert.alert("Add Contact", `Remove ${bolderize(contact.displayName)} from your friends list?`, [
      { text: "Yes", onPress: () => { update({ friends_ids: 
          me.friends_ids.filter(id => id !== contact.userId) })
      }}, 
      { text: "Cancel", style: "cancel"} 
    ])
  }
  
  return (
    <TouchableOpacity {...{onPress, ...p}}>
      <ButtonIcon {...{name, size, color}} />
      { label && ( <atoms.Text children={label} numberOfLines={2} style={{ color, fontSize: 14 }} />)}
    </TouchableOpacity>
  )
}).attrs(p => ({   
  name: 'remove-user', label: "Unfriend", 
  size: BUTTON_SIZE, color: p.theme.colors.primaryButtonBg,
}))`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const ChatNowButton = styled(Button(ChatNow)).attrs({
  name: 'chat', label: "Chat"
})``

const RecordPrayerButton = styled(Button(RecordPrayer)).attrs({
  name: 'mic', label: "Pray"
})``

const DisplayName = styled(atoms.ScreenHeaderCopy)`
  font-weight: normal;
  font-family: SFProDisplay-Bold
  height: 30px;
`

const Status = styled(({ isOnline, children, ...p }) => {
  const containerStyle = useMemo(() => ({ 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}), [])
  return (
    <View style={containerStyle}>
      <atoms.Text {...p}>{children}</atoms.Text>
      <IsOnline {...{isOnline}} />
    </View> 
  )
})`
  font-size: 14px;
`

const LastSeen = styled(atoms.Text).attrs(p => ({ 
  children: `Last seen : ${formatDistance(new Date(p.children), new Date(), { addSuffix: true })}`
}))`
  font-size: 14px;
  color: ${p => p.theme.colors.mutedFg};
`
const JoinedOn = styled(atoms.Text).attrs(p => ({ 
  children: `Joined : ${format(new Date(p.children), 'PPP')}`
}))`
  font-size: 14px;
  color: ${p => p.theme.colors.mutedFg};
`
const About = styled(atoms.Text).attrs(p => ({
  children: p.children ?? "No headline"
}))`
  font-family: SFProDisplay-Medium;

`

/* Screen
============================================================ */


const ScreenHeaderContainer = styled.View`
  background-color: ${p => p.theme.colors.cardBg};
  border-bottom-width: 3px; 
  border-style: solid; 
  border-color: ${p => p.theme.colors.inputPlaceholder};

`
const Section = styled(ScreenHeaderContainer)`
  margin-top: 5px;
  padding: 20px;
`
const ScreenHeader = styled(props => {
  const navigation = useNavigation()
  const navigateBack = useMemo(() => () => navigation.goBack(), [])
  return ( <atoms.ScreenHeader {...{
    leftIcon: <atoms.BackIcon onPress={navigateBack} />,
    ...props
  }} />)
})`
  justify-content: flex-start;
`

const ScreenFooter = styled(atoms.ScreenFooter)`
`
const ScreenCard = styled(atoms.ScreenCard)`
  background-color: ${p => p.theme.colors.mutedFg};
`
