import React, { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeInUp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const width = Dimensions.get("window").width;
const LAST_SWIPABLE_POINT = 120;
const DURATION = 500;

const Card = ({ style, children, updateArr, index, swipe, setSwipe }: any) => {
  const offset = useSharedValue(0);
  const absoluteX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((event) => {
      if (index !== 0) return;

      const absX = event.absoluteX;
      const translationX = event.translationX;

      offset.value = translationX;
      absoluteX.value = absX;
    })
    .onFinalize((event) => {
      if (index !== 0) return;
      const absX = event.absoluteX;

      absoluteX.value = absX;

      if (
        absoluteX.value <= LAST_SWIPABLE_POINT ||
        Math.abs(width - absoluteX.value) <= LAST_SWIPABLE_POINT
      ) {
        if (absoluteX.value <= LAST_SWIPABLE_POINT) {
          offset.value = withTiming(-width, {}, () => {
            offset.value = withTiming(0);
            runOnJS(updateArr)();
          });
        } else if (Math.abs(width - absoluteX.value) <= LAST_SWIPABLE_POINT) {
          offset.value = withTiming(width, {}, () => {
            offset.value = withTiming(0);
            runOnJS(updateArr)();
          });
        }
      } else {
        offset.value = withTiming(0);
      }
    });

  React.useEffect(() => {
    if (swipe === "LEFT") {
      offset.value = withSequence(
        withTiming(-width / 3, { duration: DURATION }),
        withDelay(
          100,
          withTiming(-width, { duration: DURATION }, () => {
            offset.value = withTiming(0);
            runOnJS(setSwipe)("");
            runOnJS(updateArr)();
          })
        )
      );
    } else if (swipe === "RIGHT") {
      offset.value = withSequence(
        withTiming(width / 5, { duration: DURATION }),
        withDelay(
          100,
          withTiming(width, { duration: DURATION }, () => {
            offset.value = withTiming(0);
            runOnJS(setSwipe)("");
            runOnJS(updateArr)();
          })
        )
      );
    }
  }, [swipe]);

  const styles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: offset.value,
        },
        {
          scale: 1 - index * 0.15,
        },
        {
          rotate:
            index === 0
              ? `${interpolate(
                  offset.value,
                  [0, LAST_SWIPABLE_POINT],
                  [0, 8]
                )}deg`
              : "0deg",
        },
        {
          translateY:
            index === 0
              ? interpolate(offset.value, [0, LAST_SWIPABLE_POINT], [0, -20])
              : 0,
        },
      ],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        // entering={FadeInUp}
        // exiting={FadeInDown}
        style={[
          {
            height: 300,
            width: 300,
            borderRadius: 20,
            position: "absolute",
            transformOrigin: "bottom",
            opacity: 1 - index * 0.5,
          },
          style,
          styles,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

export default function App() {
  const [arr, setArr] = useState(["red", "blue", "pink", "yellow", "teal"]);
  const [swipe, setSwipe] = useState("");

  const updateArr = () => {
    const firsrElement = arr[0];
    const newArr = arr.slice(1);
    newArr.push(firsrElement);
    setArr(newArr);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <View
          style={{
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "red",
            flex: 1,
          }}
        >
          {arr.map((ele, index) => (
            <Card
              key={ele}
              updateArr={updateArr}
              index={index}
              swipe={index === 0 ? swipe : ""}
              setSwipe={setSwipe}
              style={{
                zIndex: arr.length - index,
                bottom: index === 0 ? index * 30 : index * 50,
                backgroundColor: "#fff",
                display: index > 1 ? "none" : "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#5C98AA",
                }}
              >
                Drink 5 glass of water a day.
              </Text>
            </Card>
          ))}
        </View>
      </View>
      <View
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
          width: "100%",
          paddingHorizontal: 32,
          marginTop: 32,
          flex: 1,
        }}
      >
        <Pressable
          style={{
            paddingHorizontal: 16,
            backgroundColor: "#f1f1f1",
          }}
          onPress={() => setSwipe("LEFT")}
        >
          <Text>Previous</Text>
        </Pressable>
        <Pressable
          style={{
            paddingHorizontal: 16,
            backgroundColor: "#f1f1f1",
          }}
          onPress={() => setSwipe("RIGHT")}
        >
          <Text>Next</Text>
        </Pressable>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#98B9D4",
  },
});
