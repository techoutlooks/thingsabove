import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import { View, ViewProps, TouchableWithoutFeedback } from "react-native";
import styled, { useTheme } from "styled-components/native";
import {BUTTON_HEIGHT, CONTAINER_RATIO, RADIUS} from "./constants";

import { MaterialIcons } from '@expo/vector-icons'; 


type Props = { 
  initiallyOn?: boolean, icon?: any, size?: number, 
  disabled?: boolean, transparent?: boolean, primary?: boolean,
  onChange: (on: boolean|undefined) => void 
} & ViewProps


/*** 
 * Base Switch functionality 
 * Component that switches position ON/OFF upon successive presses.
 * Show by default a radio button (customizable through the `icon` prop)
 */
const UnMemoizedSwitch = ({ disabled, onChange, ...props}: Props) => {
    
  const [isDown, setIsDown] = useState(props?.initiallyOn);
  const pressIn = () => setIsDown(b => !b)
  useEffect(() => { onChange?.(isDown) }, [isDown])

  return (
    <TouchableWithoutFeedback
      onPressIn={!disabled ? pressIn : undefined}
    >
      <Container {...{ disabled, isDown, ...props }} />
    </TouchableWithoutFeedback>
  )
}


/*** 
 * SwitchButton 
 * Show by default a radio button (customizable through the `icon` prop)
 */
const UnMemoizedSwitchButton = 
  ({ onChange: callback, ...p }: Props) => {

  const theme = useTheme()
  const [isDown, setIsDown] = useState(!!p?.initiallyOn);

  const onChange = useCallback((isOn: boolean) => {
    setIsDown(isOn); callback(isOn) }, [callback])

  const {icon, size=24, primary } = p

  return (
    <UnMemoizedSwitch {...{ onChange, ...p }}>
      {icon ? ( p.icon({ size, 
        color: isDown && primary? 'white' : theme.colors.mutedFg })
      ) : (
        <MaterialIcons {...{
          name: `radio-button-${isDown? 'checked': 'unchecked'}`, 
          size, color: theme.colors.mutedFg 
        }} />
      )}
    </UnMemoizedSwitch>
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
    height: ${p.size * CONTAINER_RATIO}px; 
  `}

  ${(p) => p.primary && `
  background-color: ${
    p.isDown
      ? p.theme.colors.primaryButtonBg
      : p.transparent ? 'transparent' : p.theme.colors.inputBg };
  `}

  ${(p) => !p.primary && `
  background-color: ${
    p.isDown 
      ? p.theme.colors.inputBgDown 
      : p.transparent ? 'transparent' : p.theme.colors.inputBg };
  `}

  ${(p) => p.disabled && `
  background-color: ${p.theme.colors.inputDisabledBg}; `}
`;


const Switch = memo(UnMemoizedSwitch)
const SwitchButton = memo(UnMemoizedSwitchButton)
export { Switch, SwitchButton, Props as SwitchProps }