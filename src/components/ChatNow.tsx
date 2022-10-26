import React from "react";
import { ViewProps } from "react-native";
import { Feather } from '@expo/vector-icons';
import styled, {useTheme} from "styled-components/native";
import { Text } from "@/components/uiStyle/atoms"



type Props = { label?: string, icon?: React.FC<any>, 
  size?: number, color?: string } & ViewProps

export default ({label, ...p }: Props) => {

  // defaults
  const theme = useTheme()
  const size = p.size ?? 30
  const color = p.color ?? theme.colors.fg 

  return (
    <Container style={p.style}>
      { p?.icon({ size, color }) ?? <Feather {...{ name: "message-square", size, color}} /> }
      { label && (<Label {...{ color, children: label }} />) }
    </Container>
  )
}

const Label = styled(Text).attrs({ numberOfLines: 2 })`
  font-size: 14px;
  color: ${p => p.color}
`

const Container = styled.View`
  justify-content: center;
  align-items: center;
`
