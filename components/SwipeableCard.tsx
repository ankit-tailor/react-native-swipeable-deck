import React, { useState } from "react";
import { Dimensions, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface ISwipeableCardProps {
  swipeDirection: "LEFT" | "RIGHT" | "";
  setSwipeDirection: (direction: "LEFT" | "RIGHT" | "") => void;
  todos: any;
}

const windowWidth = Dimensions.get("window").width;
const LAST_SWIPABLE_POINT = 120;
const DURATION = 700;
const DELAY = 200;

export const SwipeableCard = ({
  swipeDirection,
  setSwipeDirection,
  todos,
}: ISwipeableCardProps) => {
  const swipeOffset = useSharedValue(0);
  const initialAnimation = useSharedValue(0);
  const cardScale = useSharedValue(0);

  const [currentTodo, setCurrentTodo] = useState(0);
  const [nextTodo, setNextTodo] = useState(currentTodo + 1);

  const currentTodoData = todos[currentTodo];
  const nextTodoData = todos[nextTodo];

  const resetAnimations = () => {
    "worklet";
    initialAnimation.value = 0;
    swipeOffset.value = 0;
    cardScale.value = 0;

    cardScale.value = withRepeat(
      withTiming(1, {
        duration: DURATION,
      }),
      1,
      false
    );
    initialAnimation.value = withRepeat(
      withTiming(1, {
        duration: DURATION,
      }),
      1,
      false
    );
  };

  const onAnimationComplete = (isFinished?: boolean) => {
    "worklet";
    if (isFinished) {
      runOnJS(setCurrentTodo)(nextTodo);
      runOnJS(setSwipeDirection)("");
    }
  };

  const pan = Gesture.Pan()
    .onTouchesDown(() => {
      cardScale.value = withTiming(0.9);
    })
    .onTouchesUp(() => {
      cardScale.value = withTiming(1);
    })
    .onChange((event) => {
      const translationX = event.translationX;
      const velocityX = event.velocityX;

      if (Math.abs(velocityX) > 0) {
        swipeOffset.value = translationX;
      }
    })
    .onFinalize((event) => {
      const absX = event.absoluteX;
      const velocityX = event.velocityX;

      if (Math.abs(velocityX) > 0) {
        if (
          absX <= LAST_SWIPABLE_POINT ||
          Math.abs(windowWidth - absX) <= LAST_SWIPABLE_POINT
        ) {
          if (absX <= LAST_SWIPABLE_POINT) {
            swipeOffset.value = withTiming(
              -windowWidth,
              { duration: DURATION },
              onAnimationComplete
            );
          } else if (Math.abs(windowWidth - absX) <= LAST_SWIPABLE_POINT) {
            swipeOffset.value = withTiming(
              windowWidth,
              { duration: DURATION },
              onAnimationComplete
            );
          }
        } else {
          swipeOffset.value = withTiming(0);
        }
      }
    });

  React.useEffect(() => {
    resetAnimations();
    setNextTodo((prev) => prev + 1);
  }, [currentTodoData]);

  React.useEffect(() => {
    if (swipeDirection === "LEFT") {
      swipeOffset.value = withSequence(
        withTiming(-windowWidth / 3, { duration: DURATION }),
        withDelay(
          DELAY,
          withTiming(-windowWidth, { duration: DURATION }, onAnimationComplete)
        )
      );
    } else if (swipeDirection === "RIGHT") {
      swipeOffset.value = withSequence(
        withTiming(windowWidth / 4, { duration: DURATION }),
        withDelay(
          DELAY,
          withTiming(windowWidth, { duration: DURATION }, onAnimationComplete)
        )
      );
    }
  }, [swipeDirection]);

  const swipeableCardStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: swipeOffset.value,
        },
        {
          rotate: `${interpolate(
            swipeOffset.value,
            [0, LAST_SWIPABLE_POINT],
            [0, 10],
            Extrapolate.EXTEND
          )}deg`,
        },
        {
          scale: interpolate(
            cardScale.value,
            [0, 1],
            [0.86, 1],
            Extrapolate.CLAMP
          ),
        },
        {
          translateY: interpolate(
            initialAnimation.value,
            [0, 1],
            [-9, 30],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        initialAnimation.value,
        [0, 1],
        [0.9, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  const queuedCardStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            Math.abs(swipeOffset.value),
            [0, windowWidth],
            [0.8, 0.85],
            Extrapolate.CLAMP
          ),
        },
        {
          translateY: interpolate(
            Math.abs(swipeOffset.value),
            [0, windowWidth],
            [-16, -9],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        Math.abs(swipeOffset.value),
        [0, windowWidth],
        [0.5, 0.9],
        Extrapolate.CLAMP
      ),
    };
  });

  return (
    <>
      {nextTodoData ? (
        <Animated.View
          style={[styles.card, { position: "absolute" }, queuedCardStyles]}
        >
          <Text style={styles.text}>{nextTodoData}</Text>
        </Animated.View>
      ) : null}

      {currentTodoData ? (
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.card, swipeableCardStyles]}>
            <Text style={styles.text}>{currentTodoData}</Text>
          </Animated.View>
        </GestureDetector>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 300,
    width: 300,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5C98AA",
  },
});
