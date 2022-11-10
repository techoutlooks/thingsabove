import React, { memo, ComponentProps } from "react"
import { TextProps, ViewProps, Pressable } from "react-native"
import { Feather as Icon } from '@expo/vector-icons'
import styled, {useTheme} from "styled-components/native"
import Timeline from 'react-native-timeline-flatlist'
import * as datefmt from "@/lib/prettyTime"

import { Shareable } from "@/types/models"
import * as atoms from "@/components/uiStyle/atoms"
import { Heading1 } from "./elements"



type Props = { 
  heading: string, items: Shareable[],
  onSelect?: (item: Shareable) => void
} & ViewProps


export default memo(({ heading, items, ...props }: Props) => {
  
  const theme = useTheme()
  const data = items?.map(item => ({ time: 
    datefmt.shortRelativeFormat(new Date(item.updated_at)), ...item }))
    
  return (
    <Container itemsLength={data?.length} style={props.style}>
      <Heading1><Icon name="activity" size={18}  />{' '}  { heading }</Heading1>
      { !items?.length ? <NoData /> : (
        <ItemsList {...{
          data, lineColor: theme.colors.primaryButtonBg, 
          circleColor: theme.colors.primaryButtonBg,
          onEventPress: props.onSelect
        }} /> 
      )}
    </Container>
  )
})

const ItemsList = styled(Timeline)`
`
export const NoData = styled(({message, ...props}: {message?: string} & TextProps) => (
  <atoms.Text {...{children: message, ...props}} />
)).attrs(p => ({ message: 'No content', ...p }))`
  margin-left: 30px;
  font-size: 14px;
  color: ${p => p.theme.colors.mutedFg};
`
const Container = styled(Pressable)`
  ${p => p.itemsLength && 'flex: 1;'}
`