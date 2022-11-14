import React, { useRef } from 'react';
import { Text, Animated, useWindowDimensions } from 'react-native';
import { Spacer } from '@/components/uiStyle/atoms';

import * as appImages from '../../../../../assets';
import { IMAGE_WIDTH, Container, Title, Description, Image } from "../elements"


interface Props {
  animationController: React.MutableRefObject<Animated.Value>;
}


export default ({ animationController }: Props) => {
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

  const imageEndVal = IMAGE_WIDTH * 4;
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
        source={appImages.branding.logo}
      />
      <Spacer height={18}/>
      <Title ref={careRef}
        style={[{ transform: [{ translateX: welcomeTextAnim }] }]}  
      >
        Explore prayer
      </Title>
      <Description>
        What is your key to answered prayers? 
        Do you mind sharing with people that matter to you?
      </Description>
    </Container>
  );
};



