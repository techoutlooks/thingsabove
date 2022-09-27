import React, { useState, useContext } from "react";
import { View, Text, TouchableWithoutFeedback } from "react-native";
import styled, { ThemeContext } from "styled-components/native";
import {BUTTON_HEIGHT, CONTAINER_RATIO, RADIUS} from "./constants";


const Btn = ({
  label,
  onPress,
  disabled,
  icon,
  primary,
  size = 24,
  ...props
}) => {
  const [isDown, setIsDown] = useState(false);
  const theme = useContext(ThemeContext);

  const pressIn = () => setIsDown(true);
  const pressOut = () => setIsDown(false);

  return (

    <TouchableWithoutFeedback
      onPressIn={!disabled ? pressIn : undefined}
      onPressOut={!disabled ? pressOut : undefined}
      onPress={!disabled ? onPress : undefined}
    >
      <Container
        isDown={isDown}
        primary={primary}
        disabled={disabled}
        icon={icon != null}
        size={size}
        {...props}
      >
        {icon != null ? (
          icon({ color: theme.colors.mutedFg, size })
        ) : (
          <TextLabel primary={primary} disabled={disabled}>
            {label}
          </TextLabel>
        )}
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default Btn;

const Container = styled(
  ({ isDown, primary, disabled, icon, size, ...props }) => <View {...props} />
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
      ? p.theme.colors.primaryButtonBgDown
      : p.theme.colors.primaryButtonBg };
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

const TextLabel = styled(({ primary, disabled, ...props }) => (
  <View style={{
    display: 'flex', justifyContent: 'center',
    height: BUTTON_HEIGHT}} >
    <Text {...props} />
  </View>
))`
  font-weight: bold;

  ${(p) => p.primary && `
  color: ${p.theme.colors.primaryButtonFg};`}

  ${(p) => p.disabled && `
  color: ${p.theme.colors.inputDisabledFg};`}
`;
