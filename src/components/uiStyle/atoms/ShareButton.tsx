import { memo, useCallback } from "react"
import { ViewStyle, Share, ShareContent, ShareOptions } from "react-native"
import styled, {useTheme} from "styled-components/native";
import { SimpleLineIcons } from '@expo/vector-icons';

import Text from "./Text"
import Btn from "./Btn"



const DEFAULT_BUTTON_SIZE = 24

type Props = { 
  content: ShareContent, options?: ShareOptions, 
  label?: string, icon?: React.FC<any>, size?: number, color?: string, style?: ViewStyle 
}


const ShareButton = styled(({content, options, label, style, ...p}: Props) => {

  const theme = useTheme()
  const color = p.color ?? theme.colors.fg
  const size = p.size ?? DEFAULT_BUTTON_SIZE
  // const defaultIcon = <SimpleLineIcons {...{ name: 'share-alt', size, color }} /> 

  const defaultIcon = () => (
    <SimpleLineIcons {...{ name: "share-alt", size, color }} /> )
  const icon = p.icon ? () => p.icon({ size, color }) : defaultIcon


  const onPress = useCallback(async () => {
    try {
      const result = await Share.share(content, options);
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error?.message);
    }
  }, [content, options])

  return (
    // <Container {...{style, onPress}}>
    //   { p.icon?.({ size, color }) ?? defaultIcon }
    //   { label && (<Label {...{ color, children: label }} />) }
    // </Container>
    <Container {...{style}}>
      <Btn {...{style, icon, color, onPress }} />
      { label && (<Label {...{ color, children: label }} />) }
    </Container>
  )
})`
`


const Label = styled(Text).attrs({ numberOfLines: 2 })`
  font-size: 14px;
  color: ${p => p.color}
`
const Container = styled.TouchableOpacity`
  background-color: transparent;
  justify-content: center;
  align-items: center;
  // width: 100px;
`

export default memo(ShareButton)