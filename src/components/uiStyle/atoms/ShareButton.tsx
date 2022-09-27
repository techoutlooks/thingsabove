import { memo, useCallback } from "react"
import { ViewStyle, Share, ShareContent, ShareOptions, TouchableOpacity } from "react-native"
import styled, {useTheme} from "styled-components/native";

import { SimpleLineIcons } from '@expo/vector-icons';



type Props = { 
  content: ShareContent, options?: ShareOptions, 
  style?: ViewStyle 
}


const ShareButton = styled(({content, options, style}: Props) => {
  const theme = useTheme()

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
      alert(error.message);
    }
  }, [content, options])

  return (
    <TouchableOpacity {...{style, onPress}}>
      <SimpleLineIcons name="share-alt" size={36} color={theme.colors.fg} />
    </TouchableOpacity>
  )
})`
  background-color: transparent;
`

export default memo(ShareButton)