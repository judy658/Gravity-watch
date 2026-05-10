import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import Animated, { useAnimatedProps, useDerivedValue, SharedValue } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedTimeTextProps {
  millis: SharedValue<number> | any;
  style?: any;
}

export const AnimatedTimeText: React.FC<AnimatedTimeTextProps> = ({ millis, style }) => {
  const animatedProps = useAnimatedProps(() => {
    const totalSeconds = millis.value / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    return {
      text: timeStr,
    } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value=""
      style={[styles.text, style]}
      animatedProps={animatedProps}
    />
  );
};

const styles = StyleSheet.create({
  text: {
    padding: 0,
    margin: 0,
    color: '#fff',
    fontSize: 11,
    opacity: 0.5,
  },
});
