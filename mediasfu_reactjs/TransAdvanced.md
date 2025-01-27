# Advanced MediaSFU-ReactJS Usage Guide

Welcome to the **Advanced MediaSFU-ReactJS Usage Guide**, a continuation of our initial integration tutorial. This guide delves deeper into the capabilities of the `mediasfu-reactjs` package, focusing primarily on advanced video functionalities within the SpacesTek project. By the end of this guide, you'll be adept at rendering and transforming media data, building custom components, and optimizing your application's video handling capabilities.

## Table of Contents

1. [Prerequisites](#prerequisites)
3. [Step 1: Introduction to Advanced Usage](#step-1-introduction-to-advanced-usage)
4. [Step 2: Expanding the `useAudioVideoSDK` Hook](#step-2-expanding-the-useaudiovideosdk-hook)
5. [Step 3: Rendering and Transforming Media Data](#step-3-rendering-and-transforming-media-data)
6. [Step 4: Building a Custom `MediasfuGeneric` Component](#step-4-building-a-custom-mediasfugeneric-component)
7. [Step 5: Final Testing and Refinements](#step-5-final-testing-and-refinements)
8. [Conclusion](#conclusion)

---

## Prerequisites

Before diving into the advanced functionalities, ensure you have completed the initial integration guide. This foundation is crucial for understanding and implementing the advanced features discussed herein.

**Requirements:**

- **Completed Initial Integration**: Ensure you've followed and completed the previous guide on integrating `mediasfu-reactjs`.
- **React Project Setup**: A React application set up using Create React App or your preferred setup.
- **Node.js and npm**: Ensure you have Node.js (v14 or later) and npm installed.
- **MediaSFU Account**: Access to [MediaSFU](https://mediasfu.com/) with necessary credentials (API Key and Username).
- **Multiple Chrome Profiles**: For testing multi-user scenarios, having multiple Chrome profiles without email associations is beneficial.
- **Basic Understanding of React**: Familiarity with React components, hooks, and state management.

---

## Step 1: Introduction to Advanced Usage

### Continuation of the Previous Guide

This guide builds upon the foundations laid in the initial integration tutorial. If you haven't completed the previous guide, it's highly recommended to do so before proceeding with the advanced topics covered here.

### Focus on Advanced `mediasfu-reactjs` Features

In this advanced guide, we'll pivot our focus from audio-centric functionalities to video-centric ones within the SpacesTek project. The key areas of enhancement include:

- **Rendering Video Elements**: Techniques to render various JSX elements for main and mini video grids.
- **Intercepting and Modifying Video Data**: Strategies to intercept video streams and apply custom modifications before rendering.
- **Utilizing MediaStreams**: Leveraging MediaStreams to render customized video data.
- **Building Custom Components**: Creating your own `MediasfuGeneric` component to render bespoke video data from sources.

By the end of this guide, you'll have a comprehensive understanding of advanced video handling using `mediasfu-reactjs`.

---

## Step 2: Expanding the `useAudioVideoSDK` Hook

To manage advanced video functionalities, we'll enhance the existing `useAudioVideoSDK` hook by adding new methods tailored for video control.

### 2.1 Update the `useAudioVideoSDK` Hook

**File Location**: `src/hooks/useAudioVideoSDK.ts`

1. **Open the Hook File**: Navigate to the `hooks` folder in your project and open `useAudioVideoSDK.ts`.

2. **Add New Video Control Functions**

   We'll add three new functions to handle video toggling, camera switching, and selecting specific cameras.

   - **Toggle Video**: Enables or disables the user's video stream.
   - **Switch Camera**: Switches between front and back cameras.
   - **Select Camera**: Allows selecting a specific camera device.

   ```tsx
   // src/hooks/useAudioVideoSDK.ts

   import {
       ClickAudioOptions,
       clickAudio,
       ClickVideoOptions,
       clickVideo,
       SwitchVideoAltOptions,
       switchVideoAlt,
       SwitchVideoOptions,
       switchVideo,
       SelectVideoOptions,
       selectVideo,
       ConfirmExitOptions,
       confirmExit,
       ControlMediaOptions,
       controlMedia,
       Participant,
       RemoveParticipantsOptions,
       removeParticipants,
   } from "mediasfu-reactjs";

   interface UseAudioVideoSDKProps {
       sourceParameters: Record<string, any>;
       deviceId?: string;
   }

   interface MediaControlsProps {
       sourceParameters: Record<string, any>;
       remoteMember: string;
       mediaType?: "audio" | "video" | "screenshare" | "all";
   }

   // Existing functions...

   /**
    * Toggles the user's video on or off.
    */
   export const toggleVideo = async ({
       sourceParameters,
   }: UseAudioVideoSDKProps): Promise<void> => {
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

   /**
    * Switches between front and back cameras.
    */
   export const switchCamera = async ({
       sourceParameters,
   }: UseAudioVideoSDKProps): Promise<void> => {
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

   /**
    * Selects a specific camera based on device ID.
    */
   export const selectCamera = async ({
       sourceParameters,
       deviceId,
   }: UseAudioVideoSDKProps): Promise<void> => {
       try {
           if (Object.keys(sourceParameters).length > 0) {
               const options: SelectVideoOptions = {
                   parameters: sourceParameters.getUpdatedAllParams(),
                   deviceId: deviceId!,
               };
               await selectVideo(options);
           }
       } catch (e) {
           console.error(e);
       }
   };

   // Existing functions...
   ```

   *Helper Notes*:

   - **`toggleVideo`**: Utilizes MediaSFU's `clickVideo` method to enable or disable the video stream.
   - **`switchCamera`**: Employs `switchVideoAlt` to alternate between available camera devices.
   - **`selectCamera`**: Leverages `selectVideo` to choose a specific camera based on its device ID.

3. **Export the New Functions**

   Ensure that the new functions (`toggleVideo`, `switchCamera`, `selectCamera`) are exported alongside the existing ones for accessibility within components.

   ```tsx
   // At the bottom of useAudioVideoSDK.ts

   export {
       toggleVideo,
       switchCamera,
       selectCamera,
       // ...other exports
   };
   ```

### 2.2 Integrate New Methods into `SpaceDetails` Component

**File Location**: `src/components/SpaceDetails.tsx`

1. **Import New Methods**

   ```tsx
   // src/components/SpaceDetails.tsx

   import {
       toggleAudio,
       toggleVideo,
       switchCamera,
       selectCamera,
       disconnectRoom,
       restrictMedia,
       removeMember,
   } from "../hooks/useAudioVideoSDK";
   ```

2. **Update Functionality**

   - **Modify `handleToggleMic` to Toggle Video**

     *Purpose*: Shift the focus from audio to video control by repurposing the mic toggle button to control video streams.

     ```tsx
     const handleToggleMic = async () => {
         await toggleVideo({ sourceParameters: sourceParameters.current });

         // Optional: Update message or handle permission issues
         setMessage("You do not have permission to toggle your cam.");
     };
     ```

     *Helper Note*: This change repurposes the existing mic toggle functionality to manage video streams, aligning with the advanced focus of this guide.

   - **Add Video Control Button**

     *Purpose*: Provide users with the ability to switch between front and back cameras.

     ```tsx
     <div className="mic-controls">
         {videoOn && (
             <button
                 className="toggle-mic-btn"
                 onClick={() =>
                     switchCamera({
                         sourceParameters: sourceParameters.current,
                     })
                 }
                 aria-label={videoOn ? "Switch to" : "Switch to"}
             >
                 <FaSyncAlt /> Switch Camera
             </button>
         )}
     </div>
     ```

     *Helper Notes*:

     - **Styling**: Customize the button's appearance as needed to fit your application's UI.
     - **State Dependency**: The button's visibility depends on the `videoOn` state, ensuring it's only displayed when video is active.

   - **Track Video State**

     *Purpose*: Maintain the state of the video stream to control UI elements accordingly.

     ```tsx
     const [videoOn, setVideoOn] = useState(false);
     ```

   - **Update `sourceChanged` Effect to Sync Video State**

     *Purpose*: Ensure the React state reflects the current video status from MediaSFU.

     ```tsx
     useEffect(() => {
         if (Object.keys(sourceParameters.current).length > 0) {
             // Update the audio level
             if (sourceParameters.current.audioLevel !== audioLevel) {
                 setAudioLevel(sourceParameters.current.audioLevel);
             }

             // Update mute state
             if (sourceParameters.current.audioAlreadyOn !== !isMuted) {
                 setIsMuted(!sourceParameters.current.audioAlreadyOn);
             }

             // Update video state
             if (sourceParameters.current.videoAlreadyOn !== videoOn) {
                 setVideoOn(sourceParameters.current.videoAlreadyOn);
             }
         }
     }, [sourceChanged]);
     ```

     *Helper Note*: Synchronizing state ensures that UI components accurately reflect the underlying media states managed by MediaSFU.

### 2.3 Add Camera Selection Functionality

To allow users to select specific camera devices, we'll implement a dropdown that lists available video input devices.

1. **Add State to Track Available Cameras**

   ```tsx
   const [selectedVideoInput, setSelectedVideoInput] = useState<string | null>(null);
   const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
   ```

2. **Populate Available Cameras on Video Toggle**

   *Purpose*: When the video is toggled on, fetch and list available video input devices.

   ```tsx
   const handleToggleMic = async () => {
       await toggleVideo({ sourceParameters: sourceParameters.current });

       // Fetch available video input devices
       const devices = await navigator.mediaDevices.enumerateDevices();

       // Filter to get only video input devices
       const videoInputList = devices.filter((device) => device.kind === "videoinput");

       // Update the state with available video inputs
       setVideoInputs(videoInputList);
   };
   ```

   *Helper Note*: Using `enumerateDevices` ensures that users can select from all connected camera devices, enhancing flexibility.

3. **Implement Camera Selection Dropdown**

   *Purpose*: Provide a user interface for selecting specific camera devices.

   ```tsx
   {videoInputs.length > 1 && (
       <div className="mic-controls">
           <label>
               <FaCamera /> Select Camera
           </label>
           <select
               value={selectedVideoInput || ""}
               onChange={(e) => handleSelectCamera(e.target.value)}
               className="form-control"
           >
               {videoInputs.map((input) => (
                   <option key={input.deviceId} value={input.deviceId}>
                       {input.label}
                   </option>
               ))}
           </select>
       </div>
   )}
   ```

   *Helper Notes*:

   - **Conditional Rendering**: The dropdown is only displayed if multiple video input devices are available.
   - **Styling**: Customize the dropdown's appearance to match your application's design language.

4. **Handle Camera Selection**

   *Purpose*: Manage the selection of a specific camera device based on user input.

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

   *Helper Note*: This function ensures that selecting a new camera updates both the UI state and the underlying media stream handled by MediaSFU.

---

## Step 3: Rendering and Transforming Media Data

In this step, we'll focus on rendering video elements within the main and mini grids, as well as transforming media data to fit our application's design needs.

### 3.1 Rendering Video Elements

We'll replace the default `FlexibleGrid` component from `mediasfu-reactjs` with a custom rendering approach to have finer control over video elements.

1. **Locate the `AudioGrid` Component**

   *File Location*: `src/components/SpaceDetails.tsx`

2. **Add Custom Video Grid Rendering**

   ```tsx
   {/* Video Grid */}
   <div className="video-grid">
       {allRoomVideos.current &&
           allRoomVideos.current.map((row, index) => (
               <div
                   key={index}
                   style={{
                       display: "flex",
                       gap: "1rem",
                       flex: 1,
                       justifyContent: "center",
                   }}
               >
                   {row.map((video) => video)}
               </div>
           ))}
   </div>
   ```

   *Helper Notes*:

   - **Flex Layout**: Using Flexbox ensures that video elements are neatly aligned and responsive.
   - **Dynamic Rendering**: Iterates through the `allRoomVideos` state to render each video stream dynamically.

3. **Test Video Rendering**

   - **Join the Room**: Access `http://localhost:3000/meeting/start` in multiple Chrome (browser) profiles.
   - **Verify Video Streams**: Ensure that video streams are displayed within the mini grids.
   - **Switch Cameras**: Test switching cameras and observe the updates in the video grids.

   *Helper Note*: Proper rendering confirms that media streams are being correctly managed and displayed within the application.

### 3.2 Intercepting and Modifying Video Data

To customize the appearance and behavior of video streams, we'll intercept and transform the video data before rendering.

1. **Create a `transforms` Folder**

   *File Location*: `src/components/transforms/`

2. **Create `VideoCardTransformer.tsx`**

   *Purpose*: Enhance the default `VideoCard` component by applying custom styles and overlays.

   ```tsx
   // src/components/transforms/VideoCardTransformer.tsx

   import React from "react";
   import { VideoCard } from "mediasfu-reactjs";
   import "./ParticipantCard.css"; // Import custom styles

   /**
    * Transforms <VideoCard> elements by applying custom styling and overlays.
    *
    * Usage:
    *   <VideoCardTransformer>
    *     <VideoCard ... />
    *   </VideoCardTransformer>
    */
   export function VideoCardTransformer({ children }: { children: React.ReactNode }) {
       return (
           <>
               {React.Children.map(children, (child) => {
                   // Ensure the child is a valid React element
                   if (!React.isValidElement(child)) return child;

                   // Check if the child is a VideoCard
                   if (child.type === VideoCard) {
                       // Extract original props
                       const originalProps = child.props;

                       // Define new props with custom styles and overlays
                       const newProps = {
                           ...originalProps,
                           className: "participant-card", // Apply custom CSS class
                           customStyle: {
                               ...(originalProps.customStyle || {}),
                               width: "120px",
                               height: "120px",
                               borderRadius: "50%", // Make the video rounded
                               position: "relative",
                               overflow: "hidden",
                               boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                               display: "flex",
                               alignItems: "center",
                               justifyContent: "center",
                           },
                           // Add custom overlays for audio status
                           videoControlsComponent: (
                               <div className="participant-audio-status">
                                   {originalProps.participant?.muted ? (
                                       <span className="icon-muted">🔇</span>
                                   ) : (
                                       <span className="icon-active">🎤</span>
                                   )}
                               </div>
                           ),
                           // Add participant name overlay
                           videoInfoComponent: (
                               <div className="participant-name">
                                   {originalProps.participant?.name || "Unnamed"}
                               </div>
                           ),
                       };

                       // Clone the VideoCard element with new props
                       return React.cloneElement(child, newProps);
                   }

                   // If not a VideoCard, return the element unmodified
                   return child;
               })}
           </>
       );
   }
   ```

   *Helper Notes*:

   - **Custom Styling**: Applies a circular frame and shadow to the video streams for a polished look.
   - **Overlays**: Adds indicators for mute status and participant names directly on the video elements.
   - **Cloning Elements**: Uses `React.cloneElement` to inject new props into existing `VideoCard` components without altering their original structure.

3. **Create Custom CSS for Transformed Video Cards**

   *File Location*: `src/components/transforms/ParticipantCard.css`

   ```css
   /* ParticipantCard.css */

   .participant-card {
       background: #fff;
       border-radius: 50%;
       position: relative;
       overflow: hidden;
       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
       transition: transform 0.2s ease, box-shadow 0.2s ease;
       display: flex;
       align-items: center;
       justify-content: center;
   }

   .participant-card:hover {
       transform: translateY(-2px);
       box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
   }

   /* Participant Name Overlay */
   .participant-name {
       position: absolute;
       bottom: 5%;
       width: 90%;
       text-align: center;
       color: #333;
       font-size: 0.8em;
       font-weight: 500;
       background: rgba(255, 255, 255, 0.8);
       padding: 3px 5px;
       border-radius: 12px;
       box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
       overflow: hidden;
       text-overflow: ellipsis;
       white-space: nowrap;
   }

   /* Audio Status Icon Overlay */
   .participant-audio-status {
       position: absolute;
       top: 5%;
       left: 5%;
       background: rgba(0, 0, 0, 0.6);
       color: #fff;
       font-size: 1.2em;
       padding: 6px;
       border-radius: 50%;
       display: flex;
       align-items: center;
       justify-content: center;
       cursor: pointer;
   }

   .icon-muted {
       color: red;
   }

   .icon-active {
       color: green;
   }
   ```

   *Helper Note*: These styles ensure that the video elements are visually appealing and provide clear indicators of participant statuses.

4. **Integrate `VideoCardTransformer` into `SpaceDetails` Component**

   ```tsx
   // src/components/SpaceDetails.tsx

   import { VideoCardTransformer } from "./transforms/VideoCardTransformer";
   ```

5. **Modify Video Grid Rendering to Use Transformer**

   ```tsx
   {/* Video Grid */}
   <div className="video-grid">
       {allRoomVideos.current &&
           allRoomVideos.current.map((row, index) => (
               <div
                   key={index}
                   style={{
                       display: "flex",
                       gap: "1rem",
                       flex: 1,
                       justifyContent: "center",
                   }}
               >
                   <VideoCardTransformer>{row}</VideoCardTransformer>
                   {/* Original rendering commented out */}
                   {/* {row.map((video) => video)} */}
               </div>
           ))}
   </div>
   ```

   *Helper Note*: By wrapping video rows with `VideoCardTransformer`, all `VideoCard` components within are automatically styled and enhanced.

6. **Test Transformed Video Rendering**

   - **Join the Room**: Access `http://localhost:3000/meeting/start` in multiple Chrome (browser) profiles.
   - **Verify Styling**: Confirm that video streams appear with circular frames, shadows, and overlays indicating mute status and participant names.
   - **Switch Cameras**: Test switching cameras and observe the updates in the transformed video grids.

   *Helper Note*: Proper styling confirms that media streams are being intercepted and modified as intended.

### 3.3 Rendering MediaStreams Directly

In addition to transforming JSX elements, you can also handle MediaStreams directly for more granular control over video rendering.

1. **Track All Video Streams**

   ```tsx
   const allRoomVideoStreams = useRef<(Participant | Stream)[]>([]);
   ```

2. **Update `useEffect` to Sync Video Streams**

   ```tsx
   useEffect(() => {
       if (sourceParameters.current.allVideoStreams !== allRoomVideoStreams.current) {
           allRoomVideoStreams.current = sourceParameters.current.allVideoStreams;
       }
   }, [sourceChanged]);
   ```

3. **Modify `ParticipantCard` to Accept MediaStream**

   *File Location*: `src/components/ParticipantCard.tsx`

   ```tsx
   // src/components/ParticipantCard.tsx

   import React, { useRef, useEffect } from "react";
   import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
   import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
   import "./ParticipantCard.css";

   export interface ParticipantCardProps {
       participant: ParticipantData;
       currentUserId?: string;
       isHost: boolean;
       onMute: (id: string) => void;
       onToggleMic?: (participant: ParticipantData) => void;
       onRemove: (id: string) => void;
       space?: Space;
       video?: MediaStream;
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
       const videoRef = useRef<HTMLVideoElement>(null);

       useEffect(() => {
           if (videoRef.current && video && videoRef.current.srcObject !== video) {
               videoRef.current.srcObject = video;
           }
       }, [video]);

       useEffect(() => {
           setIsMuted(participant?.muted || false);
       }, [participant?.muted]);

       const [isMuted, setIsMuted] = useState(participant?.muted || false);

       return (
           <div className="participant-card-alt">
               {!video ? (
                   <img
                       src={participant.avatarUrl || "https://www.mediasfu.com/logo192.png"}
                       alt={participant.displayName}
                       className="participant-avatar"
                   />
               ) : (
                   <video
                       ref={videoRef}
                       autoPlay
                       playsInline
                       muted
                       className="participant-avatar"
                   />
               )}
               {isHost && (
                   <div className="controls">
                       <button onClick={() => onMute(participant.id)}>
                           {isMuted ? <FontAwesomeIcon icon={faMicrophoneSlash} /> : <FontAwesomeIcon icon={faMicrophone} />}
                       </button>
                       <button onClick={() => onRemove(participant.id)}>Remove</button>
                   </div>
               )}
           </div>
       );
   };

   export default ParticipantCard;
   ```

   *Helper Notes*:

   - **MediaStream Integration**: The `video` prop allows the component to render the participant's video stream directly.
   - **Ref Management**: `videoRef` ensures that the video element correctly references the MediaStream.

4. **Pass MediaStream to `ParticipantCard`**

   ```tsx
   // src/components/SpaceDetails.tsx

   <ParticipantCard
       participant={p}
       isHost={isHost}
       onMute={handleMuteParticipant}
       onRemove={handleRemoveParticipant}
       video={videoStream!}
   />
   ```

   *Helper Note*: Passing the `videoStream` prop enables the `ParticipantCard` to render the video stream for each participant.

5. **Test Direct MediaStream Rendering**

   - **Join the Room**: Access `http://localhost:3000/meeting/start` in multiple Chrome (browser) profiles.
   - **Verify Direct Rendering**: Ensure that video streams are displayed within the `ParticipantCard` components.
   - **Switch Cameras**: Test camera switching and observe updates in the video streams.

   *Helper Note*: Direct rendering offers enhanced control over how video streams are displayed and managed within your application.

---

## Step 4: Building a Custom `MediasfuGeneric` Component

To achieve a higher level of customization, we'll build our own `MediasfuGeneric` component, replacing the default one provided by `mediasfu-reactjs`.

### 4.1 Create Custom `addVideosGrid` Function

1. **Create `addVideosGrid.tsx`**

   *File Location*: `src/components/custom/addVideosGrid.tsx`

   ```tsx
   // src/components/custom/addVideosGrid.tsx

   import React from "react";
   import { MiniCard, AudioCard, Participant, Stream, UpdateMiniCardsGridType, UpdateMiniCardsGridParameters, AudioCardParameters, EventType } from "mediasfu-reactjs";
   import VideoCard from "./VideoCard"; // Import custom VideoCard

   export interface AddVideosGridProps {
       participants: Participant[];
       streams: Stream[];
       eventType: EventType;
   }

   export const addVideosGrid = ({ participants, streams, eventType }: AddVideosGridProps) => {
       return participants.map((participant) => {
           const stream = streams.find((s) => s.producerId === participant.videoID)?.stream;
           return (
               <VideoCard
                   key={`video-${participant.id}`}
                   videoStream={stream || new MediaStream()}
                   customStyle={{
                       border: eventType !== "broadcast" ? "2px solid black" : "0px solid black",
                   }}
                   participant={participant}
                   showControls={false}
                   showInfo={false}
                   name={participant.name}
               />
           );
       });
   };
   ```

   *Helper Notes*:

   - **Custom `VideoCard`**: Utilizes the custom `VideoCard` component for enhanced styling and functionality.
   - **Dynamic Styling**: Applies conditional borders based on the event type, allowing for flexible UI designs.

### 4.2 Create a Custom `VideoCard` Component

   *File Location*: `src/components/custom/VideoCard.tsx`

   ```tsx
   // src/components/custom/VideoCard.tsx

   import React, { useState, useEffect, useRef } from "react";
   import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
   import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
   import "./ParticipantCard.css"; // Import custom styles

   export interface VideoCardOptions {
       name: string;
       videoStream?: MediaStream;
       participant?: any;
       customStyle?: React.CSSProperties;
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
           if (videoStream && videoRef.current) {
               videoRef.current.srcObject = videoStream;
               videoRef.current.play().catch((err) => console.error("Video playback error:", err));
           }
       }, [videoStream]);

       useEffect(() => {
           setIsMuted(participant?.muted || false);
       }, [participant?.muted]);

       return (
           <div className="participant-card-alt" style={customStyle}>
               {/* Video Element */}
               <video
                   ref={videoRef}
                   className="participant-video"
                   muted={isMuted}
                   autoPlay
                   playsInline
               ></video>

               {/* Name Tag */}
               {showInfo && <div className="participant-name">{name}</div>}

               {/* Mic/Audio Status */}
               {showControls && (
                   <div className="participant-audio-status">
                       <FontAwesomeIcon
                           icon={isMuted ? faMicrophoneSlash : faMicrophone}
                           className={isMuted ? "icon-muted" : "icon-active"}
                       />
                   </div>
               )}
           </div>
       );
   };

   export default VideoCard;
   ```

   *Helper Notes*:

   - **Custom Overlays**: Displays mute status and participant names directly on the video elements.
   - **Styling Consistency**: Ensures that video elements maintain a consistent and polished appearance across the application.

3. **Create Custom CSS for Video Cards**

   *File Location*: `src/components/custom/ParticipantCard.css`

   ```css
   /* ParticipantCard.css */

   .participant-card-alt {
       background: #fff;
       width: 120px;
       height: 120px;
       border-radius: 50%; /* Rounded card */
       position: relative;
       overflow: hidden;
       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
       transition: transform 0.2s ease, box-shadow 0.2s ease;
       display: flex;
       align-items: center;
       justify-content: center;
   }

   .participant-card-alt:hover {
       transform: translateY(-2px); /* Elevation on hover */
       box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
   }

   /* Video Element */
   .participant-card-alt .participant-video {
       width: 100%;
       height: 100%;
       border-radius: 50%; /* Matches card rounding */
       object-fit: cover;
   }

   /* Name Tag */
   .participant-card-alt .participant-name {
       position: absolute;
       bottom: 5%; /* Positioned at the bottom */
       width: 90%; /* Slight padding from the edges */
       text-align: center;
       color: #333;
       font-size: 0.8em;
       font-weight: 500;
       background: rgba(255, 255, 255, 0.8); /* Semi-transparent background */
       padding: 3px 5px;
       border-radius: 12px; /* Slightly rounded tag */
       box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
       overflow: hidden;
       text-overflow: ellipsis;
       white-space: nowrap;
   }

   /* Audio Status Icon */
   .participant-card-alt .participant-audio-status {
       position: absolute;
       top: 5%; /* Positioned at the top-left */
       left: 5%;
       background: rgba(0, 0, 0, 0.6); /* Semi-transparent black */
       color: #fff;
       font-size: 1.2em;
       padding: 6px;
       border-radius: 50%;
       display: flex;
       align-items: center;
       justify-content: center;
       cursor: pointer;
   }

   .icon-muted {
       color: red;
   }

   .icon-active {
       color: green;
   }
   ```

   *Helper Note*: These styles ensure that the video elements are visually appealing and provide clear indicators of participant statuses.

### 4.3 Create the `MediasfuGenericAlt.tsx` File

To gain deeper control over how video and audio streams are rendered, we'll create a **custom** `MediasfuGenericAlt` component. This involves copying the original `MediasfuGeneric.tsx` file, modifying its imports, and integrating our custom `addVideosGrid` function. 

You can just follow these as a thorough guide to create your own `MediasfuGenericAlt` component or you can directly use the `MediasfuGenericAlt.tsx` file provided in this repository.


1. **Create a New File:**
   
   - **File Location:** `src/components/custom/MediasfuGenericAlt.tsx`
   - **Action:** Create a new file named `MediasfuGenericAlt.tsx` within the `custom` folder inside your `components` directory.

2. **Copy Original `MediasfuGeneric.tsx` Code:**
   
   - Navigate to the original `MediasfuGeneric.tsx` file in the `mediasfu-reactjs` package (you can find it [here](https://github.com/MediaSFU/MediaSFU-ReactJS/blob/main/src/components/mediasfuComponents/MediasfuGeneric.tsx)).
   - **Copy** all the code from `MediasfuGeneric.tsx` and **paste** it into your newly created `MediasfuGenericAlt.tsx` file.

3. **Modify Imports:**
   
   - **Replace Local Imports with `mediasfu-reactjs`:**
     
     - **Delete Lines 33-210:** Remove the block of code from `import { initialValuesState } from` up to (but not including) the line `import { Socket } from "socket.io-client";`.
     
     - **Import Necessary Exports from `mediasfu-reactjs`:**
       
       - Visit the [`main.tsx`](https://github.com/MediaSFU/MediaSFU-ReactJS/blob/main/src/main.tsx) file in the `mediasfu-reactjs` repository to identify the necessary exports.
       - **Copy** all exports listed at the end of `main.tsx` (lines 404 - 428) and **paste** them at the top of your `MediasfuGenericAlt.tsx` file (around line 32).
       - **Adjust Imports:** Change these imports to come from `'mediasfu-reactjs'` instead of relative paths and **remove** the `export` keyword from each import.

     - **Fix Type Imports:**
       
       - **Replace Type Imports:** Change any import paths like `"../../@types/types"` to `"mediasfu-reactjs"`.
       - **Remove Duplicate Imports:** For example, delete any lines like `import { createResponseJoinRoom } from` if they are duplicates.
       - **Update Specific Imports:** For instance, change `import { WelcomeOptions } from "../../@types/types";` to `import { WelcomeOptions } from "mediasfu-reactjs";`.

     - **Remove Unneeded Default Views:**
       
       - Delete lines importing default views such as `MediasfuGeneric`, `MediasfuBroadcast`, `MediasfuWebinar`, `MediasfuConference`, and `MediasfuChat` if they are not required.

     - **Update Missing Imports:**
       
       - Replace `mediaDevices: mediaDevices` with `navigator.mediaDevices` wherever applicable (search and replace).
       - Ensure that `OtherGridComponent` is properly capitalized.
       - **Clean Up:** Right-click and clear all unused imports to tidy up the file.

4. **Integrate Custom `addVideosGrid` Function:**
   
   - **Import `addVideosGrid`:**
     
     ```tsx
     import { addVideosGrid } from "./addVideosGrid"; // Ensure correct path
     ```

   - **Replace Default `addVideosGrid` Usage:**
     
     - Locate where the original `addVideosGrid` function is used within `MediasfuGeneric.tsx`.
     - **Replace** it with your custom `addVideosGrid` function. This typically involves substituting the existing function call or reference with your imported version.

5. **Handle CSS:**
   
   - **Create `MediasfuCSS.css`:**
     
     - **File Location:** `src/components/custom/MediasfuCSS.css`
     - **Action:** Create a new CSS file. Since you're operating in no-UI mode, you can leave it empty or add custom styles as needed.
     
     ```css
     /* src/components/custom/MediasfuCSS.css */

     /* Custom styles can be added here if needed */
     ```

   - **Import CSS in `MediasfuGenericAlt.tsx`:**
     
     ```tsx
     import "./MediasfuCSS.css"; // Import the custom CSS file
     ```

6. **Finalize `MediasfuGenericAlt.tsx`:**
   
   - **Ensure Correct Component Naming:**
     
     - Rename the component within the file from `MediasfuGeneric` to `MediasfuGenericAlt`.
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

   - **Remove Unnecessary Code:**
     
     - Since you've replaced specific functions and imports, ensure that any leftover code referencing the original `addVideosGrid` or other unneeded functions is removed to prevent conflicts.

### 4.2 Integrate `MediasfuGenericAlt` into `MediaSFUHandler`

1. **Update `MediaSFUHandler.tsx`:**
   
   - **File Location:** `src/components/MediaSFUHandler.tsx`
   
   - **Import the Custom Component:**
     
     ```tsx
     import MediasfuGenericAlt from "./custom/MediasfuGenericAlt";
     ```

   - **Replace Default `MediasfuGeneric` with `MediasfuGenericAlt`:**
     
     ```tsx
     // Original import
     // import { MediasfuGeneric } from "mediasfu-reactjs";

     // Updated component usage
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
         <MediasfuGenericAlt
           action={action}
           duration={duration}
           capacity={capacity}
           name={name}
           meetingID={meetingID}
           sourceParameters={sourceParameters}
           updateSourceParameters={updateSourceParameters}
         />
       );
     };

     export default MediaSFUHandler;
     ```

   - **Explanation:**
     
     - **Why Replace?** By using `MediasfuGenericAlt`, you ensure that your custom `addVideosGrid` function and any other customizations are integrated into the MediaSFU handling logic.
     - **Props Passing:** All necessary props (`action`, `duration`, `capacity`, etc.) are passed to `MediasfuGenericAlt` to manage room creation and joining effectively.

### 4.3 Update `SpaceDetails` to Use the Custom Component

1. **Modify the Rendering Logic:**
   
   - **File Location:** `src/components/SpaceDetails.tsx`
   
   - **Replace Default MediaSFU Handler:**
     
     ```tsx
     // Original rendering
     {/* <MediasfuGeneric ... /> */} // This line might be present

     // Updated rendering to use MediaSFUHandler
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

   - **Explanation:**
     
     - **Integration Point:** By updating `SpaceDetails.tsx` to use `MediaSFUHandler`, which now leverages `MediasfuGenericAlt`, all your custom video grid logic is applied throughout the application.

### 4.4 Testing the Custom `MediasfuGenericAlt` Component

1. **Run Your Application:**
   
   - Start your React application using `npm start` or your preferred method.

2. **Join/Create a Room:**
   
   - Access your application at `http://localhost:3000/meeting/start`.
   - **Test Creating a Room:** Ensure that when creating a room, the custom video grid renders as expected.
   - **Test Joining a Room:** Join an existing room and verify that the video and audio streams display with your custom `addVideosGrid` logic.

3. **Verify Customizations:**
   
   - **Video Grid Layout:** Check that the video elements are rendered according to your custom `addVideosGrid` function.
   - **Styling:** Ensure that all custom styles (e.g., rounded video cards, audio status overlays) are applied correctly.
   - **Functionality:** Test video toggling, camera switching, and selecting specific cameras to confirm that they work seamlessly with the custom component.

4. **Troubleshoot if Necessary:**
   
   - **Console Errors:** Look out for any errors in the browser console that might indicate issues with imports or component logic.
   - **Styling Issues:** If styles aren’t applying as expected, verify that the CSS files are correctly imported and that class names match.

---

**Helper Notes:**

- **Custom Component Benefits:** Creating a custom `MediasfuGenericAlt` allows you to tailor the media rendering logic precisely to your project's needs without being constrained by the default `mediasfu-reactjs` implementations.
  
- **Maintainability:** By isolating custom logic within `MediasfuGenericAlt` and related custom components (like `VideoCard` and `addVideosGrid`), you ensure that future updates to `mediasfu-reactjs` can be integrated with minimal conflict.

- **Scalability Considerations:** While customizing, always consider the performance implications, especially when handling a large number of media streams. Optimize your `addVideosGrid` function and component rendering logic to maintain application responsiveness.


5. **Integrate `MediasfuGenericAlt` into `MediaSFUHandler`**

   ```tsx
   // src/components/MediaSFUHandler.tsx

   import React, { useRef } from "react";
   import { MediasfuGenericAlt } from "./custom/MediasfuGenericAlt";
   import PreJoinPage from "./PreJoinPage"; // Ensure PreJoinPage is correctly imported

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
           <MediasfuGenericAlt
               action={action}
               duration={duration}
               capacity={capacity}
               name={name}
               meetingID={meetingID}
               sourceParameters={sourceParameters}
               updateSourceParameters={updateSourceParameters}
           />
       );
   };

   export default MediaSFUHandler;
   ```

   *Helper Note*: This integration ensures that the custom `MediasfuGenericAlt` component is utilized within the application, enabling advanced video handling features.

6. **Finalize Video Grid Rendering in `SpaceDetails`**

   ```tsx
   // src/components/SpaceDetails.tsx

   {/* Video Grid */}
   <div className="video-grid">
       {allRoomVideos.current &&
           allRoomVideos.current.map((row, index) => (
               <div
                   key={index}
                   style={{
                       display: "flex",
                       gap: "1rem",
                       flex: 1,
                       justifyContent: "center",
                   }}
               >
                   {/* Commented out default transformer */}
                   {/* <VideoCardTransformer>{row}</VideoCardTransformer> */}
                   {/* Render videos directly */}
                   {row.map((video) => video)}
               </div>
           ))}
   </div>
   ```

   *Helper Note*: By commenting out the default `VideoCardTransformer` and rendering videos directly, you gain more control over how video streams are displayed and managed.

7. **Test the Advanced Video Rendering**

   - **Join the Room**: Access `http://localhost:3000/meeting/start` in multiple Chrome (browser) profiles.
   - **Verify Video Streams**: Ensure that video streams are displayed within the custom video grids.
   - **Switch Cameras and Select Specific Cameras**: Test the new video control functionalities to confirm their effectiveness.

   *Helper Note*: Successful testing confirms that advanced video functionalities are correctly implemented and operational.

---

## Step 5: Final Testing and Refinements

With all advanced features implemented, it's time to conduct thorough testing and make necessary refinements to ensure a seamless user experience.

### 5.1 Comprehensive Functionality Testing

1. **Multiple Participants**

   - **Host and Guests**: Use different Chrome profiles to simulate host and guest participants.
   - **Video Controls**: Test toggling video, switching cameras, and selecting specific cameras across multiple participants.
   - **Participant Management**: As the host, mute and remove participants to ensure controls are functioning as intended.

2. **Visual Consistency**

   - **Custom Video Cards**: Verify that all video streams are displayed with the custom styling and overlays.
   - **Audio Indicators**: Ensure that audio status icons correctly reflect the mute state of participants.

3. **Error Handling**

   - **Invalid Actions**: Attempt to perform invalid actions (e.g., switching cameras when no additional cameras are available) and verify that the application handles them gracefully.
   - **Connection Issues**: Simulate network disruptions to ensure that the application responds appropriately.

   *Helper Note*: Rigorous testing ensures that all features work harmoniously and that the application can handle edge cases effectively.

### 5.2 UI Refinements

1. **Responsive Design**

   - **Different Screen Sizes**: Test the application on various screen sizes to ensure that video grids and controls adjust appropriately.
   - **Orientation Changes**: On devices supporting orientation changes (e.g., tablets, phones), verify that the UI adapts seamlessly.

2. **Accessibility Enhancements**

   - **Keyboard Navigation**: Ensure that all interactive elements (buttons, dropdowns) are accessible via keyboard navigation.
   - **Screen Readers**: Verify that labels and controls are correctly interpreted by screen readers for visually impaired users.

   *Helper Note*: Enhancing accessibility broadens your application's usability, making it inclusive for all users.

3. **Performance Optimization**

   - **Stream Handling**: Monitor the application's performance with multiple active video streams to identify and address potential bottlenecks.
   - **Lazy Loading**: Implement lazy loading for video streams to improve initial load times and reduce unnecessary resource consumption.

   *Helper Note*: Optimizing performance ensures that the application remains responsive and efficient, even under high load conditions.

### 5.3 Final Comments

- **Focus on UI Styling**: Most of the advanced functionalities revolve around UI enhancements. Tailor the styling to match your application's branding and user experience goals.
- **Leverage Automation Tools**: Utilize tools like CSS preprocessors or CSS-in-JS libraries to streamline the styling process.
- **Scalability Considerations**: While MediaSFU supports a high number of concurrent streams, rendering a vast number of video elements can tax client resources. Implement pagination or dynamic loading strategies to maintain optimal performance.

   *Helper Note*: Balancing feature richness with performance ensures that your application remains both functional and efficient.

- **Future Enhancements**: This guide covers foundational advanced features. Future iterations can explore more complex functionalities like breakout rooms, virtual backgrounds, and real-time video transformations.

---

## Conclusion

Congratulations! You've successfully navigated the complexities of advanced `mediasfu-reactjs` integration within the SpacesTek project. This guide has equipped you with the knowledge to render and transform media data, build custom components, and implement sophisticated video control functionalities.

**Key Takeaways:**

- **Advanced Video Handling**: Enhanced control over video streams allows for a more dynamic and interactive user experience.
- **Custom Component Development**: Building custom components like `VideoCard` and `MediasfuGenericAlt` provides flexibility to tailor media rendering to your specific needs.
- **State Synchronization**: Maintaining synchronization between React state and MediaSFU's internal state ensures that the UI accurately reflects current media statuses.
- **Performance and Accessibility**: Optimizing performance and enhancing accessibility are crucial for delivering a robust and inclusive application.

**Next Steps:**

- **Explore Additional Features**: Delve into more advanced MediaSFU capabilities such as screen sharing, whiteboards, and real-time video effects.
- **Implement Virtual Backgrounds**: Utilize MediaSFU's APIs to add virtual background functionalities, enhancing user privacy and customization.
- **Expand Participant Management**: Develop more sophisticated participant management tools, including roles, permissions, and interactive controls.

Thank you for following through this advanced guide. Your enhanced MediaSFU integration empowers your application to deliver a rich, interactive, and seamless communication experience. Stay tuned for further tutorials that explore even more sophisticated integrations and functionalities with MediaSFU.