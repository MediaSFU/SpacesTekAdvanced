# Advanced MediaSFU Flutter Usage Guide

Welcome to the advanced guide for integrating and customizing the MediaSFU Flutter SDK within your project. This guide builds upon the foundational steps covered in the previous tutorial, delving deeper into video functionalities, custom rendering, and advanced media stream management. By the end of this guide, you'll have a robust understanding of leveraging MediaSFU's capabilities to enhance your Flutter application's multimedia experience.

## Table of Contents

1. [Prerequisites](#prerequisites)
3. [Step 1: Introduction and Focus Shift](#step-1-introduction-and-focus-shift)
4. [Step 2: Enhancing the MediaSFU Service](#step-2-enhancing-the-mediasfu-service)
5. [Step 3: Rendering and Transforming Media Data](#step-3-rendering-and-transforming-media-data)
6. [Step 4: Building a Custom `MediasfuGeneric` Component](#step-4-building-a-custom-mediasfugeneric-component)
7. [Step 5: Final Testing and Refinements](#step-5-final-testing-and-refinements)
8. [Conclusion](#conclusion)

---

## Prerequisites

Before proceeding, ensure you have the following:

- **Flutter SDK** installed on your machine.
- A **Flutter project** set up.
- Access to [MediaSFU](https://mediasfu.com/) with necessary credentials.
- A local server running with **H264** support for video encoding.
- Basic understanding of Flutter widget lifecycle and state management.

---

## Step 1: Introduction and Focus Shift

### 1.1 Continuation from Previous Guide

Welcome to the **Advanced MediaSFU Flutter Usage Guide**. This tutorial is a direct continuation of the foundational guide on integrating MediaSFU into your Flutter project. If you haven't completed the [Basic Integration Guide](#), please do so before proceeding to ensure a smooth learning experience.

### 1.2 Shift Focus to Video

While the previous guide emphasized **audio functionalities**, this advanced tutorial will pivot towards **video as the primary media type**. Here's what we'll cover:

- **Rendering Various Video Widgets**: Learn to display video streams in both main and mini grids.
- **Intercepting and Modifying Video Data**: Customize video streams before rendering.
- **Utilizing MediaStreams for Custom Rendering**: Harness MediaStreams to display tailored video content.
- **Building Custom `MediasfuGeneric` Components**: Develop your own components for unique video data rendering.

---

## Step 2: Enhancing the MediaSFU Service

### 2.1 Update `UseMediasfuSdkService` for Advanced Video Features

We'll begin by extending the existing MediaSFU service to include advanced video controls.

1. **Open the Service File**:

   Navigate to the `lib/services` directory and open `use_mediasfu_sdk.dart`.

2. **Add Video Control Functions**:

   Under the existing `toggleAudio` function, introduce the following methods:

   - **Toggle Video**: Enable or disable the video stream.

     ```dart
     Future<void> toggleVideo({
       MediasfuParameters? sourceParameters,
     }) async {
       try {
         if (sourceParameters == null) {
           throw Exception("Source parameters are required.");
         }
         if (sourceParameters.roomName.isNotEmpty) {
           final options = ClickVideoOptions(
             parameters: sourceParameters,
           );
           await clickVideo(options);
         }
       } catch (e) {
         debugPrint("Error toggling video: $e");
       }
     }
     ```

     *Explanation*: The `toggleVideo` function leverages MediaSFU's `clickVideo` method to switch the video stream on or off based on the current state.

   - **Switch Camera**: Toggle between front and back cameras.

     ```dart
     Future<void> switchCamera({
       MediasfuParameters? sourceParameters,
     }) async {
       try {
         if (sourceParameters == null) {
           throw Exception("Source parameters are required.");
         }
         if (sourceParameters.roomName.isNotEmpty) {
           final options = SwitchVideoAltOptions(
             parameters: sourceParameters,
           );
           await switchVideoAlt(options);
         }
       } catch (e) {
         debugPrint("Error switching camera: $e");
       }
     }
     ```

     *Explanation*: The `switchCamera` function utilizes MediaSFU's `switchVideoAlt` to alternate between available cameras.

   - **Select Specific Camera**: Choose a particular camera device.

     ```dart
     Future<void> selectCamera({
       MediasfuParameters? sourceParameters,
       required String deviceId,
     }) async {
       try {
         if (sourceParameters == null) {
           throw Exception("Source parameters are required.");
         }
         if (sourceParameters.roomName.isNotEmpty) {
           final options = SwitchVideoOptions(
             videoPreference: deviceId,
             parameters: sourceParameters,
           );
           await switchVideo(options);
         }
       } catch (e) {
         debugPrint("Error selecting camera: $e");
       }
     }
     ```

     *Explanation*: The `selectCamera` function allows selecting a specific camera device by its `deviceId`, providing more granular control over video sources.

### 2.2 Update `handleToggleMic` to Toggle Video

Transitioning focus from audio to video involves updating existing handlers.

1. **Open `SpaceDetails` Component**:

   Locate and open the `SpaceDetails` component where the microphone toggle functionality resides.

2. **Modify `handleToggleMic` Function**:

   Replace the audio toggling with video toggling to prioritize video control.

   ```dart
   Future<void> handleToggleMic() async {
     final user = currentUser.value;
     if (user == null) return;

     if (user.role == ParticipantRole.speaker ||
         user.role == ParticipantRole.host ||
         !(space.value?.askToSpeak ?? false)) {
       try {
         await toggleVideo(sourceParameters: mediasfuParams.value);
       } catch (e) {
         setMessage("Error toggling video.");
       }
     } else {
       setMessage("You do not have permission to toggle your video.");
     }
   }
   ```

   *Explanation*: This modification ensures that clicking the microphone button now controls the video stream, aligning with our focus shift.

### 2.3 Add Camera Switching Option

Provide users with the ability to switch between front and back cameras seamlessly.

1. **Add Switch Camera Button**:

   Within the `SpaceDetails` component, locate the section handling conditional buttons and add the following ElevatedButton:

   ```dart
   // Switch Camera Button
   if (videoOn)
     ElevatedButton.icon(
       onPressed: () => switchCamera(
         sourceParameters: mediasfuParams.value,
       ),
       icon: const FaIcon(
         FontAwesomeIcons.camera,
         size: 16.0,
       ),
       label: const Text('Switch Camera'),
       style: ElevatedButton.styleFrom(
         backgroundColor: Colors.blue,
         foregroundColor: Colors.white,
         padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
         shape: RoundedRectangleBorder(
           borderRadius: BorderRadius.circular(8.0),
         ),
       ),
     ),
   ```

   *Explanation*: This button appears only when `videoOn` is `true`, allowing users to toggle their camera view.

2. **Track Video State**:

   Introduce a boolean to monitor the video state.

   ```dart
   bool videoOn = false;
   ```

   *Placement*: Add this line under `bool isMuted = false;` in the `SpaceDetails` component.

3. **Update Video State Based on MediaSFU Parameters**:

   Within the `_updateStateParameters` function, synchronize the `videoOn` state with MediaSFU's parameters.

   ```dart
   if (videoOn != params.videoAlreadyOn) {
     setState(() {
       videoOn = params.videoAlreadyOn;
     });
   }
   ```

   *Explanation*: This ensures the UI accurately reflects the current video state.

### 2.4 Add Camera Selection Dropdown

Enable users to select a specific camera device from available options.

1. **Track Available Video Inputs**:

   Introduce state variables to store available video devices and the selected device.

   ```dart
   List<MediaDeviceInfo> videoInputs = [];
   String? selectedVideoInput;
   ```

   *Placement*: Add these lines above `bool isConnected = false;` in the `SpaceDetails` component.

2. **Import Required Package**:

   Ensure you have the `flutter_webrtc` package imported to utilize `MediaDeviceInfo`.

   ```dart
   import 'package:flutter_webrtc/flutter_webrtc.dart';
   ```

3. **Populate Available Video Inputs**:

   Update the `handleToggleMic` function to retrieve and store available video devices.

   ```dart
   // Get the list of all available media devices
   List<MediaDeviceInfo> devices = await navigator.mediaDevices.enumerateDevices();

   // Filter devices to get only video input devices
   videoInputs = devices.where((device) => device.kind == 'videoinput').toList();
   ```

   *Explanation*: This fetches all video input devices (e.g., front and back cameras) and stores them for user selection.

4. **Add Camera Selection Dropdown**:

   Insert a dropdown menu for selecting specific cameras.

   ```dart
   // Switch Camera Button
   if (videoOn)
     ElevatedButton.icon(
       onPressed: () => switchCamera(
         sourceParameters: mediasfuParams.value,
       ),
       icon: const FaIcon(
         FontAwesomeIcons.camera,
         size: 16.0,
       ),
       label: const Text('Switch Camera'),
       style: ElevatedButton.styleFrom(
         backgroundColor: Colors.blue,
         foregroundColor: Colors.white,
         padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
         shape: RoundedRectangleBorder(
           borderRadius: BorderRadius.circular(8.0),
         ),
       ),
     ),

   const SizedBox(width: 8.0),

   if (videoInputs.length > 1)
     Container(
       decoration: BoxDecoration(
         borderRadius: BorderRadius.circular(8),
         border: Border.all(color: Colors.white.withOpacity(0.3)),
       ),
       padding: const EdgeInsets.symmetric(horizontal: 8),
       child: DropdownButtonHideUnderline(
         child: ConstrainedBox(
           constraints: const BoxConstraints(maxWidth: 100),
           child: DropdownButton<String>(
             value: selectedVideoInput,
             onChanged: handleSelectCamera,
             icon: const FaIcon(
               FontAwesomeIcons.camera,
               size: 14.0,
               color: Colors.white70,
             ),
             dropdownColor: Colors.black87,
             iconEnabledColor: Colors.white70,
             style: const TextStyle(
               fontSize: 13,
               color: Colors.white,
               fontWeight: FontWeight.w500,
             ),
             isExpanded: true,
             borderRadius: BorderRadius.circular(8),
             items: videoInputs
                 .map((input) => DropdownMenuItem(
                       value: input.deviceId,
                       child: Text(
                         input.label,
                         overflow: TextOverflow.ellipsis,
                       ),
                     ))
                 .toList(),
           ),
         ),
       ),
     ),
   ```

   *Explanation*: This dropdown appears only if there are multiple video input devices available, allowing users to select their preferred camera.

5. **Handle Camera Selection**:

   Implement the function to manage camera selection.

   ```dart
   void handleSelectCamera(String? deviceId) {
     if (deviceId == null) return;
     setState(() {
       selectedVideoInput = deviceId;
     });
     // Switch to the selected camera
     selectCamera(
       sourceParameters: mediasfuParams.value,
       deviceId: deviceId,
     );
   }
   ```

   *Explanation*: This function updates the selected camera and invokes the `selectCamera` method to apply the change.

### 2.5 Testing Camera Controls

1. **Join as Multiple Participants**:

   - **Host**: Join the space as the host using one browser profile.
   - **Participant**: Join from another browser profile or device.

2. **Switch Cameras**:

   - Use the **Switch Camera** button to toggle between front and back cameras.
   - Verify that the video stream updates accordingly for both host and participants.

3. **Select Specific Camera**:

   - If multiple cameras are available, use the **Dropdown Menu** to select a specific camera.
   - Ensure the selected camera's feed is reflected in the video stream.

   *Note*: On devices with only one camera (e.g., most desktop setups), the switch camera functionality may have limited effects.

---

## Step 3: Rendering and Transforming Media Data

### 3.1 Rendering Video Widgets for Main and Mini Grids

Transitioning to video-centric functionalities involves customizing how video streams are displayed within your application.

1. **Import Necessary Components**:

   Ensure that your `SpaceDetails` component imports the `FlexibleGrid` component from MediaSFU.

   ```dart
   import 'package:mediasfu_sdk/mediasfu_sdk.dart';
   ```

2. **Render Video in Mini Grids**:

   Replace the existing `FlexibleGrid` usage with customized rendering logic.

   ```dart
   SizedBox(
     height: 400,
     width: 600,
     child: FlexibleGrid(
       options: FlexibleGridOptions(
         componentsToRender: allRoomVideos.value.isNotEmpty && allRoomVideos.value[0].isNotEmpty
             ? allRoomVideos.value[0]
             : [],
         columns: allRoomVideos.value.isNotEmpty && allRoomVideos.value[0].isNotEmpty
             ? allRoomVideos.value[0].length
             : 0,
         rows: 1,
         customWidth: 600,
         customHeight: 400,
         showAspect: allRoomVideos.value.isNotEmpty && allRoomVideos.value[0].isNotEmpty,
       ),
     ),
   ),
   ```

   *Explanation*: This setup renders video streams within a `FlexibleGrid`, adjusting the number of columns and rows based on the active video streams.

### 3.2 Customizing Video Rendering Appearance

To achieve a personalized look and feel for video streams, we'll intercept and modify video data before rendering.

1. **Create a Video Transformer Component**:

   Develop a custom widget to style video cards, akin to the "participant-card" in SpacesTek.

   - **Create File**: `lib/components/transforms/video_card_transformer.dart`
   
   - **Add the Following Code**:

     ```dart
     import 'package:flutter/material.dart';
     import 'package:mediasfu_sdk/components/display_components/video_card.dart';

     /// A wrapper widget that intercepts `VideoCard` children and applies
     /// custom styling and properties — akin to the "participant-card" in SpacesTek.
     class VideoCardTransformer extends StatelessWidget {
       final List<Widget> children;

       const VideoCardTransformer({
         Key? key,
         required this.children,
       }) : super(key: key);

       @override
       Widget build(BuildContext context) {
         if (children.isEmpty) return const SizedBox.shrink();

         return Wrap(
           spacing: 16,
           runSpacing: 16,
           alignment: WrapAlignment.center,
           children: children.map((child) {
             // Intercept only if it is a VideoCard
             if (child is VideoCard) {
               final originalOptions = child.options;

               // Create new `VideoCardOptions` with some overridden properties.
               final transformedOptions = VideoCardOptions(
                 parameters: originalOptions.parameters,
                 name: originalOptions.name,
                 barColor: originalOptions.barColor,
                 textColor: originalOptions.textColor,
                 imageSource: originalOptions.imageSource,
                 // Force the participant’s image to be rounded
                 roundedImage: true,
                 imageStyle: {
                   ...originalOptions.imageStyle,
                   // Additional style logic if needed
                 },
                 remoteProducerId: originalOptions.remoteProducerId,
                 eventType: originalOptions.eventType,
                 forceFullDisplay: originalOptions.forceFullDisplay,
                 videoStream: originalOptions.videoStream,
                 showControls: originalOptions.showControls,
                 showInfo: originalOptions.showInfo,
                 controlsPosition: originalOptions.controlsPosition,
                 infoPosition: originalOptions.infoPosition,
                 participant: originalOptions.participant,
                 backgroundColor: originalOptions.backgroundColor,
                 doMirror: originalOptions.doMirror,
                 controlUserMedia: originalOptions.controlUserMedia,
               );

               // Wrap the new VideoCard in a Container that mimics
               // the “.participant-card” style from React/Angular:
               return Container(
                 width: 120,
                 height: 120,
                 clipBehavior: Clip.antiAlias,
                 decoration: BoxDecoration(
                   // Rounded corners similar to ParticipantCard
                   borderRadius: BorderRadius.circular(10.0),
                   // Box shadow similar to ParticipantCard
                   boxShadow: [
                     BoxShadow(
                       color: Colors.black.withOpacity(0.05),
                       blurRadius: 8,
                       offset: const Offset(0, 2),
                     ),
                     if (originalOptions.participant.islevel == '2')
                       const BoxShadow(
                         color: Colors.amber,
                         blurRadius: 4,
                         offset: Offset(0, 1),
                       ),
                   ],
                 ),
                 child: Stack(
                   children: [
                     // The transformed video card
                     VideoCard(options: transformedOptions),
                   ],
                 ),
               );
             }

             // Otherwise, return the child as is.
             return child;
           }).toList(),
         );
       }
     }
     ```

     *Explanation*: The `VideoCardTransformer` intercepts each `VideoCard` widget, applies custom styling, and ensures consistency across participant video displays.

2. **Create a Custom `VideoCard` Component**:

   Develop a tailored `VideoCard` to replace the default MediaSFU implementation.

   - **Create File**: `lib/components/custom/video_card.dart`

   - **Add the Following Code**:

     ```dart
     import 'package:flutter/material.dart';
     import 'package:flutter_webrtc/flutter_webrtc.dart';

     class VideoCardOptions {
       final String name;
       final MediaStream? videoStream;
       final bool? isMuted;
       final bool showControls;
       final bool showInfo;
       final BoxDecoration? customStyle;

       VideoCardOptions({
         required this.name,
         this.videoStream,
         this.isMuted,
         this.showControls = true,
         this.showInfo = true,
         this.customStyle,
       });
     }

     class VideoCard extends StatefulWidget {
       final VideoCardOptions options;

       const VideoCard({
         Key? key,
         required this.options,
       }) : super(key: key);

       @override
       _VideoCardState createState() => _VideoCardState();
     }

     class _VideoCardState extends State<VideoCard> {
       RTCVideoRenderer? _videoRenderer;
       bool _rendererInitialized = false;

       @override
       void initState() {
         super.initState();
         if (widget.options.videoStream != null) {
           _initializeVideoRenderer();
         }
       }

       @override
       void didUpdateWidget(covariant VideoCard oldWidget) {
         super.didUpdateWidget(oldWidget);
         if (oldWidget.options.videoStream != widget.options.videoStream) {
           _disposeVideoRenderer();
           if (widget.options.videoStream != null) {
             _initializeVideoRenderer();
           }
         }
       }

       Future<void> _initializeVideoRenderer() async {
         if (_videoRenderer == null) {
           _videoRenderer = RTCVideoRenderer();
           await _videoRenderer!.initialize();
         }
         _videoRenderer!.srcObject = widget.options.videoStream;
         setState(() {
           _rendererInitialized = true;
         });
       }

       void _disposeVideoRenderer() {
         if (_videoRenderer != null) {
           _videoRenderer!.srcObject = null;
           _videoRenderer!.dispose();
           _videoRenderer = null;
         }
         _rendererInitialized = false;
       }

       @override
       void dispose() {
         _disposeVideoRenderer();
         super.dispose();
       }

       @override
       Widget build(BuildContext context) {
         final options = widget.options;

         return Container(
           decoration: options.customStyle ??
               BoxDecoration(
                 color: Colors.white,
                 borderRadius: BorderRadius.circular(60), // Circle shape
                 boxShadow: [
                   BoxShadow(
                     color: Colors.black.withOpacity(0.2),
                     offset: const Offset(0, 2),
                     blurRadius: 8,
                   ),
                 ],
               ),
           width: 120,
           height: 120,
           clipBehavior: Clip.hardEdge,
           child: Stack(
             children: [
               // Video or Fallback
               ClipOval(
                 child: _rendererInitialized
                     ? RTCVideoView(
                         _videoRenderer!,
                         objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
                       )
                     : Container(
                         color: Colors.grey[300],
                         child: Center(
                           child: Text(
                             options.name.isNotEmpty ? options.name[0].toUpperCase() : '',
                             style: const TextStyle(
                               fontSize: 24.0,
                               fontWeight: FontWeight.bold,
                               color: Colors.white,
                             ),
                           ),
                         ),
                       ),
               ),

               // Name Tag
               if (options.showInfo)
                 Align(
                   alignment: Alignment.bottomCenter,
                   child: Container(
                     margin: const EdgeInsets.only(bottom: 8),
                     padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                     decoration: BoxDecoration(
                       color: Colors.white.withOpacity(0.8),
                       borderRadius: BorderRadius.circular(12),
                     ),
                     child: Text(
                       options.name,
                       style: const TextStyle(
                         fontSize: 12.0,
                         fontWeight: FontWeight.bold,
                         color: Colors.black,
                       ),
                       overflow: TextOverflow.ellipsis,
                       textAlign: TextAlign.center,
                     ),
                   ),
                 ),

               // Mic/Audio Status
               if (options.showControls)
                 Align(
                   alignment: Alignment.topLeft,
                   child: Container(
                     margin: const EdgeInsets.all(8),
                     padding: const EdgeInsets.all(6),
                     decoration: BoxDecoration(
                       color: Colors.black.withOpacity(0.6),
                       shape: BoxShape.circle,
                     ),
                     child: Icon(
                       options.isMuted == true ? Icons.mic_off : Icons.mic,
                       color: options.isMuted == true ? Colors.red : Colors.green,
                       size: 16,
                     ),
                   ),
                 ),
             ],
           ),
         );
       }
     }
     ```

     *Explanation*: This custom `VideoCard` provides a stylized video display with participant names and mute status indicators, enhancing the user interface's visual appeal.

3. **Integrate `VideoCardTransformer` into `SpaceDetails`**:

   Modify the `SpaceDetails` component to utilize the `VideoCardTransformer` for rendering video streams.

   - **Import the Transformer**:

     ```dart
     import 'transforms/video_card_transformer.dart';
     ```

   - **Update the Widget Tree**:

     Replace the existing `FlexibleGrid` with the `VideoCardTransformer` to apply custom styles.

     ```dart
     // Under the AudioGrid component
     const SizedBox(height: 24.0),

     // Video Card Transforms
     SizedBox(
       height: 400,
       width: 600,
       child: VideoCardTransformer(
         children: allRoomVideos.value.isNotEmpty && allRoomVideos.value[0].isNotEmpty
             ? allRoomVideos.value[0]
             : [],
       ),
     ),

     const SizedBox(height: 24.0),
     ```

     *Explanation*: This setup ensures that all `VideoCard` widgets are transformed and styled uniformly across the application.

### 3.2 Accessing and Rendering MediaStreams

To gain finer control over video rendering, we'll directly access `MediaStream` objects and utilize them within custom components.

1. **Update ParticipantCard to Render MediaStreams**:

   Enhance the `ParticipantCard` component to accept and display `MediaStream` objects.

   - **Open `ParticipantCard` Component**:

     Navigate to `lib/components/participant_card.dart`.

   - **Modify Constructor to Accept `MediaStream`**:

     ```dart
     final MediaStream? videoStream;

     const ParticipantCard({
       Key? key,
       required this.participant,
       required this.space,
       required this.videoStream,
     }) : super(key: key);
     ```

   - **Initialize RTCVideoRenderer**:

     ```dart
     RTCVideoRenderer? _renderer;
     bool _rendererDisposed = false;

     @override
     void initState() {
       super.initState();
       _createRendererIfNeeded(widget.videoStream);
     }

     @override
     void didUpdateWidget(covariant ParticipantCard oldWidget) {
       super.didUpdateWidget(oldWidget);
       if (oldWidget.videoStream != widget.videoStream) {
         if (widget.videoStream == null) {
           _disposeRenderer();
         } else {
           _createRendererIfNeeded(widget.videoStream);
         }
       }
     }

     Future<void> _createRendererIfNeeded(MediaStream? stream) async {
       if (stream == null) return;

       if (_rendererDisposed || _renderer == null) {
         _rendererDisposed = false;
         _renderer = RTCVideoRenderer();
         await _renderer!.initialize();
       }

       if (!mounted) return;

       _renderer!.srcObject = stream;
       setState(() {});
     }

     void _disposeRenderer() {
       if (_rendererDisposed || _renderer == null) return;

       _renderer!.srcObject = null;
       _renderer!.dispose();
       _rendererDisposed = true;
       _renderer = null;
     }

     @override
     void dispose() {
       _disposeRenderer();
       super.dispose();
     }
     ```

   - **Render the Video Stream**:

     ```dart
     final renderer = _renderer;

     // Inside the build method
     child: widget.videoStream != null && renderer != null && !_rendererDisposed
         ? RTCVideoView(
             renderer,
             objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
           )
         : widget.participant.avatarUrl!.isNotEmpty
             ? Image.network(widget.participant.avatarUrl!)
             : Container(
                 color: Colors.grey[300],
                 child: Center(
                   child: Text(
                     widget.participant.name.isNotEmpty
                         ? widget.participant.name[0].toUpperCase()
                         : '',
                     style: const TextStyle(
                       fontSize: 24.0,
                       fontWeight: FontWeight.bold,
                       color: Colors.white,
                     ),
                   ),
                 ),
               ),
     ```

     *Explanation*: This logic ensures that if a `MediaStream` is available, it renders the video; otherwise, it falls back to displaying the participant's avatar or initials.

2. **Pass MediaStreams to `ParticipantCard`**:

   Update the `SpaceDetails` component to pass the appropriate `MediaStream` to each `ParticipantCard`.

   - **Implement `getVideoStreamForParticipant` Function**:

   You have two options to retrieve the `MediaStream` for each participant. Choose the one that best fits your application's architecture.

     ```dart
     MediaStream? getVideoStreamForParticipant({
       required Participant refParticipant, // Reference participant on MediaSFU
       required ParticipantData? currentUser,
       required ParticipantData participant,
       required List<List<Widget>> allRoomVideos,
       required List<Widget> mainVideo,
       required List<Stream> allRoomVideoStreams, // For Option 2 (if needed)
       required MediasfuParameters? mediasfuParams, // For Option 2 (if needed)

     }) {
       try {
         // Option 1: Check in allRoomVideos for a matching participant name
         final flattenedAllRoomVideos = allRoomVideos.expand((list) => list).toList();

         Widget? videoComponent = flattenedAllRoomVideos.firstWhereOrNull(
           (widget) {
             if (widget is VideoCard) {
               final options = widget.options;
               return options.name == participant.id ||
                   (options.name.contains('youyou') && refParticipant.name == currentUser?.id);
             }
             return false;
           },
         );

         if (videoComponent != null) {
           return (videoComponent as VideoCard).options.videoStream;
         } else if (mainVideo.isNotEmpty && participant.role == ParticipantRole.host) {
           // Fallback to main video stream for hosts
           final mainVideoStream = mainVideo.first;
           return (mainVideoStream as VideoCard).options.videoStream;
         }


        // Option 2: Check in allRoomVideoStreams for a matching producerId
        if (mediasfuParams != null) {
            // Find the corresponding participant in mediasfuParams
            final mediasfuParticipant =
                mediasfuParams.participants.firstWhereOrNull(
            (p) => p.name == participant.id,
            );

            if (mediasfuParticipant != null) {
            // Find the matching stream by producerId
            final matchedStream = allRoomVideoStreams.firstWhereOrNull(
                (stream) => stream.producerId == mediasfuParticipant.videoID);

            if (matchedStream != null) {
                return matchedStream.stream;
            }
            }

            if (participant.id == currentUser?.id) {
            final localStream = mediasfuParams.localStreamVideo;
            if (localStream != null) {
                return localStream;
            }
            }
            if (participant.role == ParticipantRole.host &&
                mediasfuParams.oldAllStreams.isNotEmpty) {
            final oldAllStreams = mediasfuParams.oldAllStreams;
            if (oldAllStreams.isNotEmpty) {
                return oldAllStreams.first.stream;
            }
            }
        }

         return null;
       } catch (e) {
         return null;
       }

       
       
     }
     ```

     *Explanation*: This function retrieves the corresponding `MediaStream` for each participant, prioritizing individual streams and falling back to the main video stream for hosts.

   - **Update Participants Rendering**:

     ```dart
     // Inside SpaceDetails component's build method
     space.value!.participants.map((participant) {
       final refParticipant = mediasfuParams.value?.participants.firstWhereOrNull(
         (p) => p.name == participant.id,
       );

       MediaStream? videoStream;
       if (refParticipant != null) {
         videoStream = getVideoStreamForParticipant(
           refParticipant: refParticipant,
           currentUser: currentUser.value,
           participant: participant,
           allRoomVideos: allRoomVideos.value,
           mainVideo: mainVideo.value,
            allRoomVideoStreams:
                                allRoomVideoStreams.value, // For Option 2 (if needed)
                            mediasfuParams: mediasfuParams.value, // For Option 2 (if needed)
         );
       }

       return ParticipantCard(
         participant: participant,
         space: space.value,
         videoStream: videoStream, // Pass the MediaStream
         onReject: rejectSpeakRequest,
       );
     }).toList(),
     ```

     *Explanation*: This mapping ensures each `ParticipantCard` receives its respective `MediaStream`, enabling individualized video rendering.

### 3.3 Testing Video Rendering

1. **Join as Multiple Participants**:

   - **Host**: Use one browser profile to join as the host.
   - **Participant**: Use another profile or device to join as a participant.

2. **Verify Video Streams**:

   - **Switch Cameras**: Use the **Switch Camera** button to toggle between available cameras and observe the changes in the video streams.
   - **Select Specific Camera**: If multiple cameras are available, use the dropdown to select a specific camera and verify the video stream updates accordingly.

3. **Handle Audio and Video States**:

   - **Mute/Unmute**: Test muting and unmuting participants to see corresponding updates in the UI.
   - **Remove Participants**: As a host, remove participants and ensure they are disconnected from the video streams.

   *Note*: Some functionalities may behave differently based on device capabilities and browser support.

---

## Step 4: Building a Custom `MediasfuGeneric` Component

To further customize the behavior and appearance of MediaSFU components, we'll create a tailored `MediasfuGeneric` component.

### 4.1 Create Custom `AddVideosGrid` Functionality

1. **Create Custom Videos Grid File**:

   - **Create File**: `lib/components/custom/add_videos_grid.dart`

   - **Add the Following Code**:

     ```dart
     import 'package:flutter/foundation.dart';
     import 'package:flutter/material.dart';
     import 'package:mediasfu_sdk/mediasfu_sdk.dart'
         show
             Participant,
             Stream,
             EventType,
             UpdateMiniCardsGridOptions,
             MiniCardOptions,
             AudioCardOptions,
             AudioCard,
             MiniCard,
             AddVideosGridOptions,
             AddVideosGridParameters;

     import 'video_card.dart';

     typedef UpdateOtherGridStreams = void Function(List<List<Widget>>);
     typedef UpdateAddAltGrid = void Function(bool);

     /// Adds video and audio streams of participants to the main and alternate grids based on specified options.
     ///
     /// This function manages the layout and styling of participant video, audio, and mini-cards in the main and alternate grids,
     /// with customizations based on event type, background, and layout settings. It dynamically updates the UI by adding or removing
     /// components in real-time, handling both the main and alternate grids.
     ///
     /// - The function creates `VideoCard` widgets for participants with active video streams and `AudioCard` widgets for participants
     ///   with audio streams but without video.
     /// - For participants who don’t have active audio or video, a `MiniCard` is generated, displaying participant initials.
     ///
     /// ### Parameters:
     /// - `options`: `AddVideosGridOptions` containing layout details like the number of rows and columns, lists of main and alternate
     ///   grid streams, flags for removing alternate grids, and other stream-related parameters.
     ///
     /// ### Example:
     /// ```dart
     /// await addVideosGrid(AddVideosGridOptions(
     ///   mainGridStreams: [/* main stream participants */],
     ///   altGridStreams: [/* alternate stream participants */],
     ///   numRows: 2,
     ///   numCols: 2,
     ///   actualRows: 2,
     ///   lastRowCols: 1,
     ///   removeAltGrid: true,
     ///   parameters: gridParams,
     /// ));
     /// ```
     Future<void> addVideosGrid(AddVideosGridOptions options) async {
       try {
         // Retrieve updated parameters
         AddVideosGridParameters parameters = options.parameters.getUpdatedAllParams();

         // Clear existing grids if necessary
         if (options.removeAltGrid) {
           parameters.updateOtherGridStreams([]);
         }

         // Create VideoCards for participants with active video streams
         List<Widget> videoCards = options.mainGridStreams.map((stream) {
           return VideoCard(
             options: VideoCardOptions(
               name: stream.participant.name,
               videoStream: stream.stream,
               isMuted: stream.participant.isMuted,
               showControls: false,
               showInfo: false,
             ),
           );
         }).toList();

         // Create AudioCards for participants with audio only
         List<Widget> audioCards = options.altGridStreams.map((stream) {
           int random = 1 + (DateTime.now().millisecondsSinceEpoch % 70);
           final imageSource = 'https://picsum.photos/200?unique=$random';
           return AudioCard(
             options: AudioCardOptions(
               name: stream.participant.name,
               isMuted: stream.participant.isMuted,
               imgSource: imageSource,
             ),
           );
         }).toList();

         // Combine video and audio cards
         List<Widget> combinedCards = [...videoCards, ...audioCards];

         // Update the other grid streams
         parameters.updateOtherGridStreams([combinedCards]);
       } catch (e) {
         debugPrint("Error in addVideosGrid: $e");
       }
     }
     ```

     *Explanation*: This function constructs video and audio cards based on participant streams, allowing for dynamic UI updates.

### 4.2 Develop Custom `MediasfuGeneric` Component

1. **Create Custom `MediasfuGeneric` File**:

   - **Create File**: `lib/components/custom/mediasfu_generic_custom.dart`

   - **Add the Following Code**:

     ```dart
     import 'package:flutter/material.dart';
     import 'package:mediasfu_sdk/mediasfu_sdk.dart';
     import 'add_videos_grid.dart';

     class MediasfuGenericCustom extends StatelessWidget {
       final MediasfuGenericOptions options;

       const MediasfuGenericCustom({Key? key, required this.options}) : super(key: key);

       @override
       Widget build(BuildContext context) {
         return MediasfuGeneric(
           options: options.copyWith(
             addVideosGrid: addVideosGrid, // Override with custom addVideosGrid
           ),
         );
       }
     }
     ```

     *Explanation*: This custom `MediasfuGeneric` component replaces the default `addVideosGrid` function with our tailored version, enabling customized video rendering.

2. **Integrate Custom Component into Handler**:

   - **Open `MediaSFUHandler` Component**:

     Navigate to `lib/components/mediasfu_handler.dart`.

   - **Modify Imports**:

     ```dart
     import 'package:mediasfu_sdk/mediasfu_sdk.dart' hide MediasfuGeneric, MediasfuGenericOptions;
     import 'custom/mediasfu_generic_custom.dart';
     ```

   - **Update Widget Tree**:

     Replace the default `MediasfuGeneric` with `MediasfuGenericCustom`.

     ```dart
     return SizedBox(
       width: 0,
       height: 0,
       child: MediasfuGenericCustom(
         options: MediasfuGenericOptions(
           credentials: credentials,
           connectMediaSFU: false,
           localLink: "http://localhost:3000",
           returnUI: false,
           noUIPreJoinOptionsCreate: options.action == "create" ? noUIOptions : null,
           noUIPreJoinOptionsJoin: options.action == "join" ? noUIOptions : null,
           sourceParameters: options.sourceParameters,
           updateSourceParameters: options.updateSourceParameters,
         ),
       ),
     );
     ```

     *Explanation*: This integration ensures that all video rendering leverages the customized grid layout and styling.

### 4.3 Testing Custom Video Rendering

1. **Run the Application**:

   - **Start the Flutter App**: Ensure your Flutter application is running.

2. **Join the Room**:

   - **Host**: Use one browser profile to create and host the room.
   - **Participant**: Use another profile or device to join as a participant.

3. **Verify Custom Rendering**:

   - **Video Grids**: Observe the main and mini video grids to ensure videos are rendered with the custom `VideoCard` styles.
   - **Audio Cards**: Check that audio-only participants display with randomized avatar images.

   *Note*: The custom styles should now reflect in the video and audio cards, enhancing the overall UI aesthetics.

---

## Step 5: Final Testing and Refinements

### 5.1 Comprehensive Testing

1. **Multiple Participants**:

   - **Simulate Multi-User Environment**: Join the room from multiple devices or browser profiles to test video stream handling.
   
2. **Camera Controls**:

   - **Toggle Video**: Enable and disable video streams to ensure seamless transitions.
   - **Switch Cameras**: Use the switch camera functionality to alternate between available cameras and verify the video updates.

3. **Participant Management**:

   - **Mute/Unmute**: As a host, mute and unmute participants, observing real-time UI updates.
   - **Remove Participants**: Remove participants from the room and ensure their video streams are terminated.

4. **Error Handling**:

   - **Invalid Actions**: Attempt actions like switching cameras when no alternate camera is available to test error resilience.
   - **Stream Failures**: Simulate stream interruptions and observe the application's response.

### 5.2 UI Refinements

1. **Styling Enhancements**:

   - **Responsive Design**: Ensure video grids adapt gracefully to different screen sizes and orientations.
   - **Visual Feedback**: Provide clear indicators for muted participants and active video streams.

2. **Performance Optimization**:

   - **Stream Management**: Limit the number of active video streams rendered to prevent performance bottlenecks, especially on resource-constrained devices.
   - **Lazy Loading**: Implement lazy loading for video streams to enhance performance during high participant counts.

3. **Accessibility Considerations**:

   - **Descriptive Labels**: Ensure buttons and controls have descriptive labels for screen readers.
   - **Contrast Ratios**: Maintain sufficient color contrasts for readability.

---

## Conclusion

Congratulations! You've successfully navigated through the advanced integration of the MediaSFU Flutter SDK into your project. By focusing on video functionalities, custom rendering, and stream management, your application now boasts a sophisticated multimedia experience tailored to your specific needs.

**Key Takeaways**:

- **Custom Components**: Building custom components like `VideoCard` and `MediasfuGenericCustom` allows for enhanced control over media rendering and UI aesthetics.
- **Stream Management**: Efficiently handling `MediaStream` objects ensures optimal performance and user experience.
- **Scalability**: With MediaSFU's robust capabilities, your application can scale to accommodate numerous participants without compromising on quality.

For further advancements, consider exploring features like screen sharing, virtual backgrounds, and breakout rooms. These functionalities can be seamlessly integrated using the MediaSFU Flutter SDK, elevating your application's interactivity and engagement.

**Final Note**: Always ensure that your API credentials and sensitive configurations are securely managed. Utilize environment variables or secure storage solutions to safeguard your application's integrity.

Thank you for following through this advanced guide. We hope it empowers you to harness the full potential of MediaSFU within your Flutter projects.s