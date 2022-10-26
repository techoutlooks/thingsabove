import React, { useRef } from 'react';
import { Text, Animated, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native'
import { RADIUS, Spacer } from '@/components/uiStyle/atoms';
import * as appImages from '../../../../../assets';
import * as consts from "../constants"


type Props = {
  animationController: React.MutableRefObject<Animated.Value> }


export default ({ animationController }: Props) => {
  const window = useWindowDimensions();

  const careRef = useRef<Text | null>(null);

  const slideAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [window.width, window.width, 0, -window.width, -window.width],
  });

  const careEndVal = 26 * 2; // 26 being text's height (font size)
  const careAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [careEndVal, careEndVal, 0, -careEndVal, -careEndVal],
  });

  const imageEndVal = consts.IMAGE_WIDTH * 4;
  const imageAnim = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [imageEndVal, imageEndVal, 0, -imageEndVal, -imageEndVal],
  });

  return (
    <Container
      style={[{ transform: [{ translateX: slideAnim }] }]}
    >
      <Image
        style={[{ transform: [{ translateX: imageAnim }] }]}
        source={appImages.onboarding.care_image}
      />
      <Spacer height={18}/>
      <Title ref={careRef}
        style={[{ transform: [{ translateX: careAnim }] }]}
      >
        Pray with friends
      </Title>
      <Description>
        Therefore confess your sins to each other and pray for each other so that you may be healed. 
        The prayer of a righteous person is powerful and effective. James 5:16
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
  // paddingHorizontal: 64px;
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

