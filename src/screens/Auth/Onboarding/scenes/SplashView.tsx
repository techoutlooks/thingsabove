import React from 'react';
import { StyleSheet, View, Text, Image, Pressable, Animated, useWindowDimensions } from 'react-native';
import * as appImages from '../../../../../assets';
import { isAndroid } from "@/lib/utils"


interface Props {
  onNextClick: () => void;
  animationController: React.MutableRefObject<Animated.Value>;
}

const SplashView: React.FC<Props> = ({ onNextClick, animationController }) => {
  const window = useWindowDimensions();

  const splashTranslateY = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.8],
    outputRange: [0, -window.height, -window.height],
  });

  const introImageData = Image.resolveAssetSource(appImages.onboarding.intro_image);

  return (
    <Animated.View style={{ transform: [{ translateY: splashTranslateY }] }}>
      <Image
        style={{
          width: window.width,
          height: undefined,
          aspectRatio: introImageData
            ? introImageData.width / introImageData.height
            : 357 / 470,
        }}
        source={appImages.onboarding.intro_image}
      />
      <Text style={styles.title}>Intro</Text>
      <Text style={styles.subtitle}>
      Experience a lasting joy through prayer and meaningful relationships.

      </Text>
      <View style={{ height: 48 }} />
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: !isAndroid() && pressed ? 0.6 : 1 },
          ]}
          android_ripple={{ color: 'powderblue' }}
          onPress={() => onNextClick()}
        >
          <Text style={styles.buttonText}>Let's begin</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    textAlign: 'center',
    fontFamily: 'SFProDisplay-Bold',
    paddingVertical: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: 'SFProDisplay-Regular',
    paddingHorizontal: 64,
  },
  buttonContainer: {
    marginBottom: 16,
    borderRadius: 38,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  button: {
    height: 58,
    backgroundColor: 'rgb(21, 32, 54)',
    paddingVertical: 16,
    paddingHorizontal: 56,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    
  },
});

export default SplashView;
