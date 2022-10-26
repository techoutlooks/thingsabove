import React, { ComponentPropsWithoutRef, useEffect } from "react";
import { ViewStyle } from "react-native";
import styled from "styled-components/native";
import {MaterialIcons} from "@expo/vector-icons";
import Btn from "./Btn";
import {Sizes, CONTAINER_PADDING, WIDTH, HEIGHT, PADDING, RADIUS} from "./constants";


export const Row = styled.View.attrs<ViewStyle>(p => ({ 
  width: WIDTH, padding: CONTAINER_PADDING, ...p
}))<ViewStyle>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  padding: ${p => p.padding}px;
  width: ${p => typeof p.width == 'string' ? p.width : `${p.width}px` };
  // flex: 1 1 ${WIDTH}px;
`

export const Col = styled.View`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: ${CONTAINER_PADDING}px;
  width:${WIDTH}px;
  height:${HEIGHT}px;
`

export type ButtonProps = {
    size?: keyof typeof Sizes,
    name: string } & ComponentPropsWithoutRef<typeof Btn>


/*** 
 * Opinionated <Btn /> for common use cases 
 * Assumes default props 
 * */
export const Button = styled(({size, name, ...p}: ButtonProps) => (
  <Btn {...{
    name, size: Sizes[size], 
    icon: p => <MaterialIcons {...{name, ...p}} />,
    ...p
  }} />
))``

