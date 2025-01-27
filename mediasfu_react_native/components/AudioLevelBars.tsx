import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

interface AudioLevelBarsProps {
  audioLevel: number;
}

const AudioLevelBars: React.FC<AudioLevelBarsProps> = ({ audioLevel }) => {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    // Smoothly animate the audio level
    const animation = setInterval(() => {
      setLevel((prev) => {
        if (prev === audioLevel) {return prev;}
        return prev < audioLevel
          ? Math.min(prev + 5, audioLevel) // Increment
          : Math.max(prev - 5, audioLevel); // Decrement
      });
    }, 50);

    return () => clearInterval(animation);
  }, [audioLevel]);

  // Normalize the audio level to determine the number of filled bars
  const normalizedLevel = Math.max(0, ((level - 127.5) / (275 - 127.5)) * 10); // Map to 0–10 bars
  const bars = Array.from({ length: 10 }, (_, i) => i < normalizedLevel);

  return (
    <View style={styles.audioBarsContainer}>
      {bars.map((filled, index) => (
        <View
          key={index}
          style={[
            styles.audioBar,
            filled ? { backgroundColor: `rgb(${255 - index * 20}, ${index * 20}, 0)` } : { backgroundColor: '#ccc' },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  audioBarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    height: 10, // Total height for the bars
    marginBottom: 4,
  },
  audioBar: {
    width: 4,
    height: '100%',
    borderRadius: 2,
  },
});

export default AudioLevelBars;
