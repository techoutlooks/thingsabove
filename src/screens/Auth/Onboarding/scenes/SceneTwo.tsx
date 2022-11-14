import React, { useRef } from 'react';
import { Text, Animated, useWindowDimensions } from 'react-native';
import { Spacer } from '@/components/uiStyle/atoms';
import * as appImages from '../../../../../assets';
import { IMAGE_WIDTH, Container, Title, Description, Image } from "../elements"


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

  const imageEndVal = IMAGE_WIDTH * 4;
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



