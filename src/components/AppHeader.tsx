import React, { useCallback, ComponentProps } from "react";
import {useNavigation} from "@react-navigation/native";
import styled from "styled-components/native";

import {useAuthProfile} from "@/hooks";
import {ScreenHeader, BackIcon, Spacer} from '@/components/uiStyle/atoms';
import Avatar from "./Avatar"


/***
 * @param leftIcon: custom left icon.
 * @param hideGoBack: only if no leftIcon is specified
 * @param navigateBack: custom `navigateBack` callback
 */
type Props = {
  hideGoBack: boolean
  navigateBack?: () => void
}  & ComponentProps<typeof ScreenHeader>

/***
 * Displays a screen header with back icon by default.
 * A custom icon may be specified thru the `leftIcon` prop.
 */
export default styled(({children, hideGoBack=false, leftIcon,  ...p}: Props) => {
    
  const {profile} = useAuthProfile()
  const navigation = useNavigation()
  const navigateBack = useCallback(() => navigation.goBack(), [])

  return (
    <ScreenHeader {...{ ...p, 
      leftIcon: leftIcon?? (!hideGoBack && 
        <BackIcon onPress={p.navigateBack ?? navigateBack} />)
      }}
    >
      {<Avatar 
        path={profile?.avatar_url} size={60} style={{marginRight: 12}}
        onPress={() => navigation.navigate('Auth', {screen: 'AuthProfile'})}
      />}
      <Spacer width={12} />
      {children}
    </ScreenHeader>
  )
})`
    width: 100%;
`