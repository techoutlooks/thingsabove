import React from "react";
import styled from "styled-components/native";
import {TextProps} from "react-native";


const Duration = styled.Text.attrs<{ value: string } & TextProps>(p => ({
    children: p.value || '00:00'
}))<{ value: string } & TextProps>`
  color: ${p => p.theme.colors.fg};
  font-size: 16px;
  //width: 45px;
`

export default Duration
