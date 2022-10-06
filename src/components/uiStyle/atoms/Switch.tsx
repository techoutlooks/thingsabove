import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableWithoutFeedback } from "react-native";
import styled, { useTheme } from "styled-components/native";
import {BUTTON_HEIGHT, CONTAINER_RATIO, RADIUS} from "./constants";

import { MaterialIcons } from '@expo/vector-icons'; 


type Props = { 
  icon: any, size: number , disabled?: boolean, 
  intiallyOn?: boolean, primary?: boolean,
  onChange: (on: boolean) => void 
}


export default ({icon, size, disabled, onChange, ...props}: Props) => {
    
  const [isDown, setIsDown] = useState(!!props?.intiallyOn);
  const theme = useTheme();

  const pressIn = () => setIsDown(b => !b)
  useEffect(() => { onChange?.(isDown) }, [isDown])

  return (
    <TouchableWithoutFeedback
      onPressIn={!disabled ? pressIn : undefined}
    >
      <Container {...{ disabled, isDown, icon, size, ...props }}>
        {icon != null ? (
          icon({ size, color: isDown && props.primary? 'white' : theme.colors.mutedFg })
        ) : (
          <MaterialIcons {...{
            name: `radio-button-${isDown? 'checked': 'unchecked'}`, 
            size, color: theme.colors.mutedFg 
          }} />
        )}
      </Container>
    </TouchableWithoutFeedback>
  )
}

const Container = styled(({ isDown, primary, disabled, icon, size, 
  ...props }) => (<View {...props} />)
)`
  border-radius: ${RADIUS}px;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  ${(p) => p.icon && `
  padding: 0;
  width: ${p.size * CONTAINER_RATIO}px;
  height: ${p.size * CONTAINER_RATIO}px; `}

  ${(p) => p.primary && `
  background-color: ${
    p.isDown
      ? p.theme.colors.primaryButtonBg
      : p.theme.colors.inputBg };
  `}

  ${(p) => !p.primary && `
  background-color: ${
    p.isDown 
      ? p.theme.colors.inputBgDown 
      : p.theme.colors.inputBg };
  `}

  ${(p) => p.disabled && `
  background-color: ${p.theme.colors.inputDisabledBg}; `}
`;