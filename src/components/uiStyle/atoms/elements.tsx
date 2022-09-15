import React, { ComponentPropsWithoutRef, useEffect } from "react";
import styled from "styled-components/native";
import {MaterialIcons} from "@expo/vector-icons";
import Btn from "./Btn";
import {Sizes, CONTAINER_PADDING, WIDTH, HEIGHT, PADDING, RADIUS} from "./constants";


export const Row = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  padding: ${CONTAINER_PADDING}px;
  width: ${WIDTH}px;
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

type ButtonProps = {
    size?: keyof typeof Sizes,
    name: string } & ComponentPropsWithoutRef<typeof Btn>

export const Button = styled(({size, name, ...p}: ButtonProps) => (
    <Btn
        icon={p => <MaterialIcons {...{name, ...p}} />}
        {...{name, size: Sizes[size], ...p}}
    />
))``

