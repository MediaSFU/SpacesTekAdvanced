# MediaSFU Angular SpaceTek Advanced Application

This **Angular** project builds upon the **SpacesTek Final** setup, introducing advanced video functionalities, participant management, and media rendering customization. By leveraging the **MediaSFU Angular SDK**, this advanced iteration enhances communication capabilities with tailored video grids, real-time media transformations, and robust state management.

---

## Table of Contents

1. [Overview](#overview)
2. [From Final to Advanced](#from-final-to-advanced)
3. [Key Features](#key-features)
4. [Integration Steps](#integration-steps)
5. [Key Components](#key-components)
6. [Important Notes](#important-notes)
7. [Detailed Integration Steps](./TransAdvanced.md)
8. [Final Notes](#final-notes)

---

## Overview

The **SpacesTek Advanced Application** leverages the `mediasfu-angular` SDK to integrate robust video functionalities into an Angular project. Building on the final setup, this iteration focuses on enhancing video-centric features, including:

- Rendering dynamic grids for participant video streams.
- Transforming and customizing media data for a tailored UI.
- Supporting real-time media control, such as toggling video, switching cameras, and managing participants.

---

## From Final to Advanced

The transition from **SpacesTek Final** to **SpacesTek Advanced** includes significant enhancements:

1. **Video Media Integration**:
   - Added support for rendering video grids with dynamic layouts.
   - Enhanced video controls, including toggling streams and switching cameras.

2. **Custom Components**:
   - Developed `VideoCard` and `MediasfuGenericAlt` for bespoke media rendering.
   - Introduced a `VideoCardTransformer` for applying custom styles to video elements.

3. **State Synchronization**:
   - Improved synchronization between Angular's reactive state management and MediaSFU parameters.

4. **Participant Interaction**:
   - Enabled hosts to manage participants with advanced controls like muting and removing video streams.

---

## Key Features

- **Advanced Video Controls**:
  - Toggle video streams on/off.
  - Switch between front and rear cameras.
  - Select specific camera devices.

- **Custom Media Rendering**:
  - Dynamic grids for video streams using `FlexibleGrid`.
  - Tailored video and audio visualization with `VideoCard` and `AudioLevelBars`.

- **Participant Management**:
  - Host-level controls to mute, remove, and manage participants effectively.

- **Backend Integration**:
  - Consistent synchronization between server-side data and client-side rendering.

---

## Integration Steps

### Step 1: Extend `UseMediasfuSdkService`

Enhance the `UseMediasfuSdkService` to support advanced video functionalities.

1. **Add Video Control Methods**:
   - Implement methods like `toggleVideo`, `switchCamera`, and `selectCamera` to manage video streams dynamically.
   - Ensure the service handles MediaSFU-specific interactions effectively.

2. **Inject MediaSFU Video Services**:
   - Import and inject necessary MediaSFU services, such as `clickVideo`, `switchVideoAlt`, and `selectVideo`, to control video streams.

### Step 2: Build Custom Components

Develop reusable components for tailored media rendering.

1. **Create `VideoCard` Component**:
   - Render participant video streams with dynamic styles and overlays.
   - Integrate with Angular's reactive state to update media in real-time.

2. **Implement `VideoCardTransformer`**:
   - Apply transformations and custom styles to video components dynamically.
   - Enhance participant interaction with visual cues for audio and video status.

3. **Develop `MediasfuGenericAlt`**:
   - Extend the default `MediasfuGeneric` component to support custom rendering logic.
   - Replace default grid implementations with the tailored `addVideosGrid` function.

---

### Step 3: Update `SpaceDetailsComponent`

1. **Integrate Advanced Components**:
   - Replace the default `MediaSFUHandler` with `MediasfuGenericAlt` for enhanced media control.
   - Utilize `FlexibleGrid` and `VideoCardTransformer` for dynamic video layouts.

2. **Synchronize Media Streams**:
   - Update `allRoomVideos` and `allVideoStreams` to render participant video streams accurately.
   - Implement fallback mechanisms to handle edge cases, such as missing streams or paused videos.

---

### Step 4: Configure Video Grids

1. **Render Custom Grids**:
   - Use `FlexibleGrid` to display participant videos in a responsive layout.
   - Apply custom styles and overlays for improved visual clarity.

2. **Implement Video Stream Retrieval**:
   - Use `getVideoStream` to fetch video streams from `allRoomVideos` or `allVideoStreams`.
   - Ensure streams are correctly associated with participants for accurate rendering.

---

### Step 5: Final Testing and Adjustments

1. **Test Video Controls**:
   - Verify functionalities like toggling video, switching cameras, and selecting devices.

2. **Validate Participant Management**:
   - Ensure hosts can mute, remove, and manage participants effectively.

3. **Optimize UI**:
   - Apply responsive design principles to handle different screen sizes and orientations.
   - Enhance accessibility with keyboard navigation and ARIA labels.

---

## Key Components

### VideoCard
Renders participant video streams with dynamic styles and overlays.

### MediasfuGenericAlt
Encapsulates custom MediaSFU logic for tailored media rendering and control.

### VideoCardTransformer
Applies dynamic transformations and styles to video components for enhanced visualization.

### FlexibleGrid
Displays participant videos in a responsive grid layout, supporting dynamic adjustments.

---

## Important Notes

1. **Cross-Browser Compatibility**:
   - Ensure compatibility with major browsers (Chrome, Firefox, Edge, Safari).

2. **Performance Optimization**:
   - Use lazy loading for video streams to reduce client-side rendering load.
   - Paginate video grids to manage resource usage effectively.

---

## Final Notes

The **SpacesTek Advanced Application** demonstrates the power of the `mediasfu-angular` SDK in building scalable and visually engaging media applications. By incorporating advanced video controls and custom rendering, this iteration enhances communication capabilities while maintaining a seamless user experience.

For detailed steps and additional customization options, refer to the **[Angular Transcript](../mediasfu_angular/TransAdvanced.md)**.

*Happy coding with MediaSFU and SpacesTek! 🚀🌐*
