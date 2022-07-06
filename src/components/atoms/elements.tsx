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
  width: ${WIDTH};
`

export const Col = styled.View`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: ${CONTAINER_PADDING}px;
  width:${WIDTH};
  height:${HEIGHT};
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

