import React, { useRef } from 'react';
import { Text, Animated, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native'
import { Spacer, RADIUS } from '@/components/uiStyle/atoms';

import * as appImages from '../../../../../assets';
import * as consts from "../constants"



interface Props {
  animationController: React.MutableRefObject<Animated.Value>;
}


// 3.
const MoodDiaryView: React.FC<Props> = ({ animationController }) => {
  const window = useWindowDimensions();

  const careRef = useRef<Text | null>(null);

  const slideAnim = animationController.current.interpolate({
    inputRange: [0, 0.4, 0.6, 0.8],
    outputRange: [window.width, window.width, 0, -window.width],
  });

  const textEndVal = window.width * 2; // 26 being text's height (font size)
  const textAnim = animationController.current.interpolate({
    inputRange: [0, 0.4, 0.6, 0.8],
    outputRange: [textEndVal, textEndVal, 0, -textEndVal],
  });

  const imageEndVal = consts.IMAGE_WIDTH * 4;
  const imageAnim = animationController.current.interpolate({
    inputRange: [0, 0.4, 0.6, 0.8],
    outputRange: [imageEndVal, imageEndVal, 0, -imageEndVal],
  });

  return (
    <Container
      style={[{ transform: [{ translateX: slideAnim }] }]}
    >
      <Title ref={careRef}>
        Pray for
      </Title>
      <Description
        style={[ { transform: [{ translateX: textAnim }] }]}
      >
        Experience prayer with friends
      </Description>
      <Spacer height={18}/>
      <Image
        style={[{ transform: [{ translateX: imageAnim }] }]}
        source={appImages.onboarding.mood_dairy_image}
      />
    </Container>
  );
};



const Image = styled(Animated.Image)`
  border-radius: ${RADIUS}px;
  maxWidth: ${consts.IMAGE_WIDTH}px;
  maxHeight: ${consts.IMAGE_HEIGHT}px;
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
  paddingHorizontal: 64px;
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

export default MoodDiaryView;
