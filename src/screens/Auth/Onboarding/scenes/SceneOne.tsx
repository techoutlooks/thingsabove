import React, { useRef } from 'react';
import { Text, Animated, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native'
import { Spacer, RADIUS } from '@/components/uiStyle/atoms';

import * as appImages from '../../../../../assets';
import * as consts from "../constants"


interface Props {
  animationController: React.MutableRefObject<Animated.Value>;
}

// 1.

const OneView = ({ animationController }: Props) => {
  
  const window = useWindowDimensions();
  const relaxRef = useRef<Text | null>(null);

  const relaxAnimation = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.8],
    outputRange: [-(26 * 2), 0, 0],
  });
  const textAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [0, 0, -window.width * 2, 0, 0],
  });
  const imageAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [0, 0, -350 * 4, 0, 0],
  });
  const slideAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.8],
    outputRange: [0, 0, -window.width, -window.width],
  });

  return (
    <Container
      style={[{ transform: [{ translateX: slideAnim }] }]}
    >
      <Title
        style={[ { transform: [{ translateY: relaxAnimation }] }]}
        ref={relaxRef}
      >
        ThingsAbove
      </Title>
      <Description
        style={[ { transform: [{ translateX: textAnim }] }]}
      >
        Record and share your prayers with your friends. Spread joy ++
      </Description>
      <Spacer height={18}/>
      <Image
        style={[ { transform: [{ translateX: imageAnim }] }]}
        source={appImages.onboarding.relax_image}
      />
    </Container>
  );
};

const Image = styled(Animated.Image)`
  maxWidth: ${consts.IMAGE_WIDTH}px;
  maxHeight: ${consts.IMAGE_HEIGHT}px;
  border-radius: ${RADIUS}px;
`
const Title = styled(Animated.Text)`
  fontSize: 24px;
  textAlign: center;
  fontFamily: SFProDisplay-Bold;
  color: ${p => p.theme.colors.primaryButtonFg}
`
const Description = styled(Animated.Text)`
  textAlign: center;
  fontSize: 15px;
  fontFamily: SFProDisplay-Regular;
  paddingVertical: 16px;
  // color: ${p => p.theme.colors.primaryButtonFg}
`
const Container = styled(Animated.View)`
  position: absolute;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  align-items: center;
  paddingHorizontal: 28px;
`
export default OneView;
