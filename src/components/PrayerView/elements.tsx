import React, { useCallback } from "react"
import { FlatList, View, TouchableOpacity, ViewProps, TextProps } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather } from '@expo/vector-icons'
import { SimpleLineIcons } from '@expo/vector-icons';
import styled, {useTheme} from "styled-components/native"
import  { format, formatDistance } from 'date-fns'

import { Prayer } from "@/types/models"
import * as atoms from "@/components/uiStyle/atoms"
import AudioPlayer from "../AudioPlayer"


export const AudioList = 
  styled(({prayer, style}: {prayer: Prayer} & ViewProps) => {

    const keyExtractor = useCallback((item, i) => item+i, []) 
    const renderItem = ({item: path}) => (<AudioPlayer {...{path }} />)

    if(!prayer) return (
      <NoData message="Your prayer list is empty!" />
    )
    return (
      <View {...{ style }}>
        <FlatList {...{ data: prayer.audio_urls, keyExtractor, renderItem }} />
      </View>
    )
})
`
  border: ${p => p.theme.colors.messageBg} 2px;
  border-radius: ${atoms.RADIUS}px;
`
export const EditPrayerButton = styled(p => {
  
  const navigation = useNavigation()
  const onPress = () => navigation.navigate("Prayer", { 
    screen: "EditInfo", params: { prayerId: p?.prayer?.id} })

  return (<atoms.Btn {...{onPress, ...p}} />)
}).attrs({ icon: () => 
    <SimpleLineIcons {...{ name: "pencil", size: atoms.BUTTON_SIZE }} />
})`
 width: 45px;
 height: 45px
 margin-right: 8px;
`

export const Tag = styled(({name, ...props}) => {
  const theme = useTheme()
	return (
		<TouchableOpacity {...props} >
      <Row>
        <Feather name="check-circle" size={24} color={theme.colors.primaryButtonFg} /> 
        <atoms.Text style={{color: 'white', fontSize: 14}}>{' ' + name}</atoms.Text>
      </Row>
		</TouchableOpacity>
	)
})`
	padding: 5px 8px 5px 5px;
	border-radius: ${atoms.RADIUS}px;
  background-color: ${p => p.theme.colors.primaryButtonBg}
`
export const NoData = styled(({message, ...props}: {message?: string} & TextProps) => (
  <Text {...{children: message, ...props}} />
)).attrs(p => ({ message: 'No content found!', ...p }))`
  font-family: SFProDisplay-Bold;
  font-size: 14px;
`
export const Info = styled.Text.attrs({numberOfLines: 1})`
  font-size: 13px;
  line-height: 28px;
  color: ${p => p.theme.colors.titleFg};
  font-family: SFProDisplay-Medium;
`
export const Time = styled(({created_at, updated_at, style}) => (
  <Row {...{style}}>
    <Info>{format(new Date(created_at), 'MM/dd/yyyy')}{' '}</Info>
    <Info>(updated:{' '}
      {formatDistance(new Date(updated_at), new Date(), { addSuffix: true })})
    </Info>
  </Row>
))`
  justify-content: flex-start;
`
export const Title = styled(atoms.Text)`
  font-family: SFProDisplay-Bold;
  font-size: 18px;
  line-height: 20px;
  color: ${p => p.theme.colors.fg};
`
export const Description = styled(atoms.Text).attrs({numberOfLines: 5})`
  font-size: 15px;
  font-family: SFProDisplay-Medium;

`
export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`
export const Buttons = styled(Row)`
  justify-content: space-between;
`
export const Container = styled.View `
  padding: 16px;
`