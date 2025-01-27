# MediaSFU React Native (CLI) SpaceTek Advanced Guide

This **React Native CLI** guide extends the **SpacesTek Final** application, introducing advanced video handling, participant controls, and performance optimizations. By leveraging the full capabilities of the **MediaSFU React Native CLI SDK**, this guide ensures your application is scalable, media-rich, and responsive.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Enhancements from Final Setup](#enhancements-from-final-setup)
4. [Integration Steps](#integration-steps)
   - [Expand `useAudioVideoSDK`](#expand-useaudiovideosdk)
   - [Custom Video Components](#custom-video-components)
   - [Dynamic Media Grids](#dynamic-media-grids)
   - [Direct MediaStream Rendering](#direct-mediastream-rendering)
5. [Performance Optimization and Testing](#performance-optimization-and-testing)
6. [Important Notes](#important-notes)
7. [Detailed Integration Steps](../mediasfu_react_native_expo/TransAdvanced.md)
8. [Conclusion](#conclusion)

---

## Overview

This advanced guide provides techniques to elevate your SpacesTek application with enhanced video functionalities, custom rendering, and real-time controls. Designed for React Native CLI projects, it ensures cross-platform compatibility and optimal performance.

---

## Key Features

- **Advanced Video Handling**:
  - Dynamic toggling of video streams and switching cameras.
  - Support for multiple video inputs.

- **Participant Management**:
  - Host-level controls for managing participants, including muting, removing, and banning.

- **Custom Media Grids**:
  - Flexible grid layouts for rendering dynamic media elements.

- **Performance Optimizations**:
  - Lazy loading, efficient resource usage, and responsive UI.

---

## Enhancements from Final Setup

1. **Custom Components**:
   - `VideoCard` and `MediasfuGenericAlt` for tailored media rendering.

2. **Dynamic Media Handling**:
   - Real-time updates for video toggling and participant management.

3. **State Synchronization**:
   - Improved state handling for seamless media interactions.

4. **Cross-Platform Support**:
   - Compatibility with iOS, Android, and H264 rendering considerations.

---

## Integration Steps

### Expand `useAudioVideoSDK`

Enhance the `useAudioVideoSDK` hook with advanced video functionalities.

#### Add Video Control Methods

1. **Toggle Video**:
   ```tsx
   export const toggleVideo = async ({ sourceParameters }: UseAudioVideoSDKProps): Promise<void> => {
       if (Object.keys(sourceParameters).length > 0) {
           await clickVideo({ parameters: sourceParameters.getUpdatedAllParams() });
       }
   };
   ```

2. **Switch Camera**:
   ```tsx
   export const switchCamera = async ({ sourceParameters }: UseAudioVideoSDKProps): Promise<void> => {
       if (Object.keys(sourceParameters).length > 0) {
           await switchVideoAlt({ parameters: sourceParameters.getUpdatedAllParams() });
       }
   };
   ```

3. **Select Specific Camera**:
   ```tsx
   export const selectCamera = async ({ sourceParameters, deviceId }: UseAudioVideoSDKProps): Promise<void> => {
       if (Object.keys(sourceParameters).length > 0) {
           await switchVideo({
               parameters: sourceParameters.getUpdatedAllParams(),
               videoPreference: deviceId!,
           });
       }
   };
   ```

---

### Custom Video Components

Create a `VideoCard` component for enhanced video rendering.

**File**: `src/components/custom/VideoCard.tsx`

```tsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { RTCView, MediaStream } from 'mediasfu-reactnative';

interface VideoCardProps {
  name: string;
  videoStream?: MediaStream;
  muted?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ name, videoStream, muted }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  return (
    <View style={styles.card}>
      <RTCView streamURL={videoStream?.toURL()} style={styles.video} />
      <Text style={styles.name}>{name}</Text>
      {muted && <Text style={styles.muted}>🔇</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { margin: 8, padding: 4, backgroundColor: '#eee', borderRadius: 8 },
  video: { width: 120, height: 120, borderRadius: 8 },
  name: { marginTop: 4, textAlign: 'center', fontSize: 14 },
  muted: { color: 'red', textAlign: 'center' },
});

export default VideoCard;
```

---

### Dynamic Media Grids

Replace default layouts with a flexible grid for rendering video elements.

**File**: `src/screens/SpaceDetails.tsx`

```tsx
import VideoCard from '../components/custom/VideoCard';

<View style={styles.grid}>
  {participants.map((participant, index) => (
    <VideoCard
      key={index}
      name={participant.name}
      videoStream={participant.videoStream}
      muted={participant.muted}
    />
  ))}
</View>;
```

---

### Direct MediaStream Rendering

Enhance the `ParticipantCard` component to manage MediaStreams directly.

1. **Modify Props**:
   ```tsx
   interface ParticipantCardProps {
       name: string;
       videoStream?: MediaStream;
   }
   ```

2. **Render Video**:
   ```tsx
   <RTCView streamURL={videoStream?.toURL()} style={styles.video} />;
   ```

---

## Performance Optimization and Testing

### Optimization Techniques

1. **Lazy Loading**:
   - Dynamically load video streams to reduce initial load times.

2. **Efficient State Updates**:
   - Use `React.memo` and `useCallback` to minimize unnecessary re-renders.

3. **Responsive Layouts**:
   - Utilize `Flexbox` for adaptive grid designs.

---

### Comprehensive Testing

1. **Multi-Participant Scenarios**:
   - Simulate multiple participants using devices or emulators.

2. **Cross-Platform Validation**:
   - Ensure compatibility with iOS, Android, and web platforms.

3. **Edge Cases**:
   - Test network disruptions and participant removal scenarios.

---

## Important Notes

1. **H264 Video on Android Emulators**:
   - **Emulator Limitation**: Android emulators often fail to render H264 video.
   - **Solution**:
     - Comment out H264 in the MediaSFU server configuration or use a physical device.

2. **Expo Transcript Reference**:
   - Except for navigation and fonts, this advanced setup aligns with the **Expo Transcript**.
   - Refer to the **[Expo Transcript](../mediasfu_react_native_expo/TransAdvanced.md)** for detailed integration steps.

---

## Conclusion

This advanced guide enhances your SpacesTek application with cutting-edge video functionalities, performance optimizations, and cross-platform support. By following these steps, you can build scalable, media-rich communication solutions with **MediaSFU**.

**Next Steps**:
- Implement virtual backgrounds and breakout rooms.
- Optimize for 100+ concurrent participants.

*Happy coding with MediaSFU and SpacesTek! 🚀📱*