import React from "react";
import { Dimensions, Text } from "react-native";
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

const width = Dimensions.get("window").width;
const LAST_SWIPABLE_POINT = 120;
const DURATION = 600;

export const SwipeableCard = ({
  updateArr,
  cardElements,
  swipe,
  setSwipe,
}: any) => {
  const offset = useSharedValue(0);
  const initialAniamtion = useSharedValue(0);
  const absoluteX = useSharedValue(0);
  const cardScale = useSharedValue(0);

  const resetAnimations = () => {
    "worklet";
    initialAniamtion.value = 0;
    cardScale.value = 0;
    initialAniamtion.value = withRepeat(
      withTiming(1, {
        duration: DURATION,
      }),
      1,
      false
    );
    cardScale.value = withRepeat(
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
      runOnJS(setSwipe)("");
      runOnJS(updateArr)();
      offset.value = 0;
      resetAnimations();
    }
  };

  const pan = Gesture.Pan()
    .onTouchesDown(() => {
      cardScale.value = withTiming(0.8);
    })
    .onTouchesUp(() => {
      cardScale.value = withTiming(1);
    })
    .onChange((event) => {
      const absX = event.absoluteX;
      const translationX = event.translationX;
      const velocityX = event.velocityX;

      if (Math.abs(velocityX) > 0) {
        offset.value = translationX;
        absoluteX.value = absX;
      }
    })
    .onFinalize((event) => {
      const absX = event.absoluteX;
      const velocityX = event.velocityX;

      if (Math.abs(velocityX) > 0) {
        absoluteX.value = absX;

        if (
          absoluteX.value <= LAST_SWIPABLE_POINT ||
          Math.abs(width - absoluteX.value) <= LAST_SWIPABLE_POINT
        ) {
          if (absoluteX.value <= LAST_SWIPABLE_POINT) {
            offset.value = withTiming(
              -width,
              { duration: DURATION },
              onAnimationComplete
            );
          } else if (Math.abs(width - absoluteX.value) <= LAST_SWIPABLE_POINT) {
            offset.value = withTiming(
              width,
              { duration: DURATION },
              onAnimationComplete
            );
          }
        } else {
          offset.value = withTiming(0);
        }
      }
    });

  React.useEffect(() => {
    resetAnimations();
  }, []);

  React.useEffect(() => {
    offset.value = 0;
    if (swipe === "LEFT") {
      offset.value = withSequence(
        withTiming(-width / 3, { duration: DURATION }),
        withDelay(
          100,
          withTiming(-width, { duration: DURATION }, onAnimationComplete)
        )
      );
    } else if (swipe === "RIGHT") {
      offset.value = withSequence(
        withTiming(width / 4, { duration: DURATION }),
        withDelay(
          100,
          withTiming(width, { duration: DURATION }, onAnimationComplete)
        )
      );
    }
  }, [swipe, cardElements]);

  const swipeableCardStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: offset.value,
        },
        {
          rotate: `${interpolate(
            offset.value,
            [0, LAST_SWIPABLE_POINT],
            [0, 8]
          )}deg`,
        },
        {
          scale: interpolate(
            cardScale.value,
            [0, 1],
            [0.91, 1],
            Extrapolate.CLAMP
          ),
        },
        {
          translateY: interpolate(
            initialAniamtion.value,
            [0, 1],
            [-16, 30],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        initialAniamtion.value,
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
            Math.abs(offset.value),
            [-width / 2, width / 2],
            [0.8, 0.9],
            Extrapolate.CLAMP
          ),
        },
        {
          translateY: interpolate(
            initialAniamtion.value,
            [0, 1],
            [-16, -9],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        Math.abs(offset.value),
        [-width / 2, width / 2],
        [0.5, 0.9],
        Extrapolate.CLAMP
      ),
    };
  });

  return (
    <>
      {cardElements?.[1] ? (
        <Animated.View
          style={[
            {
              height: 300,
              width: 300,
              borderRadius: 20,
            },
            {
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
            },
            queuedCardStyles,
          ]}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#5C98AA",
            }}
          >
            {cardElements[1]}
          </Text>
        </Animated.View>
      ) : null}
      {cardElements?.[0] ? (
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                zIndex: 999,
                height: 300,
                width: 300,
                borderRadius: 20,
              },
              {
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
              },
              swipeableCardStyles,
            ]}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#5C98AA",
              }}
            >
              {cardElements[0]}
            </Text>
          </Animated.View>
        </GestureDetector>
      ) : null}
    </>
  );
};
