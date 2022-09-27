import React, { memo } from "react"
import { View } from "react-native"
import ContentLoader, { Rect, Circle, Path } from "react-content-loader/native"
import styled, { useTheme } from "styled-components/native"
import { WIDTH as DEFAULT_WIDTH} from "@/components/uiStyle/atoms";

const width = DEFAULT_WIDTH - 100

// https://skeletonreact.com/
const UnStyledSkeleton = (props) => {
  const theme = useTheme()
  return (
    <ContentLoader 
      speed={2}
      width={width}
      height={160}
      viewBox={`0 0 ${width} 160`}
      backgroundColor={theme.colors.sentMessageBg}
      foregroundColor={theme.colors.sentMessageFg}
      {...props}
    >
      <Rect x="48" y="8" rx="3" ry="3" width="88" height="6" /> 
      <Rect x="48" y="26" rx="3" ry="3" width="52" height="6" /> 
      <Rect x="0" y="56" rx="3" ry="3" width="410" height="6" /> 
      <Rect x="0" y="72" rx="3" ry="3" width="380" height="6" /> 
      <Rect x="0" y="88" rx="3" ry="3" width="178" height="6" /> 
      <Circle cx="20" cy="20" r="20" />
    </ContentLoader>
  )
}

const Skeleton = styled(({style, ...p}) => (
  <View {...{style}} >
    <UnStyledSkeleton {...p} />
  </View>
))`
  align-items: center;
  justify-content: center;
  padding: 16px;
`


export default memo(Skeleton)