# MediaSFU Flutter SpaceTek Advanced Guide

This advanced guide builds on the **SpacesTek Final** setup, introducing custom video components, enhanced participant management, and performance optimization techniques using the **MediaSFU Flutter SDK**. By leveraging these advanced features, you can create dynamic multimedia applications with robust video capabilities and seamless user experiences.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Enhancements from Final Setup](#enhancements-from-final-setup)
4. [Integration Steps](#integration-steps)
   - [Enhance the MediaSFU Service](#enhance-the-mediasfu-service)
   - [Implement Custom Video Components](#implement-custom-video-components)
   - [Add Custom Media Grid](#add-custom-media-grid)
5. [Optimization and Testing](#optimization-and-testing)
6. [Future Enhancements](#future-enhancements)
  - [Detailed Integration Steps](./TransAdvanced.md)
7. [Conclusion](#conclusion)

---

## Overview

The **SpacesTek Advanced Guide** takes your Flutter application to the next level by integrating advanced video functionalities, custom media rendering, and optimized participant management. This guide introduces tailored components and scalable techniques to handle large participant counts and provide a superior user experience.

---

## Key Features

- **Dynamic Video Management**:
  - Toggle video streams and switch between cameras.
  - Render customized grids for video, audio, and mini-cards.

- **Advanced Participant Controls**:
  - Mute/unmute participants and manage participant lists.
  - Seamlessly remove users from active rooms.

- **Custom Media Rendering**:
  - Personalized video and audio card components with participant overlays.

- **Performance Optimizations**:
  - Lazy loading and efficient rendering to support large participant numbers.

---

## Enhancements from Final Setup

This advanced guide introduces:

1. **Custom Media Components**:
   - Develop `VideoCard`, `AudioCard`, and `VideoCardTransformer` components for tailored media rendering.

2. **Expanded Camera Controls**:
   - Support toggling, switching, and selecting specific camera devices.

3. **Dynamic Grid Layouts**:
   - Replace the default `addVideosGrid` function with custom layouts.

4. **Improved State Management**:
   - Maintain synchronization between the MediaSFU SDK and Flutter state for dynamic updates.

5. **Backend Integration Enhancements**:
   - Real-time synchronization of participant actions and room states.

---

## Integration Steps

### Enhance the MediaSFU Service

Enhance the `UseMediasfuSdkService` to include advanced video functionalities:

#### 1. Add Video Control Methods

Introduce methods to toggle video streams, switch cameras, and select specific devices.

```dart
Future<void> toggleVideo({
  required MediasfuParameters sourceParameters,
}) async {
  try {
    final options = ClickVideoOptions(parameters: sourceParameters);
    await clickVideo(options);
  } catch (e) {
    debugPrint("Error toggling video: $e");
  }
}

Future<void> switchCamera({
  required MediasfuParameters sourceParameters,
}) async {
  try {
    final options = SwitchVideoAltOptions(parameters: sourceParameters);
    await switchVideoAlt(options);
  } catch (e) {
    debugPrint("Error switching camera: $e");
  }
}
```

---

### Implement Custom Video Components

Develop `VideoCard` and `AudioCard` components for personalized participant media rendering.

#### 1. Create `VideoCard`

```dart
class VideoCard extends StatelessWidget {
  final MediaStream? videoStream;
  final String participantName;
  final bool isMuted;

  const VideoCard({
    required this.videoStream,
    required this.participantName,
    required this.isMuted,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        boxShadow: [BoxShadow(blurRadius: 6, color: Colors.black26)],
      ),
      child: Stack(
        children: [
          RTCVideoView(
            RTCVideoRenderer()..srcObject = videoStream,
            objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
          ),
          Positioned(
            bottom: 8,
            left: 8,
            child: Text(
              participantName,
              style: const TextStyle(color: Colors.white),
            ),
          ),
          if (isMuted)
            Positioned(
              top: 8,
              right: 8,
              child: Icon(Icons.mic_off, color: Colors.red),
            ),
        ],
      ),
    );
  }
}
```

#### 2. Create `AudioCard`

```dart
class AudioCard extends StatelessWidget {
  final String participantName;
  final bool isMuted;

  const AudioCard({
    required this.participantName,
    required this.isMuted,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(10),
        boxShadow: [BoxShadow(blurRadius: 6, color: Colors.black26)],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isMuted ? Icons.mic_off : Icons.mic,
            color: isMuted ? Colors.red : Colors.green,
          ),
          Text(participantName),
        ],
      ),
    );
  }
}
```

---

### Add Custom Media Grid

Replace the default `addVideosGrid` function to render tailored video and audio layouts.

```dart
Future<void> addVideosGrid(AddVideosGridOptions options) async {
  List<Widget> videoCards = options.mainGridStreams.map((stream) {
    return VideoCard(
      videoStream: stream.stream,
      participantName: stream.participant.name,
      isMuted: stream.participant.isMuted,
    );
  }).toList();

  List<Widget> audioCards = options.altGridStreams.map((stream) {
    return AudioCard(
      participantName: stream.participant.name,
      isMuted: stream.participant.isMuted,
    );
  }).toList();

  options.parameters.updateOtherGridStreams([videoCards + audioCards]);
}
```

---

## Optimization and Testing

### Performance Optimization

1. **Lazy Loading**:
   - Render only visible video streams to optimize performance.

2. **Efficient State Management**:
   - Use `ValueListenableBuilder` to minimize unnecessary re-renders.

---

### Comprehensive Testing

1. **Multi-Participant Scenarios**:
   - Simulate large participant counts to ensure scalability.

2. **Camera Controls**:
   - Verify switching and selecting cameras on devices with multiple inputs.

3. **Participant Management**:
   - Test muting, unmuting, and removing participants to confirm real-time updates.

---

## Future Enhancements

- **Virtual Backgrounds**:
  - Introduce real-time background replacement for participant video streams.

- **Screen Sharing**:
  - Allow participants to share their screens dynamically.

- **Breakout Rooms**:
  - Add sub-room functionalities for smaller group discussions.

---

## Conclusion

With the advanced integrations outlined in this guide, your Flutter application is equipped to handle complex video functionalities, large participant counts, and customized media rendering. These enhancements position your application as a scalable, multimedia communication platform. 

For a detailed explanation of the integration steps and example implementations, refer to the **[advanced transcript](./TransAdvanced.md)**

### **Next Steps**
- Explore MediaSFU's screen sharing and virtual background features.
- Optimize the application for deployment in large-scale environments.

*Happy coding with MediaSFU and SpacesTek Advanced! 🚀📱*