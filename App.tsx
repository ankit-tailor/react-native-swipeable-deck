import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { SlideInDown, SlideInUp } from "react-native-reanimated";
import { AnimatedButton, SwipeableCard } from "./components";

const tasks = [
  "Drink 5 glasses of water",
  "Read a book",
  "Go for a walk",
  "Eat a healthy meal",
  "Sleep for 8 hours",
];

export default function App() {
  const [todos, setTodos] = useState<any[]>([...tasks, ...tasks, ...tasks]);
  const [swipeDirection, setSwipeDirection] = useState<"LEFT" | "RIGHT" | "">(
    ""
  );

  const updateTodos = () => {
    setTodos(todos.slice(1));
  };

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
      }}
    >
      <SafeAreaView
        style={{
          backgroundColor: "#98B9D4",
        }}
      />
      <View style={styles.container}>
        <Text style={styles.heading}>Goals</Text>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: todos.length === 0 ? "100%" : "auto",
          }}
        >
          {todos.length === 0 ? (
            <Animated.Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#f1f1f1",
              }}
              entering={SlideInDown}
              exiting={SlideInUp}
            >
              Swiped all the cards! 🎉
            </Animated.Text>
          ) : (
            <SwipeableCard
              todos={todos}
              swipeDirection={swipeDirection}
              setSwipeDirection={setSwipeDirection}
            />
          )}
        </View>
        {todos.length > 0 ? (
          <View style={styles.ctaWrapper}>
            <AnimatedButton
              onPress={() => setSwipeDirection("LEFT")}
              _animatedWrapperStyle={[
                StyleSheet.absoluteFill,
                styles.animatedWrapper,
                {
                  top: -40,
                  left: -40,
                },
              ]}
              style={[
                {
                  alignItems: "flex-start",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="keyboard-backspace"
                size={36}
                color="#f1f1f1"
              />
              <Text style={styles.buttonText}>Save it later</Text>
            </AnimatedButton>
            <AnimatedButton
              onPress={() => setSwipeDirection("RIGHT")}
              _animatedWrapperStyle={[
                StyleSheet.absoluteFill,
                styles.animatedWrapper,
                {
                  top: -40,
                  left: 5,
                },
              ]}
              style={[
                {
                  alignItems: "flex-end",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="keyboard-backspace"
                size={36}
                style={{
                  transform: [{ rotateY: "180deg" }],
                }}
                color="#f1f1f1"
              />
              <Text style={styles.buttonText}>Complete</Text>
            </AnimatedButton>
          </View>
        ) : null}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#98B9D4",
    flex: 1,
  },
  buttonText: {
    color: "#f1f1f1",
    fontSize: 18,
    fontWeight: "bold",
  },
  animatedWrapper: {
    backgroundColor: "#fff",
    borderRadius: 999,
    height: 120,
    width: 120,
    opacity: 0.3,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f1f1f1",
    textAlign: "center",
    marginVertical: 32,
  },
  ctaWrapper: {
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 24,
    marginTop: 72,
  },
});
