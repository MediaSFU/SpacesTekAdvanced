# MediaSFU React Native (Expo) SpaceTek Advanced Guide

This advanced guide builds on the **SpacesTek Final** setup, introducing custom video components, expanded camera controls, and optimization techniques using the **MediaSFU React Native Expo SDK**. By leveraging these advanced features, you can elevate your application's communication capabilities with enhanced video handling and user experience.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Enhancements from Final Setup](#enhancements-from-final-setup)
4. [Integration Steps](#integration-steps)
   - [Expand `useAudioVideoSDK`](#expand-useaudiovideosdk)
   - [Implement Advanced Video Grids](#implement-advanced-video-grids)
   - [Customize Video Components](#customize-video-components)
   - [Direct MediaStream Rendering](#direct-mediastream-rendering)
5. [Optimization and Testing](#optimization-and-testing)
6. [Future Enhancements](#future-enhancements)
    - [Detailed Integration Steps](./TransAdvanced.md)
7. [Conclusion](#conclusion)

---

## Overview

This guide transitions from the final SpaceTek implementation to an advanced, customizable video communication platform. It focuses on building custom video components, managing MediaStreams directly, and optimizing performance for multi-participant scenarios.

---

## Key Features

- **Enhanced Video Grids**:
  - Dynamic layouts for main and mini video grids.
  - Custom styling and overlays for video elements.

- **Advanced Camera Controls**:
  - Toggle video streams, switch cameras, and select specific devices.

- **Custom Media Components**:
  - Create tailored components for rendering video streams and participant interactions.

- **Performance Optimizations**:
  - Lazy loading and efficient rendering to handle large participant counts.

- **Cross-Platform Compatibility**:
  - Ensure functionality across Android, iOS, and Web.

---

## Enhancements from Final Setup

This advanced guide introduces:

1. **Custom Video Grids**:
   - Custom `VideoCard` and `addVideosGrid` components for video rendering.

2. **Expanded Camera Controls**:
   - Support for toggling, switching, and selecting cameras.

3. **Direct MediaStream Handling**:
   - Improved MediaStream rendering for precise video control.

4. **Custom MediaSFU Component**:
   - Bespoke `MediasfuGenericAlt` for advanced media handling.

5. **State Synchronization**:
   - Seamless updates between MediaSFU parameters and React Native state.

---

## Integration Steps

### Expand `useAudioVideoSDK`

Enhance the `useAudioVideoSDK` hook with video-specific functionalities.

#### 1. Add Video Control Methods

Implement methods to toggle video, switch cameras, and select devices.

```tsx
export const toggleVideo = async ({ sourceParameters }: UseAudioVideoSDKProps): Promise<void> => {
  if (Object.keys(sourceParameters).length > 0) {
    await clickVideo({ parameters: sourceParameters.getUpdatedAllParams() });
  }
};
```

---

### Implement Advanced Video Grids

Replace default layouts with custom video grids.

#### 1. Define `addVideosGrid`

Render custom video elements using the `addVideosGrid` function.

```tsx
export const addVideosGrid = ({ participants, streams }: AddVideosGridProps) => {
  return participants.map((participant) => {
    const matchedStream = streams.find((s) => s.producerId === participant.videoID)?.stream;

    return (
      <VideoCard
        key={`video-${participant.id}`}
        videoStream={matchedStream}
        participant={participant}
      />
    );
  });
};
```

#### 2. Create `VideoCard` Component

```tsx
const VideoCard: React.FC<VideoCardOptions> = ({ videoStream, participant }) => {
  return (
    <View style={styles.videoCard}>
      <RTCView streamURL={videoStream?.toURL()} style={styles.videoStream} />
      <Text>{participant.name}</Text>
    </View>
  );
};
```

---

### Customize Video Components

Build custom components for enhanced video rendering and control.

#### 1. Integrate Camera Controls

Add buttons for toggling video and switching cameras.

```tsx
<TouchableOpacity
  style={styles.toggleVideoBtn}
  onPress={() => toggleVideo({ sourceParameters: sourceParameters.current })}
>
  <Text>Toggle Video</Text>
</TouchableOpacity>
<TouchableOpacity
  style={styles.switchCameraBtn}
  onPress={() => switchCamera({ sourceParameters: sourceParameters.current })}
>
  <Text>Switch Camera</Text>
</TouchableOpacity>
```

---

### Direct MediaStream Rendering

Gain finer control over video rendering.

#### 1. Update `ParticipantCard`

Modify the `ParticipantCard` component to handle video streams.

```tsx
const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, video }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.srcObject = video;
    }
  }, [video]);

  return <video ref={videoRef} autoPlay muted />;
};
```

---

## Optimization and Testing

### Performance Optimization

1. **Lazy Loading**:
   - Dynamically load video streams based on the user's viewport.

2. **Efficient Rendering**:
   - Use memoization (`useMemo`, `React.memo`) to minimize unnecessary re-renders.

---

### Comprehensive Testing

1. **Multi-Participant Scenarios**:
   - Simulate sessions with multiple participants to ensure scalability.

2. **Accessibility**:
   - Add ARIA labels and keyboard navigation support.

3. **Cross-Platform Testing**:
   - Test functionality on Android, iOS, and Web.

---

## Future Enhancements

- **Virtual Backgrounds**:
  - Implement real-time background replacement using MediaSFU APIs.

- **Screen Sharing**:
  - Enable participants to share screens dynamically.

- **Breakout Rooms**:
  - Add sub-room functionalities for focused discussions.

---

## Conclusion

With these advanced integrations, your React Native Expo application is equipped to handle dynamic video grids, advanced camera controls, and high-participant sessions. These enhancements provide a scalable, video-centric communication platform with seamless user experiences.

For a detailed explanation of the integration steps and example implementations, refer to the **[advanced transcript](./TransAdvanced.md)**.

**Next Steps**:
- Explore advanced MediaSFU APIs for screen sharing and custom stream handling.
- Optimize the application for large-scale deployments.

*Happy coding with MediaSFU and SpacesTek! 🚀📱*