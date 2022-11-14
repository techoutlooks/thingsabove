import React from "react"
import styled from 'styled-components/native'
import { Text, Animated, useWindowDimensions } from 'react-native';
import * as atoms from '@/components/uiStyle/atoms';


export const IMAGE_WIDTH = 300;
export const IMAGE_HEIGHT = 300;


export const Image = styled(Animated.Image)`
  maxWidth: ${IMAGE_WIDTH}px;
  maxHeight: ${IMAGE_HEIGHT}px;
  border-radius: ${atoms.RADIUS}px;
`
export const Title = styled(Animated.Text)`
  fontSize: 24px;
  textAlign: center;
  fontFamily: SFProDisplay-Bold;
  color: ${p => p.theme.colors.primaryButtonFg}
`
export const Description = styled(Animated.Text)`
  textAlign: center;
  fontSize: 15px;

  padding: 16px 48px;
  color: ${p => p.theme.colors.cardBg}
  fontFamily: SFProDisplay-Regular;
`
export const Container = styled(Animated.View)`
  position: absolute;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  align-items: center;
  paddingHorizontal: 28px;
`