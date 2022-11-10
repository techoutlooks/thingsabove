import React from "react";
import { TouchableWithoutFeedback, View } from "react-native";
import Animated, { useAnimatedRef, useSharedValue, useAnimatedStyle, useDerivedValue,
  withSpring, withTiming, runOnUI, measure} from "react-native-reanimated";
import styled from "styled-components/native"

import Chevron from "./Chevron";
import Item, { ListItem } from "./ListItem";
import Text from "../Text" 


export type List = { title: string, items: ListItem[] }
type ListProps = { list: List }

const List = ({ list }: ListProps) => {
  const aref = useAnimatedRef<View>();
  const open = useSharedValue(false);
  const progress = useDerivedValue(() =>
    open.value ? withSpring(1) : withTiming(0)
  );
  const height = useSharedValue(0);
  const headerStyle = useAnimatedStyle(() => ({
    borderBottomLeftRadius: progress.value === 0 ? 8 : 0,
    borderBottomRightRadius: progress.value === 0 ? 8 : 0,
  }));
  const style = useAnimatedStyle(() => ({
    height: height.value * progress.value + 1,
    opacity: progress.value === 0 ? 0 : 1,
  }));
  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          if (height.value === 0) {
            runOnUI(() => {
              "worklet";
              height.value = measure(aref).height;
            })();
          }
          open.value = !open.value;
        }}
      >
        <AnimatedHeader style={headerStyle}>
          <Title>{list.title}</Title>
          <Chevron {...{ progress }} />
        </AnimatedHeader>
      </TouchableWithoutFeedback>

      <AnimatedList style={style}>
        <View ref={aref}
          onLayout={({nativeEvent: {layout: {height: h} }}) => console.log({ h })}
        >
          {list.items?.map((item, key) => (
            <Item
              key={key}
              isLast={key === list.items.length - 1}
              {...{ item }}
            />
          ))}
        </View>
      </AnimatedList>
    </>
  );
};

export default List;



const Title = styled(Text)`
  font-size: 16;
  font-weight: bold;
`
const AnimatedHeader = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 16;
  padding: 16;
  borderTopLeftRadius: 8;
  borderTopRightRadius: 8;
  background-color: white;
`
const AnimatedList = styled(Animated.View)`
  overflow: hidden;
`