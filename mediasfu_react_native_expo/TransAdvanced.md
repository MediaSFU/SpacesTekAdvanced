# Advanced MediaSFU with React Native (Expo) Applications

In this guide, we'll explore advanced techniques for integrating MediaSFU with React Native applications using Expo. We'll focus on enhancing video functionalities, rendering custom video elements, and building a custom `MediasfuGeneric` component.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step-by-Step Guide](#step-by-step-guide)
  - [Step 1: Introduction](#step-1-introduction)
  - [Step 2: Introducing New Features](#step-2-introducing-new-features)
  - [Step 3: Rendering and Transforming Media Data](#step-3-rendering-and-transforming-media-data)
  - [Step 4: Building Your Own Custom `MediasfuGeneric` Component](#step-4-building-your-own-custom-mediasfugeneric-component)


## Prerequisites

Before you begin, ensure you have the following installed:

- [**Node.js**](https://nodejs.org/) (v14 or later)
- [**npm**](https://www.npmjs.com/) or [**Yarn**](https://yarnpkg.com/)
- [**Expo CLI**](https://docs.expo.dev/get-started/installation/)
- [**Expo Go**](https://expo.dev/client) app installed on your iOS or Android device (optional, for testing on physical devices)

## Step-by-Step Guide

### Step 1: Introduction

This guide is a **continuation** of our previous setup. If you haven't completed the initial guide, please do so before proceeding.

#### 1.1 Focus Shift to Video

- **Primary Media Type:** We are shifting our focus to **video** as the primary media type, moving away from the original audio-centric approach in the SpacesTek project.

#### 1.2 Objectives

In this guide, we will cover:

- **Rendering JSX Elements:** How to render various JSX elements for the main video grid.
- **Intercepting and Modifying Video Data:** Techniques to intercept and modify video data before rendering.
- **Using MediaStream:** Leveraging MediaStream to render customized video data.
- **Custom `MediasfuGeneric` Component:** Building a custom component to render your own video data from the source.

---

### Step 2: Introducing New Features

We'll begin by **updating the `useAudioVideoSDK` hook** to incorporate advanced video functionalities.

#### 2.1 Update the `useAudioVideoSDK` Hook

**File Location:** `src/hooks/useAudioVideoSDK.ts`

We will add three new functions to enhance video control:

1. **`toggleVideo`** - Turn video on/off.
2. **`switchCamera`** - Switch between front and back cameras.
3. **`selectCamera`** - Select a specific camera device.

##### 2.1.1 Add `toggleVideo` Function

```tsx
export const toggleVideo = async ({ sourceParameters }: UseAudioVideoSDKProps): Promise<void> => {
  try {
    if (Object.keys(sourceParameters).length > 0) {
      const options: ClickVideoOptions = {
        parameters: sourceParameters.getUpdatedAllParams(),
      };
      await clickVideo(options);
    }
  } catch (e) {
    console.error(e);
  }
};
```

*Helper Notes:*
- **Functionality:** Utilizes the built-in `clickVideo` function from `mediasfu-reactnative-expo` to toggle video.
- **Parameters:** Receives `sourceParameters` to manage state effectively.

##### 2.1.2 Add `switchCamera` Function

```tsx
export const switchCamera = async ({ sourceParameters }: UseAudioVideoSDKProps): Promise<void> => {
  try {
    if (Object.keys(sourceParameters).length > 0) {
      const options: SwitchVideoAltOptions = {
        parameters: sourceParameters.getUpdatedAllParams(),
      };
      await switchVideoAlt(options);
    }
  } catch (e) {
    console.error(e);
  }
};
```

*Helper Notes:*
- **Functionality:** Uses `switchVideoAlt` to toggle between front and back cameras seamlessly.
- **Parameters:** Managed through `sourceParameters` for consistent state handling.

##### 2.1.3 Add `selectCamera` Function

```tsx
export const selectCamera = async ({ sourceParameters, deviceId }: UseAudioVideoSDKProps): Promise<void> => {
  try {
    if (Object.keys(sourceParameters).length > 0) {
      const options: SwitchVideoOptions = {
        videoPreference: deviceId!,
        parameters: sourceParameters.getUpdatedAllParams(),
      };
      switchVideo(options);
    }
  } catch (e) {
    console.error(e);
  }
};
```

*Helper Notes:*
- **Functionality:** Leverages `selectVideo` to choose a specific camera device based on `deviceId`.
- **Parameters:** Incorporates `videoPreference` to ensure the selected camera is prioritized.

##### 2.1.4 Integrate New Methods into `SpacesDetails` Component

**File Location:** `src/components/SpacesDetails.tsx`

Import the updated methods and integrate them into the component's props.

```tsx
import { toggleVideo, switchCamera, selectCamera } from "../hooks/useAudioVideoSDK";

// Inside your component
toggleVideo,
switchCamera,
selectCamera,
```

---

#### 2.2 Update `handleToggleMic` Function

We will repurpose the `handleToggleMic` function to control video instead of audio.

```tsx
const handleToggleMic = async () => {
  await toggleVideo({ sourceParameters: sourceParameters.current });

  // Else block remains unchanged
  setMessage("You do not have permission to toggle your cam.");
};
```

*Helper Notes:*
- **Purpose Shift:** The function now toggles video, reflecting our focus on video as the primary media type.

---

#### 2.3 Add Camera Switching Functionality

**Component Modification:** `SpacesDetails.tsx`

We will add a button to switch between front and back cameras.

```tsx
// Under the mic button

{videoOn && (
  <TouchableOpacity
    style={styles.toggleMicBtn}
    onPress={() =>
      switchCamera({
        sourceParameters: sourceParameters.current,
      })
    }
    accessibilityLabel="Switch camera"
    accessibilityRole="button"
  >
    <Icon name="camera" style={styles.icon} />
    <Text style={styles.buttonText}>Switch Cam</Text>
  </TouchableOpacity>
)}
```

##### 2.3.1 Track Video State

Add state management to track whether the video is on.

```tsx
const [videoOn, setVideoOn] = useState(false);
```

##### 2.3.2 Update `sourceChanged` Function

Ensure the `videoOn` state reflects the current video status.

```tsx
if (sourceParameters.current.videoAlreadyOn! !== videoOn) {
  setVideoOn(sourceParameters.current.videoAlreadyOn!);
}
```

*Helper Notes:*
- **State Synchronization:** Maintains consistency between UI state and MediaSFU's internal state.

---

#### 2.4 Add Camera Selection Functionality

Provide users with the ability to select a specific camera device.

##### 2.4.1 Track Available and Selected Video Inputs

```tsx
const [selectedVideoInput, setSelectedVideoInput] = useState<string | null>(null);
const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
```

##### 2.4.2 Populate Available Video Inputs on Video Toggle

Modify the `handleToggleMic` function to fetch available video inputs.

```tsx
const handleToggleMic = async () => {
  await toggleVideo({ sourceParameters: sourceParameters.current });

  // Fetch available video devices
  const devices = await mediaDevices.enumerateDevices() as MediaDeviceInfo[];

  // Filter to get only video inputs
  const videoInputList = devices.filter((device) => device.kind === 'videoinput');

  // Update state with available video inputs
  setVideoInputs(videoInputList);
};
```

##### 2.4.3 Import `mediaDevices`

**React Native with Expo Compatibility:**

To ensure cross-platform compatibility, especially when using Expo and running on web platforms, we utilize the `react-native-webrtc-web-shim` package with platform-specific implementations.

###### 2.4.3.1 Create WebRTC Shim

**Folder Structure:**

```
src/
└── components/
    └── custom/
        └── webrtc/
            ├── webrtc.ts
            ├── webrtc.web.ts
            ├── webrtc.android.ts
            └── webrtc.ios.ts
```

###### 2.4.3.2 Define WebRTC Modules

**`webrtc.ts`** (Default/Fallback Implementation)

```tsx
/* src/components/custom/webrtc/webrtc.ts */

import React from 'react';

// Default fallback for mediaDevices
export const mediaDevices = {
  getUserMedia: async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
    console.warn('getUserMedia is not implemented in this environment.');
    return new MediaStream(); // Fallback to an empty MediaStream
  },

  getDisplayMedia: async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
    console.warn('getDisplayMedia is not implemented in this environment.');
    return new MediaStream(); // Fallback to an empty MediaStream
  },

  enumerateDevices: async (): Promise<MediaDeviceInfo[]> => {
    console.warn('enumerateDevices is not implemented in this environment.');
    return []; // Fallback to an empty array
  },
};

export function registerGlobals() {}

export class MediaStream {
  tracks: any[];

  constructor(tracks: any[] = []) {
    this.tracks = tracks;
  }

  // Additional methods or properties can be added as needed
}

export class MediaStreamTrack {
  // Implementation can be extended as required
}

export class RTCView extends React.Component<any> {
  render(): JSX.Element {
    return null; // Empty implementation
  }
}
```

**`webrtc.web.ts`** (Web-Specific Implementation)

```tsx
/* src/components/custom/webrtc/webrtc.web.ts */

import {
  RTCView,
  MediaStream,
  mediaDevices,
  registerGlobals,
  MediaStreamTrack,
} from 'react-native-webrtc-web-shim';

export {
  RTCView,
  mediaDevices,
  registerGlobals,
  MediaStream,
  MediaStreamTrack,
};
```

**`webrtc.android.ts`** (Android-Specific Implementation)

```tsx
/* src/components/custom/webrtc/webrtc.android.ts */

import {
  mediaDevices,
  RTCView,
  registerGlobals,
  MediaStream,
  MediaStreamTrack,
} from 'react-native-webrtc';

export {
  mediaDevices,
  RTCView,
  registerGlobals,
  MediaStream,
  MediaStreamTrack,
};
```

**`webrtc.ios.ts`** (iOS-Specific Implementation)

```tsx
/* src/components/custom/webrtc/webrtc.ios.ts */

import {
  mediaDevices,
  RTCView,
  registerGlobals,
  MediaStream,
  MediaStreamTrack,
} from 'react-native-webrtc';

export {
  mediaDevices,
  RTCView,
  registerGlobals,
  MediaStream,
  MediaStreamTrack,
};
```

###### 2.4.3.3 Configure TypeScript Paths

**`tsconfig.json`**

Ensure TypeScript recognizes the custom WebRTC modules.

```json
{
  "compilerOptions": {
    // ... other options ...
    "baseUrl": "./",
    "paths": {
      "react-native-webrtc": ["src/components/custom/webrtc/webrtc"]
    }
  }
}
```

*Helper Notes:*
- **Platform-Specific Shims:** This setup ensures that the correct WebRTC implementation is used based on the platform (web, Android, iOS).
- **Fallbacks:** The default `webrtc.ts` provides fallbacks for environments where WebRTC isn't supported.

##### 2.4.4 Import `mediaDevices` in `SpacesDetails` Component

**File Location:** `src/components/SpacesDetails.tsx`

```tsx
import { mediaDevices } from './custom/webrtc/webrtc';
```

##### 2.4.5 Add Camera Selection Dropdown

Add a dropdown picker to allow users to select a specific camera.

```tsx
// Under the switch camera button

{videoInputs.length > 1 && (
  <View style={styles.cameraPicker}>
    <DropDownPicker
      open={showCameraPicker}
      value={selectedVideoInput}
      items={videoInputs.map((input) => ({
        label: input.label || 'Camera',
        value: input.deviceId,
      }))}
      setOpen={() => setShowCameraPicker(!showCameraPicker)}
      setValue={(callback: (value: string) => string) =>
        handleSelectCamera(callback(selectedVideoInput!))
      }
      setItems={() => {}}
      containerStyle={styles.dropdownContainer}
      style={styles.picker}
      dropDownContainerStyle={styles.dropDownContainer}
      placeholder="Select Camera"
      zIndex={2000}
      zIndexInverse={3000}
      scrollViewProps={{ scrollEnabled: false }}
      listMode="SCROLLVIEW"
    />
  </View>
)}
```

*Helper Notes:*
- **Styling:** The dropdown can be styled as needed. Refer to the `styles` object for customization.
- **Functionality:** Toggling the dropdown's visibility and handling camera selection is managed through state and helper functions.

##### 2.4.6 Handle Camera Selection

Define the `handleSelectCamera` function to manage camera switching based on user selection.

```tsx
const handleSelectCamera = async (deviceId: string) => {
  if (deviceId === selectedVideoInput) return;
  setSelectedVideoInput(deviceId);
  await selectCamera({
    sourceParameters: sourceParameters.current,
    deviceId,
  });
};
```

##### 2.4.7 Track Dropdown Visibility

Add state to manage the visibility of the camera picker dropdown.

```tsx
const [showCameraPicker, setShowCameraPicker] = useState(false);
```

---

#### 2.5 Testing Camera Controls

1. **Launch the App:**
   - Start your React Native application using `expo start`.
   - Open the app in both the emulator and physical devices (if available).

2. **Join/Create a Room:**
   - Navigate to `http://localhost:3000/meeting/start` to join or create a room.

3. **Test Camera Switching:**
   - **Switch Camera:** Click the "Switch Cam" button to toggle between front and back cameras.
   - **Select Specific Camera:** Use the dropdown picker to select a specific camera device.
   - **Verification:**
     - Ensure the camera toggles correctly.
     - Confirm that selecting a specific camera switches the video feed accordingly.

*Helper Notes:*
- **Device Support:** On devices with multiple cameras (e.g., smartphones, tablets), both switching and selection should function seamlessly.
- **Emulator Limitations:** Some emulators may not support multiple cameras. Testing on physical devices is recommended for full functionality.

---

### Step 3: Rendering and Transforming Media Data

Now, we'll focus on rendering video elements for both the main grid and mini grids, as well as transforming video data to customize the UI.

#### 3.1 Render JSX Elements for Video Grids

**Component Modification:** `SpacesDetails.tsx`

Replace the default `FlexibleGrid` with your custom rendering logic.

```tsx
{/* Video Grid */}
<View style={styles.videoGrid}>
  {allRoomVideos.current &&
    allRoomVideos.current.map((row, index) => (
      <View key={index} style={styles.videoRow}>
        <FlexibleGrid
          customWidth={200}
          customHeight={200}
          rows={1}
          columns={allRoomVideos.current.length > 0 ? allRoomVideos.current[0].length : 1}
          componentsToRender={allRoomVideos.current.length > 0 ? allRoomVideos.current[0] : []}
          backgroundColor={'rgba(217, 227, 234, 0.99)'}
        />
      </View>
    ))}
</View>
```

*Helper Notes:*
- **Custom Grid Rendering:** The `FlexibleGrid` component is now rendered within a `View` that maps through `allRoomVideos`.
- **Dynamic Columns:** Adjusts the number of columns based on the number of video streams.

#### 3.2 Customize Video Appearance

We aim to **intercept and modify** video data before rendering to achieve a customized appearance akin to the SpacesTek project.

##### 3.2.1 Create `VideoCardTransformer`

**File Location:** `src/components/transforms/VideoCardTransformer.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VideoCard } from 'mediasfu-reactnative-expo';

type VideoCardTransformerProps = {
  children: React.ReactNode;
};

/**
 * Intercepts <VideoCard> children and applies custom styling.
 *
 * Usage:
 *   <VideoCardTransformer>
 *     <VideoCard ... />
 *     <VideoCard ... />
 *   </VideoCardTransformer>
 */
const VideoCardTransformer: React.FC<VideoCardTransformerProps> = ({ children }) => {
  return (
    <>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          // Not a valid React element, return as-is
          return child;
        }

        // Check if child is actually a VideoCard
        if (child.type === VideoCard) {
          // Extract original props
          const originalProps = child.props;

          // Merge or override props
          const newProps = {
            ...originalProps,

            // Apply custom styles
            customStyle: [
              originalProps.customStyle || {},
              styles.participantCard, // Custom style
            ],

            // Override or add custom overlays
            videoInfoComponent: (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  {originalProps.participant?.name || 'Unnamed'}
                </Text>
              </View>
            ),

            // Add or override controls
            videoControlsComponent: (
              <View style={styles.controlsContainer}>
                <Text style={styles.controlsText}>
                  {originalProps.participant?.muted ? '🔇' : '🎤'}
                </Text>
              </View>
            ),
          };

          // Return cloned element with new props
          return React.cloneElement(child, newProps);
        }

        // If not a VideoCard, return as-is
        return child;
      })}
    </>
  );
};

const styles = StyleSheet.create({
  participantCard: {
    backgroundColor: '#fff',
    width: 140,
    height: 140,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: 'rgba(0,0,0,0.9)',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  controlsText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default VideoCardTransformer;
```

*Helper Notes:*
- **Custom Styling:** Applies a circular design with overlays for participant names and audio status.
- **Component Interception:** Ensures only `VideoCard` components are transformed, leaving other components untouched.

##### 3.2.2 Integrate `VideoCardTransformer` in `SpacesDetails`

**File Location:** `src/components/SpacesDetails.tsx`

```tsx
import VideoCardTransformer from './transforms/VideoCardTransformer';

// Inside your component's render method
{/* Video Grid Transform */}
<View style={styles.videoGrid}>
  {allRoomVideos.current &&
    allRoomVideos.current.map((row, index) => (
      <View key={index} style={styles.videoRow}>
        <VideoCardTransformer>
          {row.map((video) => video)}
        </VideoCardTransformer>
      </View>
    ))}
</View>
```

*Helper Notes:*
- **Encapsulation:** Wraps video elements within the `VideoCardTransformer` to apply custom styles.
- **Maintainability:** Keeps transformation logic separate, promoting cleaner code architecture.


### 3.2.3 Access and Render MediaStreams

Now that we can intercept and style video elements, let's also **directly access the underlying `MediaStream` objects** to render custom displays. This is particularly useful if you want more direct control over how video feeds are displayed (e.g., in a custom `ParticipantCard` component).

There are **two main approaches** for retrieving each participant’s `MediaStream`:

1. **Option 1: Use the JSX elements** from `allRoomVideos` (produced by `MediasfuGeneric` or your custom `addVideosGrid`) and extract the video stream props.
2. **Option 2: Use the raw `allVideoStreams` array** from `sourceParameters.current.allVideoStreams`, which lists all `Stream` objects the MediaSFU session knows about.

Depending on your design, you may choose **one** of these options or even **combine** them (e.g., default to Option 1 but fall back to Option 2 if a participant’s stream is not found).

---

#### ParticipantCard Setup

First, let’s ensure your `ParticipantCard` component accepts a `video` prop of type `MediaStream`, and renders it with `RTCView`.

```tsx
// src/components/ParticipantCard.tsx

import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { RTCView, MediaStream } from '../custom/webrtc/webrtc';

interface ParticipantCardProps {
  participant: ParticipantData;
  isHost: boolean;
  onMute: (id: string) => void;
  currentUserId?: string;
  onToggleMic?: (participant: ParticipantData) => void;
  onRemove: (id: string) => void;
  space?: Space;
  video?: MediaStream; // Pass the MediaStream here
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  isHost,
  onMute,
  currentUserId,
  onToggleMic,
  onRemove,
  space,
  video,
}) => {
  const videoRef = useRef<MediaStream | undefined>(video);

  // Update local ref if 'video' prop changes
  useEffect(() => {
    if (video && videoRef.current !== video) {
      videoRef.current = video;
    }
  }, [video]);

  return (
    <View style={styles.participantCard}>
      {/* If we have a MediaStream, display the video; otherwise, show an avatar */}
      {video ? (
        <View style={styles.videoContainer}>
          {Platform.OS === 'web' ? (
            <RTCView stream={videoRef.current!} style={styles.video} />
          ) : (
            <RTCView
              streamURL={videoRef.current?.toURL()}
              style={styles.video}
              objectFit="cover"
              mirror
            />
          )}
        </View>
      ) : (
        <Image
          source={{
            uri: participant.avatarUrl || 'https://www.mediasfu.com/logo192.png',
          }}
          style={styles.avatar}
          resizeMode="cover"
        />
      )}

      {/* Additional UI (host controls, mic icon, etc.) can go here */}
      {/* ... */}
    </View>
  );
};

export default ParticipantCard;

const styles = StyleSheet.create({
  participantCard: {
    width: 120,
    height: 120,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
```

---

#### Option 1: Extract Streams from `allRoomVideos`

When you use a `MediasfuGeneric` (or your custom `MediasfuGenericAlt`) to generate JSX elements (like `<VideoCard />`), those elements often have props like `videoStream`. We can **flatten** those elements and match them to participants by ID.

1. **Create/Use** a local reference for the JSX array, e.g., `allRoomVideos.current`.
2. **Flatten** the array to find the one that matches your participant’s `id`.

```tsx
// Inside your SpaceDetails.tsx (or similar) component
// We assume you have 'allRoomVideos' as a ref storing JSX elements.

const allRoomVideos = useRef<JSX.Element[][]>([]);
const mainVideo = useRef<JSX.Element[]>([]); // For the 'main grid' if you have any

useEffect(() => {
  // Suppose your sourceParameters stores a reference to these "otherGridStreams"
  if (sourceParameters.current.otherGridStreams !== allRoomVideos.current) {
    allRoomVideos.current = sourceParameters.current.otherGridStreams;
  }
  // Also, if you have a main grid:
  if (sourceParameters.current.mainGridStream !== mainVideo.current) {
    mainVideo.current = sourceParameters.current.mainGridStream;
  }
}, [sourceChanged]);

function getVideoStreamForParticipant(p: ParticipantData): MediaStream | undefined {
  let videoStream: MediaStream | undefined;

  try {
    // Flatten the array of arrays
    const allVideosFlat = allRoomVideos.current.flat();

    // 1) Match by name / ID
    const matchedVideoElement = allVideosFlat.find(
      (element: any) =>
        element.props &&
        (element.props.name === p.id ||
          (element.props.participant?.id.includes('youyou') && p.id === currentUser?.id))
    );

    if (matchedVideoElement) {
      videoStream = matchedVideoElement.props?.videoStream;
    }

    // 2) If participant is host and no match found, maybe fallback to mainVideo
    if (!videoStream && p.role === 'host' && mainVideo.current?.length) {
      videoStream = mainVideo.current[0].props?.videoStream;
    }
  } catch (error) {
    console.error('Error finding videoStream in allRoomVideos:', error);
  }

  return videoStream;
}

// Then pass 'videoStream' to <ParticipantCard />
<ParticipantCard
  participant={p}
  video={getVideoStreamForParticipant(p)}
  // ...other props
/>
```

*Helper Notes*:

- **JSX Prop Matching**: We look for `.props.name === participant.id` or if it’s your local user, you might detect `'youyou'` in the ID.
- **Host Fallback**: If the participant is the “host” and the usual method fails, we may use a special `mainVideo` fallback (for screen share, etc.).
- **Minimal Overhead**: This approach uses the existing generated JSX from `MediasfuGeneric`, so you don’t have to re-implement all the stream logic yourself.

---

#### Option 2: Extract Streams from `allVideoStreams`

Alternatively, you may bypass the JSX elements and directly access the raw array of `Stream` objects stored in `sourceParameters.current.allVideoStreams`. This can be more flexible if you’d like to manually handle stream pagination or advanced logic.

1. **Track** `allVideoStreams` in a local ref.
2. **Match** each participant’s `videoID` to the `producerId` in the `allVideoStreams` array.

```tsx
// Inside your SpaceDetails.tsx component

const allRoomVideoStreams = useRef<(Participant | Stream)[]>([]);

useEffect(() => {
  // When sourceParameters updates:
  if (
    sourceParameters.current.allVideoStreams &&
    sourceParameters.current.allVideoStreams !== allRoomVideoStreams.current
  ) {
    allRoomVideoStreams.current = sourceParameters.current.allVideoStreams;
  }
}, [sourceChanged]);

function getVideoStreamForParticipant(p: ParticipantData): MediaStream | undefined {
  let videoStream: MediaStream | undefined;

  try {
    // 1) Locate the participant by name or ID in the participants array (optional)
    const refParticipant = sourceParameters.current.participants?.find(
      (part: Participant) => part.name === p.id
    );

    // 2) Find the matching stream by producerId
    const matchedStreamObj = allRoomVideoStreams.current.find(
      (s: any) => s.producerId === refParticipant?.videoID
    ) as Stream | undefined;

    if (matchedStreamObj?.stream) {
      videoStream = matchedStreamObj.stream;
    }

    // 3) If no match and it's your local user, fallback to localStreamVideo
    if (!videoStream && p.id === currentUser?.id) {
      videoStream = sourceParameters.current.localStreamVideo;
    }

    // 4) If participant is host, check oldAllStreams or other special cases
    if (!videoStream && p.role === 'host') {
      // E.g., host might have "oldAllStreams" if they changed cameras, etc.
      const oldAllStreams = sourceParameters.current.oldAllStreams || [];
      if (oldAllStreams.length > 0) {
        videoStream = oldAllStreams[0].stream;
      }
    }

    // 5) Virtual background check (optional)
    if (!videoStream && sourceParameters.current.keepBackground && sourceParameters.current.virtualStream) {
      videoStream = sourceParameters.current.virtualStream;
    }
  } catch (error) {
    console.error('Error finding videoStream in allVideoStreams:', error);
  }

  return videoStream;
}

// Then pass 'videoStream' to <ParticipantCard />
<ParticipantCard
  participant={p}
  video={getVideoStreamForParticipant(p)}
  // ...other props
/>
```

*Helper Notes*:

- **Full Control**: You have **direct** access to each `Stream` object, making advanced pagination, sorting, or filtering simpler.
- **Local vs. Remote**: For your local user, you might check `sourceParameters.current.localStreamVideo` or a “virtual” background stream if used.
- **Performance**: Be mindful of how large `allVideoStreams` can get. For massive rooms, you may need to implement pagination or lazy-loading.

---

### Testing MediaStream Rendering

Whether you use **Option 1** or **Option 2**:

1. **Launch the App** and create/join a room.
2. **Observe** participant videos in your custom `ParticipantCard`:
   - If they have an active video feed, it renders via `RTCView`.
   - If no active feed, it shows a fallback avatar.
3. **Switch Cameras** or **select a specific camera** to confirm updates in real time.
4. **Screen Share / Whiteboard**: If host starts a share or whiteboard, ensure your fallback logic (for the main grid) picks up that stream.

---

With these **two** stream resolution approaches in place, you now have **full flexibility** to customize how each participant’s video feed is discovered and rendered. You can remain fully reliant on the **JSX elements** generated by MediaSFU, or **bypass** them to handle raw streams directly—whichever best suits your design and performance requirements.
---

### Step 4: Building Your Own Custom `MediasfuGeneric` Component

In this step, we'll create a **custom** `MediasfuGenericAlt` component by copying and modifying the original `MediasfuGeneric.tsx` from the `mediasfu-reactnative-expo` package. This allows us to integrate our custom `addVideosGrid` function and any other bespoke functionalities.

#### 4.1 Create the `addVideosGrid` Function

**File Location:** `src/components/custom/addVideosGrid.tsx`

1. **Create the File:**

   - Navigate to the `custom` folder inside `src/components/`.
   - **Create a new file** named `addVideosGrid.tsx`.

2. **Define `addVideosGrid` with Custom `VideoCard`:**

```tsx
// src/components/custom/addVideosGrid.tsx

import React from "react";
import { MiniCard, AudioCard, Participant, Stream, EventType } from "mediasfu-reactnative-expo";
import VideoCard from "./VideoCard"; // Import custom VideoCard

export interface AddVideosGridProps {
  participants: Participant[];
  streams: Stream[];
  eventType: EventType;
}

export const addVideosGrid = ({ participants, streams, eventType }: AddVideosGridProps) => {
  return participants.map((participant) => {
    // Find the MediaStream associated with the participant's video
    const matchedStream = streams.find((s) => s.producerId === participant.videoID);
    const mediaStream = matchedStream?.stream || new MediaStream();

    return (
      <VideoCard
        key={`video-${participant.id}`}
        videoStream={mediaStream}
        customStyle={{
          borderWidth: eventType !== 'broadcast' ? 2 : 0,
          borderColor: 'black',
        }}
        participant={participant} // Optional: Remove for certain instances if needed
        showControls={false}
        showInfo={false}
        name={participant.name}
      />
    );
  });
};
```

*Helper Notes:*
- **Custom `VideoCard`:** Utilizes the bespoke `VideoCard` component for rendering video streams.
- **Dynamic Styling:** Adjusts border properties based on the `eventType`.

#### 4.2 Create the Custom `VideoCard` Component

**File Location:** `src/components/custom/VideoCard.tsx`

1. **Create the File:**

   - Inside the `custom` folder, **create a new file** named `VideoCard.tsx`.

2. **Define the Custom `VideoCard`:**

```tsx
// src/components/custom/VideoCard.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { RTCView, MediaStream } from './webrtc/webrtc'; // Import from custom WebRTC shim
import { FontAwesome5 } from '@expo/vector-icons';

export interface VideoCardOptions {
  name: string;
  videoStream?: MediaStream;
  participant?: { id: string; name: string; muted: boolean };
  customStyle?: object;
  showControls?: boolean;
  showInfo?: boolean;
}

const VideoCard: React.FC<VideoCardOptions> = ({
  name,
  videoStream,
  participant,
  customStyle,
  showControls = true,
  showInfo = true,
}) => {
  const [isMuted, setIsMuted] = useState(participant?.muted || false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMuted(participant?.muted || false);
  }, [participant?.muted]);

  return (
    <View style={[styles.cardContainer, customStyle]}>
      {/* Video Element */}
      {videoStream ? (
        <View style={styles.videoAvatarContainer}>
          {Platform.OS === 'web' ? (
            <RTCView stream={videoStream} style={styles.videoAvatar} />
          ) : (
            <RTCView
              streamURL={videoStream.toURL()}
              style={styles.videoAvatar}
              objectFit="cover"
              mirror={false}
            />
          )}
        </View>
      ) : (
        <View style={styles.videoAvatarContainer}>
          <FontAwesome5 name="user-circle" size={60} color="#ccc" />
        </View>
      )}

      {/* Name Tag */}
      {showInfo && <Text style={styles.participantName}>{name}</Text>}

      {/* Audio Status Icon */}
      {showControls && (
        <Pressable style={styles.audioStatus}>
          <FontAwesome5
            name={isMuted ? 'microphone-slash' : 'microphone'}
            size={16}
            color={isMuted ? 'red' : 'green'}
          />
        </Pressable>
      )}
    </View>
  );
};

export default VideoCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    width: 120,
    height: 120,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  videoAvatarContainer: {
    width: '65%',
    height: '65%',
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  videoAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  participantName: {
    position: 'absolute',
    bottom: 8,
    fontWeight: '500',
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
  },
  audioStatus: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 6,
    borderRadius: 12,
  },
});
```

*Helper Notes:*
- **Simplified Controls:** Omits complex video controls for a cleaner UI.
- **Cross-Platform Support:** Differentiates between web and native platforms for rendering video streams.

### Step 4: Building Your Own Custom `MediasfuGeneric` Component

In this step, we'll create a **custom** `MediasfuGenericAlt` component to gain deeper control over how video and audio streams are rendered. This involves copying the original `MediasfuGeneric.tsx` file, modifying its imports, and integrating our custom `addVideosGrid` function.

#### 4.1 Overview

- **Purpose:** Customize the rendering of media streams beyond the default `MediasfuGeneric` component.
- **Outcome:** A `MediasfuGenericAlt.tsx` component that leverages your custom `addVideosGrid` function, supporting both JSX-based and raw stream-based video resolution methods.

#### 4.2 Prerequisites

Ensure you've completed the previous steps, especially those related to:

- Setting up the `useAudioVideoSDK` hook with video functionalities.
- Configuring WebRTC shims for cross-platform compatibility.
- Creating the `addVideosGrid.tsx` function and `VideoCard.tsx` component.

#### 4.3 Creating the `MediasfuGenericAlt.tsx` File

To create a customized version of the `MediasfuGeneric` component, follow these detailed steps:

##### 4.3.1 Create the `MediasfuGenericAlt.tsx` File

1. **Navigate to the Custom Components Directory:**

   - **Path:** `src/components/custom/`

2. **Create the File:**

   - **File Name:** `MediasfuGenericAlt.tsx`

##### 4.3.2 Copy Original `MediasfuGeneric.tsx` Code

1. **Locate the Original File:**

   - **Source:** [MediasfuGeneric.tsx on GitHub](https://github.com/MediaSFU/MediaSFU-ReactNative-Expo/blob/main/src/components/mediasfuComponents/MediasfuGeneric.tsx)

2. **Copy the Code:**

   - **Action:** Open the original `MediasfuGeneric.tsx` file, select all the code, and copy it.

3. **Paste into `MediasfuGenericAlt.tsx`:**

   - **Action:** Open your newly created `MediasfuGenericAlt.tsx` file and paste the copied code.

##### 4.3.3 Modify Imports

To integrate your custom `addVideosGrid` function and ensure all dependencies are correctly referenced, perform the following modifications:

1. **Remove Unnecessary Local Imports:**

   - **Action:** Delete the block of code importing from relative paths (e.g., lines importing `initialValuesState` up to before `import { Socket } from "socket.io-client";`).

2. **Import Necessary Exports from `mediasfu-reactnative-expo`:**

   - **Reference:** Visit the [`main.tsx`](https://github.com/MediaSFU/MediaSFU-ReactNative-Expo/blob/main/src/main.tsx) file in the `mediasfu-reactnative-expo` repository to identify necessary exports.

   - **Action:** Copy all exports listed at the end of `main.tsx` (lines 386 - 563) and paste them at the top of your `MediasfuGenericAlt.tsx` file, around line 32.

   - **Adjust Imports:**
     - Change the import source from relative paths to `'mediasfu-reactnative-expo'`.
     - **Example Before:**
       ```tsx
       import { WelcomeOptions } from "../../@types/types";
       ```
     - **Example After:**
       ```tsx
       import { WelcomeOptions, Participant, Stream, EventType } from "mediasfu-reactnative-expo";
       ```

3. **Fix Type Imports:**

   - **Replace Type Paths:**
     - **Before:**
       ```tsx
       import { WelcomeOptions } from "../../@types/types";
       ```
     - **After:**
       ```tsx
       import { WelcomeOptions } from "mediasfu-reactnative-expo";
       ```

   - **Remove Duplicate Imports:**
     - **Action:** Delete any duplicate import lines such as `import { createResponseJoinRoom } from`.

4. **Remove Unneeded Default Views:**

   - **Action:** Delete imports for default views like `MediasfuGeneric`, `MediasfuBroadcast`, `MediasfuWebinar`, `MediasfuConference`, and `MediasfuChat` if they are not required.

   - **Example Before:**
     ```tsx
     import MediasfuGeneric from "./MediasfuGeneric";
     import MediasfuBroadcast from "./MediasfuBroadcast";
     // ... other default views
     ```

   - **Example After:**
     ```tsx
     // Removed unnecessary default view imports
     ```

5. **Update WebRTC Imports:**

   - **Replace Local WebRTC Imports with Custom Shims:**
     - **Before:**
       ```tsx
       import { mediaDevices, RTCView, MediaStream, MediaStreamTrack } from "./webrtc/webrtc";
       ```
     - **After:**
       ```tsx
       import { mediaDevices, RTCView, MediaStream, MediaStreamTrack } from "../webrtc/webrtc";
       ```

6. **Clean Up Unused Imports:**

   - **Action:** Use your IDE's linting tools or manually remove any unused imports to tidy up the file.

##### 4.3.4 Integrate Custom `addVideosGrid` Function

1. **Import `addVideosGrid`:**

   - **Action:** Add the following import statement at the top of `MediasfuGenericAlt.tsx`:

     ```tsx
     import { addVideosGrid } from "./addVideosGrid"; // Ensure the path is correct
     ```

2. **Replace Default `addVideosGrid` Usage:**

   - **Action:** Locate the original `addVideosGrid` function within the `MediasfuGeneric.tsx` code.

   - **Replace It:**
     - **Before:**
       ```tsx
       const allRoomVideos = addVideosGrid(participants, streams, eventType);
       ```
     - **After:**
       ```tsx
       const allRoomVideos = addVideosGrid({ participants, streams, eventType });
       ```

   - **Explanation:**
     - Ensure that the `addVideosGrid` function signature matches the one you're importing. In your custom `addVideosGrid.tsx`, you have:

       ```tsx
       export const addVideosGrid = ({ participants, streams, eventType }: AddVideosGridProps) => { ... }
       ```

     - Thus, pass an object with named properties.

##### 4.3.5 Handle CSS (Optional)

Since you're operating in a React Native environment with Expo, CSS handling differs from web. However, if you have any platform-specific styles, you can manage them within your components or use StyleSheet.

1. **Create a StyleSheet (If Needed):**

   - **Action:** Within `MediasfuGenericAlt.tsx`, define any additional styles required.

   - **Example:**
     ```tsx
     const styles = StyleSheet.create({
       // Add custom styles here
     });
     ```

2. **Integrate Styles:**

   - **Action:** Apply these styles to your JSX elements as needed.

##### 4.3.6 Finalize `MediasfuGenericAlt.tsx`

1. **Ensure Correct Component Naming:**

   - **Action:** Rename the component from `MediasfuGeneric` to `MediasfuGenericAlt`.

   - **Example:**
     ```tsx
     const MediasfuGenericAlt: React.FC<MediaSFUHandlerProps> = ({
       action,
       duration,
       capacity,
       name,
       meetingID,
       sourceParameters,
       updateSourceParameters,
     }) => {
       // Component logic...
     };

     export default MediasfuGenericAlt;
     ```

2. **Remove Unnecessary Code:**

   - **Action:** Since you've replaced specific functions and imports, ensure any leftover code referencing the original `addVideosGrid` or other unneeded functions is removed to prevent conflicts.

3. **Verify Props and Functionality:**

   - **Action:** Ensure that all necessary props are correctly passed and utilized within the component. This includes handling event listeners, state updates, and stream management.

##### 4.3.7 Complete `MediasfuGenericAlt.tsx` Example

Here's a consolidated example of how your `MediasfuGenericAlt.tsx` might look after modifications:

```tsx
// src/components/custom/MediasfuGenericAlt.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  WelcomeOptions,
  Participant,
  Stream,
  EventType,
  // ... other necessary imports from 'mediasfu-reactnative-expo'
} from "mediasfu-reactnative-expo";
import { Socket } from "socket.io-client"; // Ensure this is needed
import { mediaDevices, RTCView, MediaStream, MediaStreamTrack } from "../webrtc/webrtc"; // Adjust path as needed
import { addVideosGrid } from "./addVideosGrid"; // Ensure correct path
import { StyleSheet, View } from "react-native";
// ... other imports

interface MediasfuGenericAltProps {
  action: string;
  duration: number;
  capacity: number;
  name: string;
  meetingID: string;
  sourceParameters: any; // Replace with actual type
  updateSourceParameters: (params: any) => void; // Replace with actual type
}

const MediasfuGenericAlt: React.FC<MediasfuGenericAltProps> = ({
  action,
  duration,
  capacity,
  name,
  meetingID,
  sourceParameters,
  updateSourceParameters,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [eventType, setEventType] = useState<EventType>("conference"); // Example default

  // Fetch participants and streams from sourceParameters or other logic
  useEffect(() => {
    // Example: Update participants and streams based on sourceParameters
    setParticipants(sourceParameters.participants || []);
    setStreams(sourceParameters.streams || []);
    setEventType(sourceParameters.eventType || "conference");
  }, [sourceParameters]);

  // Generate video grids using custom addVideosGrid
  const allRoomVideos = addVideosGrid({ participants, streams, eventType });

  return (
    <View style={styles.container}>
      {/* Render Video Grids */}
      <View style={styles.videoGrid}>
        {allRoomVideos.map((row, index) => (
          <View key={index} style={styles.videoRow}>
            {row.map((videoComponent) => (
              <View key={videoComponent.key} style={styles.videoComponent}>
                {videoComponent}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Additional UI Components (e.g., Audio Controls, Chat, etc.) */}
      {/* ... */}
    </View>
  );
};

export default MediasfuGenericAlt;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    padding: 10,
  },
  videoGrid: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  videoRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  videoComponent: {
    margin: 5,
  },
  // ... other styles
});
```

**Notes:**

- **Type Definitions:** Replace `any` types with appropriate TypeScript interfaces or types from `mediasfu-reactnative-expo`.
- **Event Handling:** Implement any necessary event listeners or handlers to manage stream updates, participant changes, etc.
- **Styling:** Adjust the `StyleSheet` as needed to fit your application's design requirements.

#### 4.4 Integrate `MediasfuGenericAlt` into `MediaSFUHandler`

Now that you've created the `MediasfuGenericAlt` component, integrate it into your application to replace the default `MediasfuGeneric` usage.

1. **Locate the `MediaSFUHandler` Component:**

   - **Path:** `src/components/MediaSFUHandler.tsx`

2. **Import `MediasfuGenericAlt`:**

   ```tsx
   import MediasfuGenericAlt from "./custom/MediasfuGenericAlt";
   ```

3. **Update the Component Rendering:**

   - **Before:**
     ```tsx
     <MediasfuGeneric
       action={action}
       duration={duration}
       capacity={capacity}
       name={name}
       meetingID={meetingID}
       sourceParameters={sourceParameters}
       updateSourceParameters={updateSourceParameters}
     />
     ```

   - **After:**
     ```tsx
     <MediasfuGenericAlt
       action={action}
       duration={duration}
       capacity={capacity}
       name={name}
       meetingID={meetingID}
       sourceParameters={sourceParameters}
       updateSourceParameters={updateSourceParameters}
     />
     ```

4. **Ensure Props are Correctly Passed:**

   - **Action:** Verify that all required props (`action`, `duration`, `capacity`, `name`, `meetingID`, `sourceParameters`, `updateSourceParameters`) are being correctly passed to `MediasfuGenericAlt`.

5. **Handle Additional Logic (If Any):**

   - **Action:** If `MediasfuGenericAlt` requires additional props or setup, ensure they're handled within `MediaSFUHandler`.

##### Example `MediaSFUHandler.tsx`:

```tsx
// src/components/MediaSFUHandler.tsx

import React from "react";
import MediasfuGenericAlt from "./custom/MediasfuGenericAlt";
import { WelcomeOptions } from "mediasfu-reactnative-expo";
import { View, StyleSheet } from "react-native";

interface MediaSFUHandlerProps {
  action: string;
  duration: number;
  capacity: number;
  name: string;
  meetingID: string;
  sourceParameters: any; // Replace with actual type
  updateSourceParameters: (params: any) => void; // Replace with actual type
}

const MediaSFUHandler: React.FC<MediaSFUHandlerProps> = ({
  action,
  duration,
  capacity,
  name,
  meetingID,
  sourceParameters,
  updateSourceParameters,
}) => {
  return (
    <View style={styles.container}>
      <MediasfuGenericAlt
        action={action}
        duration={duration}
        capacity={capacity}
        name={name}
        meetingID={meetingID}
        sourceParameters={sourceParameters}
        updateSourceParameters={updateSourceParameters}
      />
    </View>
  );
};

export default MediaSFUHandler;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
});
```

#### 4.5 Update `SpacesDetails` Component to Use Custom Handler

Now, ensure that your `SpacesDetails` component utilizes the `MediaSFUHandler` with the customized `MediasfuGenericAlt` component.

1. **Locate `SpacesDetails.tsx`:**

   - **Path:** `src/components/SpacesDetails.tsx`

2. **Update Import Statements:**

   ```tsx
   import MediaSFUHandler from "./MediaSFUHandler";
   // ... other imports
   ```

3. **Modify the Render Method:**

   - **Before:**
     ```tsx
     {/* Existing Video Grid Customization */}

     {/* Participant Cards */}
     <div class="participants-grid">
       <ParticipantCard
         *ngFor="let participant of participants | async"
         [participant]="participant"
         [space]="space | async"
         [videoStream]="getVideoStream(participant)"
       ></ParticipantCard>
     </div>
     ```

   - **After:**
     ```tsx
     {/* Replace with MediaSFUHandler */}

     <MediaSFUHandler
       action={action}
       duration={duration}
       capacity={capacity}
       name={name}
       meetingID={meetingID}
       sourceParameters={sourceParameters}
       updateSourceParameters={updateSourceParameters}
     />
     ```

4. **Pass Necessary Props:**

   - **Action:** Ensure that all required props (`action`, `duration`, `capacity`, `name`, `meetingID`, `sourceParameters`, `updateSourceParameters`) are correctly passed to `MediaSFUHandler`.

5. **Remove or Comment Out Old Participant Rendering (If Replaced):**

   - **Action:** If `MediaSFUHandler` now manages participant rendering, you can remove or comment out previous manual participant mappings to avoid duplication.

##### Example `SpacesDetails.tsx` Update:

```tsx
// src/components/SpacesDetails.tsx

import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import MediaSFUHandler from "./MediaSFUHandler";
// ... other imports

const SpacesDetails: React.FC = () => {
  // ... existing state and hooks

  return (
    <View style={styles.container}>
      {/* MediaSFU Handler */}
      <MediaSFUHandler
        action={action}
        duration={duration}
        capacity={capacity}
        name={name}
        meetingID={meetingID}
        sourceParameters={sourceParameters}
        updateSourceParameters={updateSourceParameters}
      />

      {/* Remove or comment out old participant rendering */}
      {/* 
      <View style={styles.participantsGrid}>
        {participants.map((participant) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            isHost={participant.role === "host"}
            onMute={handleMute}
            video={getVideoStreamForParticipant(participant)}
            // ...other props
          />
        ))}
      </View>
      */}
    </View>
  );
};

export default SpacesDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    padding: 10,
  },
  // ... other styles
});
```

#### 4.6 Testing the Custom `MediasfuGenericAlt` Component

After setting up your custom component, it's crucial to thoroughly test its functionality to ensure everything works as expected.

1. **Run Your Application:**

   - **Command:** Use `expo start` to launch your React Native application.

2. **Join/Create a Room:**

   - **Action:** Navigate to `http://localhost:3000/meeting/start` (or your configured meeting URL) to create or join a room.

3. **Verify Video Grids:**

   - **Main Grid:**
     - **Check:** Ensure the main video grid displays correctly with custom styles.
     - **Test:** Start a screen share or whiteboard session and verify that the main video grid updates accordingly.

   - **Mini Grids:**
     - **Check:** Verify that mini grids render participants' video streams using the custom `VideoCard` styling.
     - **Test:** Join the room from multiple devices or profiles to populate the mini grids.

4. **Test Camera Controls:**

   - **Switch Camera:**
     - **Action:** Use the "Switch Cam" button to toggle between front and back cameras.
     - **Verify:** Ensure the video feed switches correctly.

   - **Select Specific Camera:**
     - **Action:** Use the dropdown picker to select a specific camera device.
     - **Verify:** Confirm that the selected camera's feed is displayed.

5. **Handle Edge Cases:**

   - **No Video Stream:**
     - **Action:** Test participants without active video streams.
     - **Verify:** Ensure their `ParticipantCard` displays the fallback avatar image.

   - **Host Video Fallback:**
     - **Action:** If the host stops their video, ensure the main grid falls back to the appropriate stream if configured.

6. **Monitor Performance:**

   - **Action:** Observe the application's performance, especially with multiple active video streams.
   - **Verify:** Ensure there are no lags, crashes, or UI glitches.

7. **Debugging:**

   - **Console Logs:** Monitor console logs for any errors or warnings.
   - **Network Issues:** Ensure all media streams are correctly routed and no network-related issues exist.

##### Troubleshooting Tips:

- **Black Screens:** If participants see black screens, verify that their `MediaStream` objects are correctly passed and that permissions for camera access are granted.
- **Stream Matching Errors:** Ensure that participant IDs and stream producer IDs are correctly matched in both Option 1 and Option 2 resolutions.
- **Styling Issues:** Double-check your `StyleSheet` definitions to ensure components render as intended across different devices and platforms.

---

### Conclusion

You've successfully created and integrated a custom `MediasfuGenericAlt` component into your React Native Expo application. This customization provides enhanced control over media stream rendering, allowing you to tailor the user interface and experience to your specific needs.

**Key Takeaways:**

- **Custom Component Development:** Building `MediasfuGenericAlt` offers flexibility beyond default configurations.
- **Stream Resolution Options:** Supporting both JSX-based and raw stream-based resolutions ensures robust media handling.
- **Cross-Platform Compatibility:** Leveraging WebRTC shims guarantees consistent behavior across web and native platforms.
- **Performance Optimization:** Carefully managing media streams prevents performance bottlenecks, especially in rooms with many participants.

**Next Steps:**

- **Advanced Features:** Explore additional MediaSFU capabilities such as screen sharing, whiteboards, and real-time video effects.
- **Virtual Backgrounds:** Implement virtual backgrounds using MediaSFU's APIs to enhance user privacy and customization.
- **Participant Management:** Develop advanced participant controls, including roles, permissions, and interactive features.

**Final Remarks:**

- **UI Styling Focus:** Most advanced functionalities revolve around UI enhancements. Tailor the styling to match your application's branding and user experience goals.
- **Leverage Automation Tools:** Utilize tools like CSS preprocessors or CSS-in-JS libraries to streamline the styling process.
- **Scalability Considerations:** While MediaSFU supports a high number of concurrent streams, rendering numerous video elements can tax client resources. Implement pagination or dynamic loading strategies to maintain optimal performance.
- **Future Enhancements:** This guide covers foundational advanced features. Future iterations can explore more complex functionalities like breakout rooms, virtual backgrounds, and real-time video transformations.

Thank you for following through this advanced guide. Your enhanced MediaSFU integration empowers your React Native Expo application to deliver a rich, interactive, and seamless communication experience. Stay tuned for further tutorials that explore even more sophisticated integrations and functionalities with MediaSFU.