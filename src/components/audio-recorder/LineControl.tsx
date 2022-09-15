import React, { useRef } from "react";
import { View, ViewProps, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedRef,
  useAnimatedStyle,
} from "react-native-reanimated";
import styled, { css } from "styled-components/native";

type Props = {
  percentage: number;
  rowDirection?: boolean;
} & ViewProps;

const LineControl = styled(({ rowDirection, percentage, ...props }: Props) => {
  const ref = useRef();

  return (
    <View {...{ ref, ...props }}>
      <LineControlHead {...{ rowDirection, percentage }} />
    </View>
  );
})`
  ${(p) => `

    height: 8px;
    border-radius: 5px;
    background-color: ${p.theme.colors.mutedFg};
    width: 100%;
    margin: 0 5px;

  `}
`;

LineControl.defaultProps = {
  percentage: 0,
  rowDirection: true,
};

const LineControlHead = styled.View.attrs<Props>({
  rowDirection: true,
})`
  ${(p) => `  
    background-color: ${p.theme.colors.fg};
    height: 8px;
    border-radius: 5px;

  `}

  ${({ rowDirection, percentage }: Props) =>
    `${rowDirection ? "width" : "height"}: ${
      percentage <= 1 ? percentage * 100 : percentage
    }%;`}
`;

export default LineControl;
