import React, { useRef } from 'react';
import { Text, Animated, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native'
import { RADIUS, Spacer } from '@/components/uiStyle/atoms';

import * as appImages from '../../../../../assets';
import * as consts from "../constants"


interface Props {
  animationController: React.MutableRefObject<Animated.Value>;
}


const WelcomeView: React.FC<Props> = ({ animationController }) => {
  const window = useWindowDimensions();

  const careRef = useRef<Text | null>(null);

  const slideAnim = animationController.current.interpolate({
    inputRange: [0, 0.6, 0.8],
    outputRange: [window.width, window.width, 0],
  });

  const textEndVal = 26 * 2; // 26 being text's height (font size)
  const welcomeTextAnim = animationController.current.interpolate({
    inputRange: [0, 0.6, 0.8],
    outputRange: [textEndVal, textEndVal, 0],
  });

  const imageEndVal = consts.IMAGE_WIDTH * 4;
  const imageAnim = animationController.current.interpolate({
    inputRange: [0, 0.6, 0.8],
    outputRange: [imageEndVal, imageEndVal, 0],
  });

  return (
    <Container
      style={[{ transform: [{ translateX: slideAnim }] }]}
    >
      <Image
        style={[{ transform: [{ translateX: imageAnim }] }]}
        source={appImages.onboarding.welcome}
      />
      <Spacer height={18}/>
      <Title ref={careRef}
        style={[{ transform: [{ translateX: welcomeTextAnim }] }]}  
      >
        Welcome
      </Title>
      <Description>
        What is the key to answered prayers?
      </Description>
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
`
const Container = styled(Animated.View)`
  position: absolute;
  align-items: center;
  justify-content: center;
  padding-bottom: 100px;
  align-items: center;
  paddingHorizontal: 28px;
`
export default WelcomeView;
