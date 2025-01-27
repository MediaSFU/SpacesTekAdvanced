# Advanced MediaSFU Integration Guide For Angular

## Overview

Welcome to the advanced guide on using the `mediasfu-angular` package within your Angular project. This guide builds upon the foundational integration covered in the previous tutorial, delving deeper into video-centric functionalities. By the end of this guide, you'll have a comprehensive understanding of rendering, transforming, and customizing video streams using MediaSFU's Angular SDK.

**Prerequisites**:
- Completion of the [Basic `mediasfu-angular` Integration Guide](#) (ensure you have set up audio transmission before proceeding).
- Familiarity with Angular components, services, and state management.
- Basic understanding of MediaSFU and its functionalities.

---

## Table of Contents

1. [Step 1: Introduction](#step-1-introduction)
2. [Step 2: Implementing New Video Features](#step-2-implementing-new-video-features)
3. [Step 3: Rendering and Transforming Media Data](#step-3-rendering-and-transforming-media-data)
    - [3.1 Rendering Video Grids](#31-rendering-video-grids)
    - [3.2 Getting Video Streams for Participants](#32-getting-video-streams-for-participants)
        - [Option 1: Using `allRoomVideos`](#option-1-using-allroomvideos)
        - [Option 2: Using `allVideoStreams`](#option-2-using-allvideostreams)
    - [3.3 Handling Media Streams in Participant Cards](#33-handling-media-streams-in-participant-cards)
4. [Step 4: Building a Custom `MediasfuGenericAlt` Component](#step-4-building-a-custom-mediasfugenericalt-component)
5. [Conclusion](#conclusion)

---

## Step 1: Introduction

### 1.1 Continuation of the Previous Guide

This guide serves as a **continuation** of the [Basic `mediasfu-angular` Integration Guide](#). If you haven't completed the initial setup and audio transmission integration, please refer to the previous guide before proceeding.

### 1.2 Focus on Advanced `mediasfu-angular` Features

In this advanced tutorial, we'll shift our focus from **audio-centric** functionalities to **video-centric** features. Specifically, we'll explore:

- **Rendering Custom HTML Elements for Video**:
  - Building and styling video grids for an enhanced user interface.
  
- **Intercepting and Modifying Video Data**:
  - Manipulating video streams before rendering to apply custom transformations.
  
- **Utilizing `MediaStream` for Custom Video Rendering**:
  - Leveraging the `MediaStream` API to render video data in bespoke components.
  
- **Building a Custom `MediasfuGenericAlt` Component**:
  - Developing a tailored version of the `MediasfuGeneric` component to accommodate unique video rendering requirements.

**Helper Note**: By focusing on video, you'll enhance the visual interaction within your application, making it more engaging and user-friendly.

---

## Step 2: Implementing New Video Features

### 2.1 Enhancing the `UseMediasfuSdkService` Service

To manage video functionalities effectively, we'll extend the existing `UseMediasfuSdkService` service with additional methods.

1. **Locate the Service File**:
   - Navigate to `src/app/services/use-mediasfu-sdk.service.ts`.

2. **Add New Methods for Video Control**:
   - **`toggleVideo`**: Enables users to turn their video streams on or off.
   - **`switchCamera`**: Allows users to switch between front and back cameras.
   - **`selectCamera`**: Facilitates the selection of a specific camera device.

3. **Implement `toggleVideo` Method**

   **Explanation**:
   - Utilizes MediaSFU's in-built `clickVideo` function to toggle the video stream.
   
   ```typescript
   // src/app/services/use-mediasfu-sdk.service.ts

   import { Injectable } from '@angular/core';
   import {
     ClickAudioOptions,
     clickAudio,
     ClickVideoOptions,
     clickVideo,
     ConfirmExitOptions,
     confirmExit,
     ControlMediaOptions,
     Participant,
     removeParticipants,
     SwitchVideoAltOptions,
     switchVideoAlt,
     SwitchVideoOptions,
     switchVideo,
     SelectVideoOptions,
     selectVideo,
   } from 'mediasfu-angular';

   export interface UseAudioVideoSDKProps {
     sourceParameters: Record<string, any>;
     deviceId?: string;
   }

   export interface MediaControlsProps {
     sourceParameters: Record<string, any>;
     remoteMember: string;
     mediaType?: 'audio' | 'video' | 'screenshare' | 'all';
   }

   @Injectable({
     providedIn: 'root',
   })
   export class UseMediasfuSdkService {
     constructor(
       private clickVideo: clickVideo, // Injected service
       private switchVideoAlt: switchVideoAlt, // Injected service
       private switchVideo: switchVideo, // Injected service
       private selectVideo: selectVideo // Injected service
     ) {}

     /**
      * Disconnects the user from the current room.
      */
     async disconnectRoom({ sourceParameters }: UseAudioVideoSDKProps): Promise<void> {
       try {
         if (Object.keys(sourceParameters).length > 0) {
           const options: ConfirmExitOptions = {
             member: sourceParameters['member'],
             socket: sourceParameters['socket'],
             localSocket: sourceParameters['localSocket']!,
             roomName: sourceParameters['roomName'],
             ban: false,
           };

           await confirmExit(options);
         }
       } catch (error) {
         console.error('Error disconnecting room:', error);
       }
     }

     /**
      * Toggles the user's audio on or off.
      */
     async toggleAudio({ sourceParameters }: UseAudioVideoSDKProps): Promise<void> {
       try {
         if (Object.keys(sourceParameters).length > 0) {
           const options: ClickAudioOptions = {
             parameters: sourceParameters as ClickAudioOptions['parameters'],
           };

           await clickAudio(options);
         }
       } catch (error) {
         console.error('Error toggling audio:', error);
       }
     }

     /**
      * Toggles the user's video on or off.
      */
     async toggleVideo({ sourceParameters }: UseAudioVideoSDKProps): Promise<void> {
       try {
         if (Object.keys(sourceParameters).length > 0) {
           const options: ClickVideoOptions = {
             parameters: sourceParameters as ClickVideoOptions['parameters'],
           };
           await this.clickVideo.clickVideo(options);
         }
       } catch (error) {
         console.error('Error toggling video:', error);
       }
     }

     /**
      * Switches between front and back cameras.
      */
     async switchCamera({ sourceParameters }: UseAudioVideoSDKProps): Promise<void> {
       try {
         if (Object.keys(sourceParameters).length > 0) {
           const options: SwitchVideoAltOptions = {
             parameters: sourceParameters as SwitchVideoAltOptions['parameters'],
           };
           await this.switchVideoAlt.switchVideoAlt(options);
         }
       } catch (e) {
         console.error('Error switching camera:', e);
       }
     }

     /**
      * Selects a specific camera device.
      */
     async selectCamera({ sourceParameters, deviceId }: UseAudioVideoSDKProps): Promise<void> {
       try {
         if (Object.keys(sourceParameters).length > 0) {
           if (!deviceId) {
             throw new Error('Device ID is required to select camera');
           }

           const options: SelectVideoOptions = {
             parameters: sourceParameters as SelectVideoOptions['parameters'],
             deviceId: deviceId,
           };
           await this.selectVideo.selectVideo(options);
         }
       } catch (e) {
         console.error('Error selecting camera:', e);
       }
     }

     /**
      * Restricts media (e.g., mutes a participant) in the room.
      */
     async restrictMedia({ sourceParameters, remoteMember, mediaType }: MediaControlsProps): Promise<void> {
       try {
         if (Object.keys(sourceParameters).length > 0) {
           const isHost = sourceParameters['islevel'] === '2';

           if (!isHost) {
             console.error('You must be the host to restrict media.');
             return;
           }

           const participant = sourceParameters['participants'].find((p: Participant) => p.name === remoteMember);

           if (!participant) {
             console.error('Participant not found:', remoteMember);
             return;
           }

           const options: ControlMediaOptions = {
             participantId: participant.id || '',
             participantName: participant.name,
             type: mediaType!,
             socket: sourceParameters['socket'],
             roomName: sourceParameters['roomName'],
             coHostResponsibility: sourceParameters['coHostResponsibility'],
             showAlert: sourceParameters['showAlert'],
             coHost: sourceParameters['coHost'],
             participants: sourceParameters['participants'],
             member: sourceParameters['member'],
             islevel: sourceParameters['islevel'],
           };

           await controlMedia(options);
         }
       } catch (error) {
         console.error('Error restricting media:', error);
       }
     }

     /**
      * Removes a participant from the room.
      */
     async removeMember({ sourceParameters, remoteMember }: MediaControlsProps): Promise<void> {
       try {
         if (Object.keys(sourceParameters).length > 0) {
           const isHost = sourceParameters['islevel'] === '2';

           if (!isHost) {
             console.error('You must be the host to remove a member.');
             return;
           }

           const participant = sourceParameters['participants'].find((p: Participant) => p.name === remoteMember);

           if (!participant) {
             console.error('Participant not found:', remoteMember);
             return;
           }

           const options: RemoveParticipantsOptions = {
             coHostResponsibility: sourceParameters['coHostResponsibility'],
             participant: participant,
             member: sourceParameters['member'],
             islevel: sourceParameters['islevel'],
             showAlert: sourceParameters['showAlert'],
             coHost: sourceParameters['coHost'],
             participants: sourceParameters['participants'],
             socket: sourceParameters['socket'],
             roomName: sourceParameters['roomName'],
             updateParticipants: sourceParameters['updateParticipants'],
           };

           await removeParticipants(options);
         }
       } catch (error) {
         console.error('Error removing member:', error);
       }
     }
   }
   ```

   **Helper Notes**:
   - **`toggleVideo` Method**:
     - Utilizes MediaSFU's `clickVideo` function to toggle the user's video stream.
     - Ensures that the video stream state is managed effectively.
   
   - **`switchCamera` Method**:
     - Leverages MediaSFU's `switchVideoAlt` function to switch between available camera devices.
     - Enhances user control over their video input source.
   
   - **`selectCamera` Method**:
     - Allows users to select a specific camera device by providing the device ID.
     - Useful in environments with multiple camera devices.

4. **Update Service Constructor**

   **Explanation**:
   - Injects the necessary MediaSFU services (`clickVideo`, `switchVideoAlt`, `switchVideo`, `selectVideo`) into the `UseMediasfuSdkService` for managing video functionalities.
   
   ```typescript
   // src/app/services/use-mediasfu-sdk.service.ts

   constructor(
     private clickVideo: clickVideo, // Injected service
     private switchVideoAlt: switchVideoAlt, // Injected service
     private switchVideo: switchVideo, // Injected service
     private selectVideo: selectVideo // Injected service
   ) {}
   ```

   **Helper Notes**:
   - **Service Injection**:
     - Ensures that the service has access to the necessary MediaSFU functionalities for video management.

5. **Summary**

   By extending the `UseMediasfuSdkService` with video control methods, we've empowered the service to handle comprehensive video functionalities, including toggling video streams, switching cameras, and selecting specific camera devices. These enhancements lay the groundwork for a more interactive and visually engaging application.

---

## Step 3: Rendering and Transforming Media Data

In this step, we'll focus on rendering video streams within your application. We'll explore two approaches to fetching and displaying video streams for participants:

1. **Option 1**: Using `allRoomVideos` (HTML elements/components).
2. **Option 2**: Using `allVideoStreams` (MediaStream objects).

Both approaches ensure that video streams are accurately rendered within participant cards, enhancing the user experience.

### 3.1 Rendering Video Grids

To display video streams effectively, we'll render custom HTML elements for both the main grid and mini grids.

1. **Modify HTML Template to Render Video Grids**

   **Explanation**:
   - Replaces the existing `AudioGrid` and `FlexibleGrid` components with custom video grid implementations.
   
   ```html
   <!-- src/app/components/space-details/space-details.component.html -->

   <!-- Audio Level Visualizer -->
   <app-audio-level-bars
     *ngIf="isConnected | async"
     [audioLevel]="audioLevel.value"
   ></app-audio-level-bars>

   <!-- Custom Video Grid -->
   <div
     class="video-grid"
     *ngIf="allRoomVideos?.length && allRoomVideos.length > 0"
   >
     <div
       *ngFor="let row of allRoomVideos"
       class="video-row"
     >
       <app-flexible-grid
         *ngIf="row?.length && row.length > 0"
         [customWidth]="400"
         [customHeight]="300"
         [rows]="1"
         [columns]="row.length"
         [componentsToRender]="row"
         [backgroundColor]="'rgba(217, 227, 234, 0.99)'"
       ></app-flexible-grid>
     </div>
   </div>

   <!-- MediaSFU Handler -->
   <app-media-sfu-handler
     *ngIf="showRoom.value"
     [options]="showRoomDetails.value!"
   ></app-media-sfu-handler>
   ```

   **Helper Notes**:
   - **Custom Video Grid**:
     - Utilizes the `FlexibleGrid` component to render video streams in a grid layout.
     - The grid dynamically adjusts based on the number of video streams (`allRoomVideos`).
   
   - **Styling**:
     - The `backgroundColor` can be customized to match your application's theme.
   
   - **Responsive Design**:
     - Ensure that the grid layout is responsive, adapting to different screen sizes and orientations.

2. **Import `FlexibleGrid` Component**

   **Explanation**:
   - Imports the `FlexibleGrid` component from `mediasfu-angular` to handle dynamic grid layouts.
   
   ```typescript
   // src/app/components/space-details/space-details.component.ts

   import { FlexibleGrid } from 'mediasfu-angular';
   ```

3. **Add `FlexibleGrid` to Imports Array**

   **Explanation**:
   - Includes the `FlexibleGrid` component in the component's imports to make it available within the template.
   
   ```typescript
   @Component({
     selector: 'app-space-details',
     standalone: true,
     imports: [
       CommonModule,
       ParticipantCardComponent,
       MediaSfuHandlerComponent,
       AudioLevelBarsComponent,
       AudioGridComponent,
       FlexibleGridComponent,
       VideoCardTransformerComponent,
       VideoCard,
       FlexibleGrid, // Imported here
       FontAwesomeModule,
     ],
     templateUrl: './space-details.component.html',
     styleUrls: ['./space-details.component.css'],
     providers: [UseMediasfuSdkService],
   })
   export class SpaceDetailsComponent implements OnInit {
     // ... component logic
   }
   ```

4. **Summary**

   By implementing custom video grids, we've established a structured and visually appealing way to display multiple video streams, enhancing the overall user experience.

---

### 3.2 Getting Video Streams for Participants

To accurately render video streams within participant cards, we'll implement two approaches:

1. **Option 1**: Using `allRoomVideos` (HTML elements/components).
2. **Option 2**: Using `allVideoStreams` (MediaStream objects).

Both methods ensure that video streams are correctly associated with participants, allowing for a seamless video conferencing experience.

#### Option 1: Using `allRoomVideos`

This approach involves using the `allRoomVideos` array, which contains HTML elements or components representing each participant's video stream.

1. **Create `getVideoStream` Function**

   **Explanation**:
   - Implements a function to retrieve the appropriate `MediaStream` for a given participant using the `allRoomVideos` array.
   
   ```typescript
   // src/app/components/space-details/space-details.component.ts

   export class SpaceDetailsComponent implements OnInit {
     // ... existing properties

     allRoomVideos: CustomMediaComponent[][] = [];
     mainVideo: CustomMediaComponent[] | null = null;

     // ... constructor and other methods

     getVideoStream(participant: ParticipantData): MediaStream | undefined {
       try {
         // Option 1: Check in allRoomVideos for a matching participant name
         let videoStreamFromAllRoomVideos = this.allRoomVideos
           .flat()
           .find((videoComponent) => 
             (videoComponent?.inputs?.name === participant.id || 
              (videoComponent?.inputs?.participant?.id.includes('youyou') &&
               participant.id === this.currentUser.value?.id))
           );

         // Part Two: Use mainVideo for host if no video stream found
         if (!videoStreamFromAllRoomVideos && this.mainVideo && this.mainVideo.length > 0 && participant.role === 'host') {
           // Get first item in mainVideo
           videoStreamFromAllRoomVideos = this.mainVideo?.[0];
         }

         if (videoStreamFromAllRoomVideos) {
           return videoStreamFromAllRoomVideos.inputs.videoStream;
         } else {
           return undefined;
         }

       } catch (error) {
         return undefined;
       }
     }
   }
   ```

   **Helper Notes**:
   - **Participant Identification**:
     - Matches the participant's `id` with the `name` property in `allRoomVideos`.
     - Special handling for the host (`participant.role === 'host'`) to use `mainVideo` if no specific video stream is found.
   
   - **Error Handling**:
     - Catches any errors during the retrieval process and returns `undefined` if unsuccessful.

2. **Test Option 1**

   **Steps**:
   - **Join the Application**:
     - Open the application in both Chrome profiles.
     - Join the room via `http://localhost:3000/meeting/start` in both profiles.
   
   - **Verify Video Rendering**:
     - Ensure that video streams are rendered within the `Participants` grid.
     - Switch cameras or toggle video in one profile and observe the changes in the other profile.

   **Expected Outcome**:
   - Videos should be accurately displayed for each participant within the grid.
   - Toggling video or switching cameras should reflect in real-time across all connected profiles.

3. **Comment on Successful Rendering**

   **Explanation**:
   - Upon successful testing, the application should display video streams using the `MediaStream` from the MediaSFU HTML elements, ensuring that each participant's video is correctly associated and rendered.

   **Example Comment**:
   ```typescript
   // Successfully rendered the video data using the MediaStream from the MediaSFU HTML elements.
   ```

---

#### Option 2: Using `allVideoStreams`

This approach leverages the `allVideoStreams` array from the `sourceParameters` object, which contains `MediaStream` objects directly associated with participants.

1. **Create Local Reference for `allVideoStreams`**

   **Explanation**:
   - Initializes a local array to store all video streams from `sourceParameters`.
   
   ```typescript
   // src/app/components/space-details/space-details.component.ts

   export class SpaceDetailsComponent implements OnInit {
     // ... existing properties

     allRoomVideos: CustomMediaComponent[][] = [];
     allRoomVideoStreams: (Participant | Stream)[] = [];
     mainVideo: CustomMediaComponent[] | null = null;

     // ... constructor and other methods
   }
   ```

2. **Update `combineLatest` Subscription**

   **Explanation**:
   - Monitors changes in `sourceParameters` and updates `allRoomVideoStreams` accordingly.
   
   ```typescript
   // src/app/components/space-details/space-details.component.ts

   ngOnInit(): void {
     // ... existing initialization logic

     combineLatest([
       this.sourceParameters,
       this.space,
     ]).subscribe(([sourceParameters, space]) => {
       if (sourceParameters && space && Object.keys(sourceParameters).length > 0) {
         // Update room name
         if (sourceParameters['roomName'] && sourceParameters['roomName'] !== space.remoteName) {
           this.apiService.updateSpace(space.id, {
             remoteName: sourceParameters['roomName']
           });
           console.log('Updated remote name:', sourceParameters['roomName']);
         }

         // Update connection status
         if (!this.isConnected.value) {
           this.isConnected.next(true);
         }

         // Update audio level
         if (sourceParameters['audioLevel'] !== this.audioLevel.value) {
           this.audioLevel.next(sourceParameters['audioLevel']);
         }

         // Update mute state
         if (sourceParameters['audioAlreadyOn'] !== !this.isMuted.value) {
           this.isMuted.next(!sourceParameters['audioAlreadyOn']);
         }

         // Update video state
         if (sourceParameters['videoAlreadyOn'] !== this.videoOn.value) {
           this.videoOn.next(sourceParameters['videoAlreadyOn']);
         }

         // Update allVideoStreams
         if (sourceParameters['allVideoStreams'] !== this.allRoomVideoStreams) {
           this.allRoomVideoStreams = sourceParameters['allVideoStreams'];
         }

         // Handle alert messages
         if (sourceParameters['alertMessage'] !== this.mediasfuAlert.value && !sourceParameters['alertMessage'].includes('rotate')) {
           this.mediasfuAlert.next(sourceParameters['alertMessage']);
           if (sourceParameters['alertMessage']) {
             this.message.next(sourceParameters['alertMessage']);
             if (sourceParameters['alertMessage'].includes('meeting has ended')) {
               if (this.isHost() && this.isConnected.value) {
                 this.handleEndSpace();
               } else {
                 this.handleLeave();
               }
             }
           }
         }
       }
     });

     // ... any other initialization logic
   }
   ```

   **Helper Notes**:
   - **Stream Synchronization**:
     - Ensures that `allRoomVideoStreams` is always in sync with the latest `allVideoStreams` from `sourceParameters`.
   
   - **Comprehensive State Updates**:
     - Handles various state updates including room name, connection status, audio level, mute state, and video state.

3. **Modify `ParticipantCardComponent` to Accept Video from `allVideoStreams`**

   **Explanation**:
   - Updates the `ParticipantCard` component to receive and render `MediaStream` objects from `allVideoStreams`.
   
   ```html
   <!-- src/app/components/space-details/space-details.component.html -->

   <!-- Participant Cards -->
   <div class="participants-grid">
     <app-participant-card
       *ngFor="let p of space?.participants | async"
       [participant]="p"
       [space]="space | async"
       [videoStream]="getVideoStream(p) || getVideoStreamOption2(p)"
     ></app-participant-card>
   </div>
   ```

   **Explanation**:
   - The `[videoStream]="getVideoStream(p) || getVideoStreamOption2(p)"` binding ensures that each `ParticipantCard` receives the appropriate `MediaStream` using either Option 1 or Option 2.

4. **Implement `getVideoStream` Function for Option 2**

   **Explanation**:
   - Extends the `getVideoStream` function to handle both options: using `allRoomVideos` and `allVideoStreams`.
   
   ```typescript
   // src/app/components/space-details/space-details.component.ts

   getVideoStream(participant: ParticipantData): MediaStream | undefined {
     try {
       // Option 1: Check in allRoomVideos for a matching participant name
       let videoStreamFromAllRoomVideos = this.allRoomVideos
         .flat()
         .find((videoComponent) => 
           (videoComponent?.inputs?.name === participant.id || 
            (videoComponent?.inputs?.participant?.id.includes('youyou') &&
             participant.id === this.currentUser.value?.id))
         );

       // Part Two: Use mainVideo for host if no video stream found
       if (!videoStreamFromAllRoomVideos && this.mainVideo && this.mainVideo.length > 0 && participant.role === 'host') {
         // Get first item in mainVideo
         videoStreamFromAllRoomVideos = this.mainVideo?.[0];
       }

       if (videoStreamFromAllRoomVideos) {
         return videoStreamFromAllRoomVideos.inputs.videoStream;
       } else {
         return undefined;
       }

     } catch (error) {
       return undefined;
     }
   }

   /**
    * Option 2: Check in allRoomVideoStreams for a matching producerId
    */
   getVideoStreamOption2(participant: ParticipantData): MediaStream | undefined {
     try {
       const updatedParams = this.sourceParameters.value;
       const refParticipant = (updatedParams?.['participants'] as Participant[])?.find(
         (part: Participant) => part.name === participant.id
       );

       let videoStreamFromAllRoomVideoStreams = this.allRoomVideoStreams.find(
         (stream) =>
           typeof stream !== 'string' &&
           (stream.producerId === refParticipant?.videoID)
       );

       if (!videoStreamFromAllRoomVideoStreams && participant.id === this.currentUser.value?.id) {
         return this.sourceParameters.value?.['localStreamVideo'];
       }

       if (!videoStreamFromAllRoomVideoStreams && this.sourceParameters.value?.['oldAllStreams'].length > 0 && participant.role === 'host') {
         // Get first item in oldAllStreams
         return (this.sourceParameters.value?.['oldAllStreams'][0] as unknown as Stream).stream;
       }

       return videoStreamFromAllRoomVideoStreams
         ? videoStreamFromAllRoomVideoStreams.stream
         : undefined;
     } catch (error) {
       return undefined;
     }
   }
   ```

   **Helper Notes**:
   - **Dual Approach**:
     - **Option 1**: Checks within `allRoomVideos` to find a matching `MediaStream`.
     - **Option 2**: Utilizes `allVideoStreams` from `sourceParameters` to locate the appropriate `MediaStream`.
   
   - **Host Handling**:
     - Ensures that the host's video stream is retrieved correctly, even if not directly present in `allRoomVideos`.

5. **Update ParticipantCard Binding for Option 2**

   **Explanation**:
   - Modifies the binding to use both options for fetching video streams.
   
   ```html
   <!-- src/app/components/space-details/space-details.component.html -->

   <!-- Participant Cards -->
   <div class="participants-grid">
     <app-participant-card
       *ngFor="let p of space?.participants | async"
       [participant]="p"
       [space]="space | async"
       [videoStream]="getVideoStream(p) || getVideoStreamOption2(p)"
     ></app-participant-card>
   </div>
   ```

   **Helper Notes**:
   - **Fallback Mechanism**:
     - Attempts to fetch the `MediaStream` using Option 1 first. If unsuccessful, it falls back to Option 2.
   
   - **Robustness**:
     - Ensures that video streams are retrieved using either method, increasing the reliability of video rendering.

6. **Test Option 2**

   **Steps**:
   - **Join the Application**:
     - Open the application in both Chrome profiles.
     - Join the room via `http://localhost:3000/meeting/start` in both profiles.
   
   - **Verify Video Rendering**:
     - Ensure that video streams are rendered within the `Participants` grid using `MediaStream` objects from `allVideoStreams`.
     - Switch cameras or toggle video in one profile and observe the changes in the other profile.
   
   - **Special Cases**:
     - **Host Video**: Ensure that the host's video is correctly rendered using the main video stream when applicable.
     - **Local User**: Verify that the local user's video stream (`localStreamVideo`) is correctly associated and displayed.

   **Expected Outcome**:
   - Videos should be accurately displayed for each participant within the grid using both `allRoomVideos` and `allVideoStreams`.
   - Special cases like host video and local user video should render correctly.
   - Toggling video or switching cameras should reflect in real-time across all connected profiles.

7. **Comment on Successful Rendering**

   **Explanation**:
   - Upon successful testing, the application should display video streams using both `allRoomVideos` and `allVideoStreams`, ensuring comprehensive coverage and accurate association of video streams to participants.

   **Example Comment**:
   ```typescript
   // Successfully rendered the video data using both `allRoomVideos` and `allVideoStreams` from MediaSFU.
   ```

8. **Final Remarks on Option 1 and Option 2**

   **Explanation**:
   - Both approaches offer robust methods for fetching and rendering video streams. Depending on your application's architecture and specific requirements, you can choose the most suitable method or even combine both for enhanced reliability.

   **Helper Notes**:
   - **Flexibility**:
     - Option 1 is straightforward and leverages existing HTML components.
     - Option 2 provides a more granular control using direct `MediaStream` objects, beneficial for complex scenarios.
   
   - **Scalability**:
     - Both methods can handle multiple participants, but Option 2 may offer better performance and flexibility in larger-scale applications.

---

### 3.3 Handling Media Streams in Participant Cards

To display video streams within participant cards, we'll update the `ParticipantCardComponent` to render `MediaStream` objects.

1. **Update `ParticipantCardComponent` Inputs**

   **Explanation**:
   - Adds a new input property to accept `MediaStream` objects for video rendering.
   
   ```typescript
   // src/app/components/participant-card-components/participant-card.component.ts

   import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
   import { ParticipantData } from '../../@types/types';
   import { CommonModule } from '@angular/common';
   import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
   import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

   @Component({
     selector: 'app-participant-card',
     standalone: true,
     imports: [CommonModule, FontAwesomeModule],
     templateUrl: './participant-card.component.html',
     styleUrls: ['./participant-card.component.css'],
   })
   export class ParticipantCardComponent implements OnInit, OnDestroy, OnChanges {
     @Input() participant!: ParticipantData;
     @Input() space!: Space;

     @Input() videoStream?: MediaStream;

     @ViewChild('videoElement', { static: true })
     videoElement!: ElementRef<HTMLVideoElement>;

     isMuted = false;

     // FontAwesome Icons
     faMicrophone = faMicrophone;
     faMicrophoneSlash = faMicrophoneSlash;

     ngOnInit(): void {
       this.isMuted = this.participant.muted || false;
       if (this.videoStream && this.videoElement) {
         const videoEl = this.videoElement.nativeElement;
         videoEl.srcObject = this.videoStream;
       }
     }

     ngAfterViewInit(): void {
       this.updateVideoStream();
     }

     ngOnChanges(changes: SimpleChanges): void {
       if (changes['videoStream']) {
         this.updateVideoStream();
       }
     }

     ngOnDestroy(): void {
       if (this.videoElement) {
         const videoEl = this.videoElement.nativeElement;
         videoEl.srcObject = null;
       }
     }

     private updateVideoStream(): void {
       if (this.videoElement && this.videoStream) {
         const videoEl = this.videoElement.nativeElement;
         if (videoEl.srcObject !== this.videoStream) {
           videoEl.srcObject = this.videoStream;
         }
       }
     }

     get displayName(): string {
       return this.participant.displayName || 'Unnamed';
     }
   }
   ```

2. **Update HTML Template to Render Video Element**

   **Explanation**:
   - Incorporates a `<video>` element to display the participant's video stream if available.
   
   ```html
   <!-- src/app/components/participant-card-components/participant-card.component.html -->

   <div class="participant-card">
     <!-- Video Element -->
     <video
       #videoElement
       autoplay
       muted
       playsinline
       class="participant-video"
       [ngStyle]="{ display: videoStream ? 'block' : 'none' }"
     ></video>

     <!-- Avatar Image -->
     <img
       *ngIf="!videoStream"
       [src]="participant.avatarUrl || 'https://www.mediasfu.com/logo192.png'"
       alt="{{ displayName }}"
       class="participant-avatar"
     />

     <!-- Participant Info -->
     <div class="participant-info">
       <div class="participant-name">{{ displayName }}</div>
       <div class="participant-role">{{ participant.role }}</div>
     </div>

     <!-- Audio Status Icon -->
     <div class="participant-audio-status">
       <fa-icon
         [icon]="isMuted ? faMicrophoneSlash : faMicrophone"
         [ngClass]="isMuted ? 'icon-muted' : 'icon-active'"
       ></fa-icon>
     </div>
   </div>
   ```

3. **Style the Participant Card**

   **Explanation**:
   - Enhances the appearance of the participant card, ensuring a clean and organized layout.
   
   ```css
   /* src/app/components/participant-card-components/participant-card.component.css */

   .participant-card {
     width: 150px;
     border: 1px solid #ddd;
     border-radius: 8px;
     padding: 10px;
     margin: 10px;
     position: relative;
     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
     background-color: #fff;
     display: flex;
     flex-direction: column;
     align-items: center;
   }

   .participant-video {
     width: 100%;
     height: 100px;
     border-radius: 4px;
     object-fit: cover;
     margin-bottom: 8px;
   }

   .participant-avatar {
     width: 100px;
     height: 100px;
     border-radius: 50%;
     object-fit: cover;
     margin-bottom: 8px;
   }

   .participant-info {
     text-align: center;
     margin-bottom: 8px;
   }

   .participant-name {
     font-weight: bold;
     margin-bottom: 4px;
   }

   .participant-role {
     font-size: 0.9em;
     color: #666;
   }

   .participant-audio-status {
     position: absolute;
     top: 10px;
     right: 10px;
     font-size: 1.2em;
     cursor: pointer;
   }

   .icon-muted {
     color: red;
   }

   .icon-active {
     color: green;
   }
   ```

   **Helper Notes**:
   - **Responsive Design**:
     - The participant card adjusts based on content, ensuring a consistent look across different data inputs.
   
   - **Visual Indicators**:
     - Audio status icons provide immediate feedback on the participant's mute status.

4. **Update `SpaceDetailsComponent` to Pass `MediaStream` to `ParticipantCard`**

   **Explanation**:
   - Modifies the data flow to pass `MediaStream` objects to each `ParticipantCard` for video rendering.
   
   ```html
   <!-- src/app/components/space-details/space-details.component.html -->

   <!-- Participant Cards -->
   <div class="participants-grid">
     <app-participant-card
       *ngFor="let p of space?.participants | async"
       [participant]="p"
       [space]="space | async"
       [videoStream]="getVideoStream(p) || getVideoStreamOption2(p)"
     ></app-participant-card>
   </div>
   ```

   **Helper Notes**:
   - **Data Binding**:
     - The `getVideoStream(p) || getVideoStreamOption2(p)` ensures that each `ParticipantCard` receives the correct `MediaStream` using either Option 1 or Option 2.
   
   - **Grid Layout**:
     - Organizes participant cards in a responsive grid for better visual structure.

5. **Summary**

   By updating the `ParticipantCardComponent` to handle `MediaStream` objects, we've enabled dynamic video rendering within participant cards. This enhancement provides users with a clear and interactive view of all participants, elevating the application's communicative capabilities.

---

## Step 4: Building a Custom `MediasfuGenericAlt` Component

To achieve complete control over media rendering, we'll develop a custom `MediasfuGenericAlt` component that overrides default behaviors.

### 4.1 Developing the Custom `MediasfuGenericAlt` Component

#### 4.1.1 Creating Custom Services and Components

1. **Create Custom Service for Video Grid**

   **Explanation**:
   - Establishes a custom service to manage video grid rendering, replacing the default `addVideosGrid` function.
   
   ```typescript
   // src/app/components/custom/add-videos-grid.service.ts

   import { Injectable } from '@angular/core';
   import { CustomMediaComponent, VideoCardOptions, VideoCard, AudioCardOptions, AudioCard } from 'mediasfu-angular';

   @Injectable({
     providedIn: 'root',
   })
   export class AddVideosGridService {
     constructor() { }

     /**
      * Custom implementation to add video grids with transformed video cards.
      */
     addVideosGrid(
       allRoomVideos: CustomMediaComponent[][],
       name: string,
       participant: any,
       eventType: string
     ): void {
       const options: VideoCardOptions = {
         name,
         videoStream: participant.stream ? participant.stream : null,
         participant: participant,
         customStyle: {
           border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
         },
         showControls: false,
         showInfo: false,
       };

       allRoomVideos[0].push({
         component: VideoCard, // Using custom VideoCard component
         inputs: options,
         // ... other necessary properties
       });
     }

     /**
      * Custom implementation to add audio cards with random images.
      */
     addAudioCards(
       allRoomAudios: CustomMediaComponent[],
       participant: any
     ): void {
       const random = Math.floor(Math.random() * 70) + 1;
       const imageSource = `https://i.pravatar.cc/150?img=${random}`;

       const audioOptions: AudioCardOptions = {
         name: participant.name,
         imageSource: imageSource,
         participant: participant,
         customStyle: {
           // ... custom styles if needed
         },
         showControls: false,
         showInfo: false,
       };

       allRoomAudios.push({
         component: AudioCard,
         inputs: audioOptions,
         // ... other necessary properties
       });
     }
   }
   ```

   **Helper Notes**:
   - **Custom Components**:
     - Utilizes the `VideoCard` component developed earlier for video streams.
     - Generates random images for audio cards to simulate participant avatars.
   
   - **Flexibility**:
     - Allows for easy customization and extension of grid functionalities.

2. **Create Custom `VideoCard` Component**

   **Explanation**:
   - Develops a streamlined `VideoCard` component tailored to specific UI requirements.
   
   ```typescript
   // src/app/components/custom/video-card/video-card.component.ts

   import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
   import {
     faMicrophone,
     faMicrophoneSlash,
   } from '@fortawesome/free-solid-svg-icons';
   import { CommonModule } from '@angular/common';
   import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

   export interface VideoCardOptions {
     name: string;
     videoStream?: MediaStream;
     participant?: any;
     customStyle?: Partial<CSSStyleDeclaration>;
     showControls?: boolean;
     showInfo?: boolean;
   }

   @Component({
     selector: 'app-video-card',
     standalone: true,
     imports: [CommonModule, FontAwesomeModule],
     template: `
       <div class="participant-card-alt" [ngStyle]="customStyle">
         <!-- Video Element -->
         <video
           #videoElement
           class="participant-video"
           [muted]="true"
           autoplay
           playsinline
         ></video>

         <!-- Participant Name -->
         <div *ngIf="showInfo" class="participant-name">{{ name }}</div>

         <!-- Audio Status -->
         <div *ngIf="showControls" class="participant-audio-status">
           <fa-icon
             [icon]="isMuted ? faMicrophoneSlash : faMicrophone"
             [ngClass]="isMuted ? 'icon-muted' : 'icon-active'"
           ></fa-icon>
         </div>
       </div>
     `,
     styles: [
       `
       .participant-card-alt {
         width: 120px;
         height: 120px;
         border-radius: 50%;
         position: relative;
         overflow: hidden;
         box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
         display: flex;
         align-items: center;
         justify-content: center;
       }

       .participant-video {
         width: 100%;
         height: 100%;
         border-radius: 50%;
         object-fit: cover;
       }

       .participant-name {
         position: absolute;
         bottom: 8%;
         font-size: 0.9em;
         font-weight: bold;
         text-align: center;
       }

       .participant-audio-status {
         position: absolute;
         top: 8%;
         left: 15%;
         font-size: 0.7em;
         background: rgba(0, 0, 0, 0.3);
         padding: 0.1em;
         border-radius: 50%;
         cursor: pointer;
       }

       .icon-muted {
         color: red;
       }

       .icon-active {
         color: green;
       }
       `,
     ],
   })
   export class VideoCard implements OnInit, OnDestroy, OnChanges {
     @Input() name!: string;
     @Input() videoStream?: MediaStream;
     @Input() participant?: any;
     @Input() customStyle: Partial<CSSStyleDeclaration> = {};
     @Input() showControls = true;
     @Input() showInfo = true;

     @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;

     isMuted = false;

     // FontAwesome Icons
     faMicrophone = faMicrophone;
     faMicrophoneSlash = faMicrophoneSlash;

     ngOnInit() {
       this.isMuted = this.participant?.muted || false;
       if (this.videoStream && this.videoElement) {
         const videoElement = this.videoElement.nativeElement;
         videoElement.srcObject = this.videoStream;
       }
     }

     ngOnChanges(changes: SimpleChanges) {
       if (changes['videoStream'] && this.videoStream) {
         this.updateVideoStream();
       }
     }

     ngOnDestroy() {
       if (this.videoElement) {
         const videoElement = this.videoElement.nativeElement;
         videoElement.srcObject = null;
       }
     }

     updateVideoStream() {
       if (this.videoElement && this.videoStream) {
         const videoElement = this.videoElement.nativeElement;

         // Update the video element's srcObject only if it has changed
         if (videoElement.srcObject !== this.videoStream) {
           videoElement.srcObject = this.videoStream;
         }
       }
     }
   }
   ```

   **Helper Notes**:
   - **Simplified Video Rendering**:
     - Focuses solely on rendering the video stream without additional controls, keeping the component lightweight.
   
   - **Dynamic Styling**:
     - Applies custom styles passed through the `customStyle` input, allowing for flexible UI adjustments.

3. **Implement Custom `addVideosGrid` Function**

   **Explanation**:
   - Overrides the default `addVideosGrid` function to utilize the custom `VideoCard` component.
   
   ```typescript
   // src/app/components/custom/add-videos-grid.service.ts

   import { Injectable } from '@angular/core';
   import { CustomMediaComponent, VideoCardOptions, VideoCard, AudioCardOptions, AudioCard } from 'mediasfu-angular';
   import { AddVideosGridService } from './add-videos-grid.service';

   @Injectable({
     providedIn: 'root',
   })
   export class CustomAddVideosGridService {
     constructor() { }

     /**
      * Custom implementation to add video grids with transformed video cards.
      */
     addVideosGrid(
       allRoomVideos: CustomMediaComponent[][],
       name: string,
       participant: any,
       eventType: string
     ): void {
       const options: VideoCardOptions = {
         name,
         videoStream: participant.stream ? participant.stream : null,
         participant: participant,
         customStyle: {
           border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
         },
         showControls: false,
         showInfo: false,
       };

       allRoomVideos[0].push({
         component: VideoCard, // Using custom VideoCard component
         inputs: options,
         // ... other necessary properties
       });
     }

     /**
      * Custom implementation to add audio cards with random images.
      */
     addAudioCards(
       allRoomAudios: CustomMediaComponent[],
       participant: any
     ): void {
       const random = Math.floor(Math.random() * 70) + 1;
       const imageSource = `https://i.pravatar.cc/150?img=${random}`;

       const audioOptions: AudioCardOptions = {
         name: participant.name,
         imageSource: imageSource,
         participant: participant,
         customStyle: {
           // ... custom styles if needed
         },
         showControls: false,
         showInfo: false,
       };

       allRoomAudios.push({
         component: AudioCard,
         inputs: audioOptions,
         // ... other necessary properties
       });
     }
   }
   ```

   **Helper Notes**:
   - **Custom Video Cards**:
     - Utilizes the `VideoCard` component for video streams, ensuring consistent styling and behavior.
   
   - **Randomized Avatars for Audio**:
     - Assigns random avatar images to audio-only participants for visual differentiation.


### 4.1.2 Create the `mediasfu-generic-alt.component.ts` File

To gain deeper control over how video and audio streams are rendered, we'll create a **custom** `MediasfuGenericAlt` component. This involves copying the original `mediasfu-generic.component.ts` file, modifying its imports, and integrating our custom `addVideosGrid` (or similarly named) service/function.

You can follow these steps to create your own `MediasfuGenericAlt` component, or you can directly use a ready-made file if one is provided in your repository.

---

### 1. **Create a New File**

- **File Location**:  
  `src/app/components/custom/mediasfu-generic-alt.component.ts`

- **Action**:  
  Create a new file named `mediasfu-generic-alt.component.ts` within your `custom` folder (or any preferred directory) in the `components` folder.

Example structure:
```
src
└── app
    └── components
        ├── custom
        │   ├── add-videos-grid.service.ts
        │   └── mediasfu-generic-alt.component.ts
        └── ...
```

---

### 2. **Copy Original `mediasfu-generic.component.ts` Code**

1. **Locate the Original `mediasfu-generic.component.ts`**  
   In the `mediasfu-angular` repository, the default `MediasfuGeneric` component can typically be found in a path like:
   ```
   mediasfu-angular/src/lib/components/mediasfu-components/mediasfu-generic.component.ts
   ```
   or from the [GitHub source](https://github.com/MediaSFU/MediaSFU-Angular/blob/main/src/lib/components/mediasfu-components/mediasfu-generic.component.ts).

2. **Copy** all the code from `mediasfu-generic.component.ts` and **paste** it into your newly created `mediasfu-generic-alt.component.ts`.

---

### 3. **Modify Imports**

After pasting the code, you’ll see references to many local imports. We need to **replace** these references with imports from the **`mediasfu-angular`** package and remove what we don’t need.

1. **Remove In-House/Local Imports**  
   - Inside the copied code, you’ll see lines that import from relative paths such as `../../some-local-utils` or `../../@types/types`.  
   - **Delete** large blocks that reference `initialValuesState`, or any custom hooks/classes that exist only in the original library's folder structure.

   > **For Example**:  
   > ```typescript
   > // Delete lines that look like this:
   > import { initialValuesState } from "../../someplace/initialValuesState";
   > import { AnotherLocalUtil } from "../../utils/anotherLocalUtil";
   > ...
   > ```

2. **Import from `mediasfu-angular`**  
   - Replace those local references with the ones from `mediasfu-angular`.
   - **Tip**: Open the [`public-api.ts` file in mediasfu-angular](https://github.com/MediaSFU/MediaSFU-Angular/blob/main/src/public-api.ts) (or the main library export file) to see which classes/functions are exported.  
   - **Example**:
     ```typescript
     import {
       Participant,
       Stream,
       ...
       UpdateMiniCardsGridType,
       UpdateMiniCardsGridParameters,
       // etc.
     } from "mediasfu-angular";
     ```

3. **Clean Up Duplicate or Unused Imports**  
   - Some imports from the original `MediasfuGeneric` may no longer be needed if you are customizing certain functionalities.  
   - Right-click in VSCode (or your IDE) and choose **"Organize Imports"** or **"Remove Unused Imports"** to tidy up.

4. **Fix Type Imports**  
   - If you see lines like:
     ```typescript
     import { SomeType } from "../../@types/types";
     ```
     change them to:
     ```typescript
     import { SomeType } from "mediasfu-angular"; 
     ```
     or remove them entirely if no longer needed.

5. **Remove Unneeded Components**  
   - The original file might import and reference components like `MediasfuBroadcast`, `MediasfuWebinar`, `MediasfuConference`, or `MediasfuChat`. If you do not need them in your custom alt-component, remove those lines to keep the file lean.

---

### 4. **Integrate Your Custom `addVideosGrid` (or Similar) Function**

If you have a **custom** function (or service) that handles how video grids should be built—often called something like `addVideosGrid`—you’ll want to **inject** or **import** that instead of the default one.

1. **Import Your Custom Service/Function**  
   - If you followed earlier steps to create something like `add-videos-grid.service.ts`, import it:
     ```typescript
     import { AddVideosGridService } from "../custom/add-videos-grid.service";
     ```

2. **Replace References to the Default `addVideosGrid`**  
   - Search for calls like `this.addVideosGrid(...)` or `addVideosGrid(...)` in the copied code.  
   - Replace those references with your custom service’s method, e.g.:
     ```typescript
     constructor(
       private addVideosGridService: AddVideosGridService
       // ...other injections
     ) { }
     
     // Then wherever addVideosGrid is used:
     this.addVideosGridService.addVideosGrid(
       someArgs...
     );
     ```

3. **Adjust Logic as Needed**  
   - The default `MediasfuGeneric` might have multiple functions referencing the original `addVideosGrid` (like `prepopulateUserMedia`, `consumerResume`, etc.).  
   - Decide which of these you want to override, or keep them as-is if not relevant to your custom approach.

---

### 5. **(Optional) Create/Use a Custom CSS File**

If you need to style your custom component differently than the default:

1. **Create a `mediasfu-generic-alt.component.css`** File  
   - Place it alongside your `.ts` file:
     ```
     src/app/components/custom/
       ├── mediasfu-generic-alt.component.ts
       └── mediasfu-generic-alt.component.css
     ```
2. **Reference It in the Component**  
   - In your `@Component` decorator:
     ```typescript
     @Component({
       selector: "app-mediasfu-generic-alt",
       templateUrl: "./mediasfu-generic-alt.component.html",
       styleUrls: ["./mediasfu-generic-alt.component.css"],
     })
     export class MediasfuGenericAltComponent { ... }
     ```
   - Add any desired styles. If you are in a **no-UI** context, you can skip the CSS or keep it minimal.

---

### 6. **Finalize the `MediasfuGenericAlt` Component**

1. **Rename the Class and the Selector**  
   - Inside the file, change:
     ```typescript
     export class MediasfuGenericComponent
     ```
     to:
     ```typescript
     export class MediasfuGenericAltComponent
     ```
   - Update the `selector` in the `@Component` decorator to:
     ```typescript
     selector: "app-mediasfu-generic-alt",
     ```
   - Change references in the template code to point to `MediasfuGenericAltComponent` if needed.

2. **Remove Any Unnecessary Code**  
   - If the original had code for multiple views (Broadcast, Webinar, etc.) you don’t need, remove it to avoid conflicts or confusion.

3. **Ensure It Compiles**  
   - **Build** your Angular app or run `ng serve` to confirm there are no type or import errors.  
   - Fix any leftover references or calls that no longer exist.

---

### 7. **Integrate `MediasfuGenericAlt` into Your Angular App**

**In the component** where you want to use your new alt-component (e.g., `MediaSfuHandlerComponent` or `SpacesDetailsComponent`):

1. **Import the `MediasfuGenericAltComponent`**  
   ```typescript
   import { MediasfuGenericAltComponent } from "../custom/mediasfu-generic-alt.component";
   ```

2. **Add It to the `imports` Array (Standalone) or `declarations` Array (NgModule)**  
   - If your app uses **standalone** components:
     ```typescript
     @Component({
       standalone: true,
       imports: [
         CommonModule,
         MediasfuGenericAltComponent,
         ...
       ],
       ...
     })
     export class MediaSfuHandlerComponent { ... }
     ```
   - If using **NgModule**:
     ```typescript
     @NgModule({
       declarations: [
         MediaSfuHandlerComponent,
         MediasfuGenericAltComponent,
         ...
       ],
       imports: [
         CommonModule,
         ...
       ],
       ...
     })
     export class AppModule {}
     ```

3. **Use the Custom Selector in Your Template**  
   ```html
   <!-- Example: media-sfu-handler.component.html -->
   <app-mediasfu-generic-alt
     [PrejoinPage]="PreJoinPage"
     [sourceParameters]="options.sourceParameters"
     [updateSourceParameters]="options.updateSourceParameters"
     [noUIPreJoinOptions]="finalOptions.value!"
     [localLink]="localLink.value"
     [connectMediaSFU]="false"
     [returnUI]="false"
   ></app-mediasfu-generic-alt>
   ```

4. **Test**  
   - Launch your application (`ng serve`)  
   - Join a room or start a meeting to verify that the **`MediasfuGenericAlt`** component is rendering and handling video/audio as expected.

---

## Summary

By following these steps, you will have:

1. **Copied** the original `MediasfuGeneric` component to a custom `mediasfu-generic-alt.component.ts`.
2. **Replaced** local/relative imports with those from the **`mediasfu-angular`** library.
3. **Injected** or **used** your **custom** grid function/service (e.g., `addVideosGrid`) where needed.
4. **Renamed** the component and optionally added custom **styles**.
5. **Integrated** `MediasfuGenericAlt` into your Angular application for advanced media rendering control.

This approach gives you the freedom to customize the MediaSFU experience—whether you want to tweak how grids are formed, alter how streams are consumed, or integrate entirely new UI features. If you’re in **no-UI mode**, you can keep the component logic minimal but still rely on the underlying MediaSFU functionalities for audio and video management.

---

**Happy coding and customizing!** If you need further assistance or want to explore even deeper customizations (such as rewriting `prepopulateUserMedia`, `consumerResume`, or building custom pipeline steps for video transformations), feel free to dive into the original `mediasfu-angular` source for even more insight.

5. **Style the Custom Component**

   **Explanation**:
   - Ensures that the custom component's layout aligns with the application's design.
   
   ```css
   /* src/app/components/custom/mediasfu-generic-alt.component.css */

   .custom-mediasfu-container {
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 1rem;
     padding: 1rem;
     background-color: #f5f5f5;
     border-radius: 8px;
   }

   .main-video {
     width: 400px;
     height: 300px;
     border: 2px solid #000;
     border-radius: 8px;
     overflow: hidden;
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
     background-color: #000;
   }

   .video-grid-alt {
     display: flex;
     flex-direction: row;
     gap: 1rem;
     flex-wrap: wrap;
     justify-content: center;
     width: 100%;
   }
   ```

   **Helper Notes**:
   - **Layout Consistency**:
     - Maintains a structured and organized layout for video streams.
   
   - **Visual Enhancements**:
     - Adds borders and shadows to distinguish video sections.

6. **Import and Include `VideoCardTransformerComponent`**

   **Explanation**:
   - Integrates the transformer component into the `SpaceDetails` component to apply custom styling.
   
   ```typescript
   // src/app/components/space-details/space-details.component.ts

   import { VideoCardTransformerComponent } from '../custom/video-card-transformer/video-card-transformer.component';
   import { VideoCard } from '../custom/video-card/video-card.component';
   import { MediasfuGenericAltComponent } from '../custom/mediasfu-generic-alt/mediasfu-generic-alt.component';
   import { AddVideosGridService } from '../custom/add-videos-grid.service';

   @Component({
     selector: 'app-space-details',
     standalone: true,
     imports: [
       CommonModule,
       ParticipantCardComponent,
       MediaSfuHandlerComponent,
       AudioLevelBarsComponent,
       AudioGridComponent,
       FlexibleGridComponent,
       VideoCardTransformerComponent,
       VideoCard,
       FlexibleGrid,
       MediasfuGenericAltComponent, // Imported here
       FlexibleVideo,
       FontAwesomeModule,
     ],
     templateUrl: './space-details.component.html',
     styleUrls: ['./space-details.component.css'],
     providers: [UseMediasfuSdkService, AddVideosGridService],
   })
   export class SpaceDetailsComponent implements OnInit {
     // ... component logic
   }
   ```

7. **Update HTML to Utilize Custom `MediasfuGenericAlt`**

   **Explanation**:
   - Integrates the custom component into the main template for enhanced video rendering.
   
   ```html
   <!-- src/app/components/space-details/space-details.component.html -->

   <!-- Audio Level Visualizer -->
   <app-audio-level-bars
     *ngIf="isConnected | async"
     [audioLevel]="audioLevel.value"
   ></app-audio-level-bars>

   <!-- Custom Video Grid -->
   <div
     class="video-grid"
     *ngIf="allRoomVideos?.length && allRoomVideos.length > 0"
   >
     <app-video-card-transformer [videoCards]="allRoomVideos"></app-video-card-transformer>
   </div>

   <!-- Custom MediasfuGenericAlt Component -->
   <div class="main-video" *ngIf="mainVideo && mainVideo.length > 0">
     <app-flexible-video
       [customWidth]="400"
       [customHeight]="300"
       [rows]="1"
       [columns]="1"
       [componentsToRender]="mainVideo"
       [showAspect]="mainVideo.length > 0"
       [localStreamScreen]="mainVideo[0].inputs.videoStream"
       [annotateScreenStream]="false"
       [Screenboard]="undefined"
     >
     </app-flexible-video>
   </div>

   <!-- MediaSFU Handler -->
   <app-media-sfu-handler
     *ngIf="showRoom.value"
     [options]="showRoomDetails.value!"
   ></app-media-sfu-handler>
   ```

   **Helper Notes**:
   - **Main Video Integration**:
     - Provides a dedicated section for the main video stream, such as screen sharing or host video.
   
   - **Custom Components**:
     - Ensures that all custom components are utilized effectively for a cohesive UI.

8. **Hide Default Video Grid (Optional)**

   **Explanation**:
   - Temporarily hides the default video grid to focus solely on the custom implementation.
   
   ```html
   <!-- src/app/components/space-details/space-details.component.html -->

   <!-- Default Video Grid (Hidden) -->
   <div
     class="video-grid"
     *ngIf="allRoomVideos?.length && allRoomVideos.length > 10000"
   >
     <app-flexible-grid
       *ngFor="let row of allRoomVideos"
       [customWidth]="400"
       [customHeight]="300"
       [rows]="1"
       [columns]="row.length"
       [componentsToRender]="row"
       [backgroundColor]="'rgba(217, 227, 234, 0.99)'"
     ></app-flexible-grid>
   </div>
   ```

   **Helper Notes**:
   - **Visibility Control**:
     - Uses an unrealistic condition (`allRoomVideos.length > 10000`) to effectively hide the default grid.
     - This serves as a placeholder; you can remove or adjust this as needed once the custom grid is fully operational.

9. **Test Custom `MediasfuGenericAlt` Component**

   **Steps**:
   - **Join the Application**:
     - Open the application in both Chrome profiles.
     - Join the room via `http://localhost:3000/meeting/start` in both profiles.
   
   - **Verify Video Rendering**:
     - Ensure that video streams are rendered within the `Participants` grid using both `allRoomVideos` and `allVideoStreams`.
     - Switch cameras or toggle video in one profile and observe the changes in the other profile.
   
   - **Special Cases**:
     - **Host Video**: Ensure that the host's video is correctly rendered using the main video stream when applicable.
     - **Local User**: Verify that the local user's video stream (`localStreamVideo`) is correctly associated and displayed.

   **Expected Outcome**:
   - Videos should be accurately displayed for each participant within the grid using both `allRoomVideos` and `allVideoStreams`.
   - Special cases like host video and local user video should render correctly.
   - Toggling video or switching cameras should reflect in real-time across all connected profiles.

10. **Summary**

    By constructing a custom `MediasfuGenericAltComponent` and integrating it into your application, you've established a flexible and customizable media rendering system. This setup allows for advanced video transformations and tailored UI experiences, setting the stage for further enhancements.

---

## Conclusion

Congratulations! You've successfully navigated the advanced integration of the `mediasfu-angular` package within your Angular project. This guide covered:

- **Enhanced Video Controls**: Implemented functionalities to toggle video streams, switch cameras, and select specific camera devices.
  
- **Custom Video Rendering**: Developed a `VideoCardTransformerComponent` and a streamlined `VideoCard` component to achieve a personalized video grid layout.
  
- **Custom `MediasfuGenericAltComponent`**: Built a tailored version of the `MediasfuGenericAlt` component to accommodate unique video rendering needs.
  
- **Dual Approaches for Video Stream Retrieval**: Implemented both `allRoomVideos` and `allVideoStreams` methods for fetching and rendering video streams, ensuring comprehensive coverage and reliability.

### **Key Takeaways**:

- **Customization**: Leveraging custom components allows for a more tailored and engaging user interface, enhancing the overall user experience.
  
- **Modular Design**: Breaking down functionalities into dedicated services and components promotes maintainability and scalability.
  
- **State Management**: Effective use of `BehaviorSubject` and reactive programming ensures that the UI remains in sync with media states.
  
- **Dual Approach Implementation**: Utilizing both `allRoomVideos` and `allVideoStreams` provides flexibility and reliability in rendering video streams, catering to different application architectures and requirements.

### **Next Steps**:

In **Part 2** of this tutorial series, we'll delve into even more sophisticated features, including:

- **Screen Sharing**: Implementing functionalities to share screens seamlessly within your application.
  
- **Custom Streams**: Utilizing and managing custom media streams to further enhance communication capabilities.
  
- **Bespoke Components**: Building custom components to render media data in unique and innovative ways, ensuring your application stands out.

Thank you for following along! Your advanced MediaSFU integration empowers your Angular application with robust and customizable video communication capabilities. Stay tuned for the next installment to unlock even more powerful features.

---

**Final Remarks**:

Most of the work at this stage will focus on **UI styling and customizing the appearance of the media data**. You can copy the default codes and leverage Language Learning Models (LLMs) to expedite the styling process. In simple contexts like this, rendering your UI components and styling them to your taste can significantly enhance user engagement.

**Additional Notes**:

- **Complex Features**: The demo does not cover complexities like breakout rooms, virtual backgrounds, etc., but these can be implemented using the `mediasfu-angular` package.
  
- **UI Component Modifications**: When dealing with complex scenarios, it might be advisable to render MediaSFU's default UI and then modify the UI components to suit your needs, as demonstrated in this guide.
  
- **Pagination and Performance**:
  - **Client-Side Rendering**: Rendering a large number of high-quality video streams can be taxing on the client-side. While `mediasfu-angular` can support up to 3,000 concurrent media streams, rendering 50 video streams on the client-side may lead to performance issues.
  - **Stream Pagination**: `mediasfu-angular` components determine and paginate the streams being resolved, ensuring that only active page streams are rendered.
  - **Black Screen Issues**: If relying on resolving actual streams (`allVideoStreams`), you might encounter black screens due to paused server-side streams. A quick solution is to call `updateItemPageLimit` with a high value, assuming you have an effective way to handle such without crashing. This will prevent black screen issues by avoiding pagination of streams and paused video streams.
  - **Recording Considerations**: If you're recording with MediaSFU Cloud, avoid indefinite streams at high resolutions to prevent potential issues.

Thank you once again for following through the guide. We hope you have learned how to render and transform media data in the `mediasfu-angular` package effectively.
