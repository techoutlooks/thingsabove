import React, { memo, ComponentProps } from "react"
import { TextProps, ViewProps, Pressable } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather as Icon } from '@expo/vector-icons'
import styled, {useTheme} from "styled-components/native"
import Timeline from 'react-native-timeline-flatlist'
import * as datefmt from "@/lib/prettyTime"
import { trunc } from "@/lib/utils"

import { Shareable } from "@/types/models"
import * as atoms from "@/components/uiStyle/atoms"
import { Heading1, Row } from "./elements"



type Props = { 
  heading: string, items: Shareable[],
  hasBorderBottom?: boolean,
  listKey?: string,
  onSelect?: (item: Shareable) => void,
  onViewAll?: () => void
} & ViewProps


export default memo(({ heading, items, hasBorderBottom, listKey, ...props }: Props) => {
  
  console.log(`\n\n ?????? listKey=`, listKey)
  const theme = useTheme()
  const data = items?.map(({description, ...item}) => ({ 
    time: datefmt.shortRelativeFormat(new Date(item?.shared_at ?? item?.updated_at)), 
    description: trunc(description, 24),
    ...item }))
    
  return (
    <Container itemsLength={data?.length} style={props.style} listKey={listKey}>
      <atoms.Spacer height={24} />
      <Row>
        <Heading1><Icon name="activity" size={18}  />{' '}  { heading }</Heading1>
        <ViewAllButton onPress={props.onViewAll} />
      </Row>
      <atoms.Spacer height={16} />
      { !items?.length ? <NoData /> : (
        <ItemsList {...{
          listKey,
          hasBorderBottom,
          data, lineColor: theme.colors.primaryButtonBg, 
          circleColor: theme.colors.primaryButtonBg,
          onEventPress: props.onSelect
        }} /> 
      )}
    </Container>
  )
})



const ViewAllButton = styled(atoms.Btn)
  .attrs({label: "View All"})
``

const ItemsList = styled(Timeline)`
  ${p => p.hasBorderBottom && `
    // background-color: ${p.theme.colors.cardBg};
    border-bottom-width: .5px; 
    border-style: solid; 
    border-color: ${p.theme.colors.inputPlaceholder};
  `}
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