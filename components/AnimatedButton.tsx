import React from "react";
import { Pressable, PressableProps, StyleSheet, ViewProps } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type IAnimatedButtonProps = Omit<PressableProps, "children"> & {
  children?: React.ReactNode;
  _animatedWrapperStyle?: ViewProps["style"];
};

export const AnimatedButton = ({
  children,
  style,
  _animatedWrapperStyle,
  ...props
}: IAnimatedButtonProps) => {
  const scaleValue = useSharedValue(0);
  const opacityValue = useSharedValue(0);

  const circleStyleAnimation =
    (
      scaleValue: Animated.SharedValue<number>,
      opacityValue: Animated.SharedValue<number>
    ) =>
    () => {
      "worklet";
      return {
        transform: [
          {
            scale: interpolate(
              scaleValue.value,
              [0, 1],
              [0, 1],
              Extrapolate.CLAMP
            ),
          },
        ],
        opacity: interpolate(
          opacityValue.value,
          [0, 1],
          [0, 1],
          Extrapolate.CLAMP
        ),
      };
    };

  const animatedStyles = useAnimatedStyle(
    circleStyleAnimation(scaleValue, opacityValue)
  );

  const handlePressIn =
    (
      scaleValue: Animated.SharedValue<number>,
      opacityValue: Animated.SharedValue<number>
    ) =>
    () => {
      opacityValue.value = withTiming(0.3);
      scaleValue.value = withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.98, {}, (isCompleted) => {
          if (isCompleted) {
            opacityValue.value = withTiming(
              0,
              { duration: 200 },
              (isCompleted) => {
                if (isCompleted) {
                  scaleValue.value = 0;
                  opacityValue.value = 0;
                }
              }
            );
          }
        })
      );
    };

  const pressableStyles = Array.isArray(style)
    ? [styles.container, ...style]
    : [styles.container, style];

  return (
    <Pressable
      style={StyleSheet.flatten(pressableStyles)}
      onPressIn={handlePressIn(scaleValue, opacityValue)}
      {...props}
    >
      <Animated.View style={[_animatedWrapperStyle, animatedStyles]} />
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
});
