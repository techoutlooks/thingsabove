import React, { useRef } from 'react';
import { Text, Animated, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native'
import { Spacer, RADIUS } from '@/components/uiStyle/atoms';

import * as appImages from '../../../../../assets';
import { IMAGE_WIDTH, Container, Title, Description, Image } from "../elements"



interface Props {
  animationController: React.MutableRefObject<Animated.Value>;
}


// 3.
export default ({ animationController }: Props) => {
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

  const imageEndVal = IMAGE_WIDTH * 4;
  const imageAnim = animationController.current.interpolate({
    inputRange: [0, 0.4, 0.6, 0.8],
    outputRange: [imageEndVal, imageEndVal, 0, -imageEndVal],
  });

  return (
    <Container
      style={[{ transform: [{ translateX: slideAnim }] }]}
    >
      <Title ref={careRef}>
        Trending Prayer
      </Title>
      <Description
        style={[ { transform: [{ translateX: textAnim }] }]}
      >
        Join those praying for the following current prayer items
      </Description>
      <Spacer height={18}/>
      <Image
        style={[{ transform: [{ translateX: imageAnim }] }]}
        source={appImages.onboarding.mood_dairy_image}
      />
    </Container>
  );
};


