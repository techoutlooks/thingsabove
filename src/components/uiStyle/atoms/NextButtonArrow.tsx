import React, { useRef } from 'react';
import { StyleSheet, Text, Animated, Pressable } from 'react-native';
import { useNavigation } from "@react-navigation/native"
import styled, {useTheme} from "styled-components/native";
import { MaterialIcons as Icon } from '@expo/vector-icons'; 
import { isAndroid } from "@/lib/utils"

interface Props {
  onBtnPress: () => void;
  animationController: React.MutableRefObject<Animated.Value>;
}

const IconPressable = Animated.createAnimatedComponent(Icon);

/*
 * TODO:- find better solution for this animation so we don't have to use 'useNativeDriver: false' in 'IntroductionAnimationScreen.tsx' as width doesn't support it yet
 */
const NextButtonArrow = ({onBtnPress, animationController }: Props) => {

  const arrowAnim = useRef<Animated.AnimatedInterpolation>(
    new Animated.Value(0),
  );
  arrowAnim.current = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8],
    outputRange: [0, 0, 0, 0, 1],
  });


  // for transition from arrow to sign up
  const transitionAnim = arrowAnim.current.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [36, 0, 0],
  });
  const opacityAnim = arrowAnim.current.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, 1],
  });
  const iconTransitionAnim = arrowAnim.current.interpolate({
    inputRange: [0, 0.35, 0.85, 1], // or [0, 0.85, 1],
    outputRange: [0, 0, -36, -36], // or [0, 0, -36]
  });
  const iconOpacityAnim = arrowAnim.current.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0, 0],
  });
  // end

  const widthAnim = arrowAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: [58, 258],
  });

  const marginBottomAnim = arrowAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: [38, 0],
  });

  const radiusAnim = arrowAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: widthAnim,
          borderRadius: radiusAnim,
          marginBottom: marginBottomAnim,
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          {
            flex: 1,
            justifyContent: 'center',
            opacity: !isAndroid() && pressed ? 0.4 : 1,
          },
        ]}
        android_ripple={{ color: 'darkgrey' }}
        onPress={() => onBtnPress()}
      >
        {/* {valueRef.current > 0.7 ? ( */}
        <Animated.View
          style={[
            styles.signupContainer,
            {
              opacity: opacityAnim,
              transform: [{ translateY: transitionAnim }],
            },
          ]}
        >
          <SignUpText />
          <Icon name="arrow-forward" size={24} color="white" />
        </Animated.View>
        {/* ) : ( */}
        <IconPressable
          style={[
            styles.icon,
            {
              opacity: iconOpacityAnim,
              transform: [{ translateY: iconTransitionAnim }],
            },
          ]}
          name="arrow-forward-ios"
          size={24}
          color="white"
        />
        {/* )} */}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    backgroundColor: 'rgb(21, 32, 54)',
    overflow: 'hidden',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  icon: {
    position: 'absolute',
    alignSelf: 'center',
  },
});

const SignUpText = styled.Text.attrs(p => ({
  children: 'Sign Up', ...p 
}))`
  font-size: 18px;
  fontFamily: SFProDisplay-Medium;
  color: white;
`

export default NextButtonArrow;
