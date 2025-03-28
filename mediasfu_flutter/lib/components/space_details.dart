// ignore_for_file: use_build_context_synchronously
import 'dart:async';
import 'dart:math';
import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:mediasfu_sdk/mediasfu_sdk.dart'
    show
        AudioGrid,
        AudioGridOptions,
        FlexibleGrid,
        FlexibleGridOptions,
        FlexibleVideo,
        FlexibleVideoOptions,
        MediasfuParameters,
        Participant,
        Stream;
import '../api/api.dart';
import '../types/types.dart';
import 'spinner.dart';
import 'custom_modal.dart';
import 'participant_card.dart';
import 'audio_level_bars.dart';
import 'mediasfu_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/use_mediasfu_sdk.dart';
import 'transforms/video_card_transformer.dart';

class SpaceDetails extends StatefulWidget {
  final String? spaceId;
  const SpaceDetails({super.key, this.spaceId});

  @override
  // ignore: library_private_types_in_public_api
  _SpaceDetailsState createState() => _SpaceDetailsState();
}

class _SpaceDetailsState extends State<SpaceDetails> {
  // Space and User Data
  final ValueNotifier<Space?> space = ValueNotifier<Space?>(null);
  final ValueNotifier<ParticipantData?> currentUser =
      ValueNotifier<ParticipantData?>(null);
  final ValueNotifier<bool> isLoading = ValueNotifier<bool>(true);
  final ValueNotifier<bool> canSpeak = ValueNotifier<bool>(false);
  final ValueNotifier<bool> showJoinRequests = ValueNotifier<bool>(false);
  final ValueNotifier<bool> showSpeakRequests = ValueNotifier<bool>(false);
  final ValueNotifier<String> message = ValueNotifier<String>("");

  final ValueNotifier<MediaSFUHandlerOptions?> showRoomDetails =
      ValueNotifier<MediaSFUHandlerOptions?>(null);
  final ValueNotifier<bool> showRoom = ValueNotifier<bool>(false);
  final ValueNotifier<bool> isPending = ValueNotifier<bool>(false);

  final ValueNotifier<MediasfuParameters?> mediasfuParams =
      ValueNotifier<MediasfuParameters?>(null);

  final ValueNotifier<List<List<Widget>>> allRoomVideos =
      ValueNotifier<List<List<Widget>>>([]);
  final ValueNotifier<List<Stream>> allRoomVideoStreams =
      ValueNotifier<List<Stream>>([]);

  final ValueNotifier<List<Widget>> allRoomAudios =
      ValueNotifier<List<Widget>>([]);
  final ValueNotifier<List<Widget>> mainVideo = ValueNotifier<List<Widget>>([]);
  final ValueNotifier<double> audioLevel = ValueNotifier<double>(0.0);
  final ValueNotifier<bool> mediasfuChanged = ValueNotifier<bool>(false);

  updateMediasfuParams(MediasfuParameters? params) {
    mediasfuParams.value = params;
    mediasfuChanged.value = !mediasfuChanged.value;
  }

  List<MediaDeviceInfo> videoInputs = [];
  String? selectedVideoInput;
  bool isConnected = false;
  bool isMuted = true;
  bool videoOn = false;

  bool scheduled = false;

  Timer? _spaceRefreshTimer;
  Timer? _messageTimer;

  // Lifecycle Methods
  @override
  void initState() {
    super.initState();
    if (widget.spaceId == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        Navigator.pop(context);
      });
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Initialize once
    if (_spaceRefreshTimer == null && widget.spaceId != null) {
      _spaceRefreshTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
        if (!mounted) {
          timer.cancel();
          return;
        }
        fetchSpaceDetails();
      });

      //add a listener to mediasfuParams (via mediasfuChanged)
      mediasfuChanged.addListener(() {
        _updateStateParameters(mediasfuParams.value);
      });
    }
  }

  @override
  void dispose() {
    _messageTimer?.cancel();
    _spaceRefreshTimer?.cancel();
    space.dispose();
    currentUser.dispose();
    isLoading.dispose();
    canSpeak.dispose();
    showJoinRequests.dispose();
    showSpeakRequests.dispose();
    message.dispose();
    super.dispose();
  }

  void checkJoinRoom() {
    if (space.value == null || currentUser.value == null) {
      return;
    }

    if (!showRoom.value) {
      if (space.value?.remoteName != null &&
          !space.value!.remoteName.contains('remote_')) {
        joinRoom();
      } else if (space.value?.remoteName != null &&
          space.value!.remoteName.contains('remote_')) {
        if (currentUser.value?.role == ParticipantRole.host) {
          createRoom();
        } else {
          setMessage("Host has not created a room yet.");
        }
      }
    }
  }

  void updateRoomDetails(String action) {
    if (!mounted) return;
    if (action == 'join') {
      setState(() {
        showRoomDetails.value = MediaSFUHandlerOptions(
          action: "join",
          name: currentUser.value!.id,
          meetingID: space.value!.remoteName,
          sourceParameters: mediasfuParams.value,
          updateSourceParameters: updateMediasfuParams,
        );
      });
    } else {
      setState(() {
        showRoomDetails.value = MediaSFUHandlerOptions(
          action: "create",
          duration: (space.value?.duration != null
              ? (space.value!.duration! / (60 * 1000)).round()
              : 15),
          capacity: space.value?.capacity ?? 5,
          name: currentUser.value!.id,
          sourceParameters: mediasfuParams.value,
          updateSourceParameters: updateMediasfuParams,
        );
      });
    }
  }

  void joinRoom() {
    if (isPending.value) return;
    isPending.value = true;
    updateRoomDetails('join');
    setState(() {
      showRoom.value = true;
    });
    isPending.value = false;
  }

  void createRoom() {
    if (isPending.value) return;
    isPending.value = true;
    updateRoomDetails('create');
    setState(() {
      showRoom.value = true;
    });
    isPending.value = false;
  }

  // Fetch Space Details from API
  Future<void> fetchSpaceDetails() async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    final prefs = await SharedPreferences.getInstance();
    final uid = prefs.getString('currentUserId');
    if (uid == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        Navigator.pushNamed(context, "/welcome");
      });
      return;
    }

    try {
      final fetchedSpace = await APIService.instance.fetchSpaceById(spaceId);
      if (fetchedSpace == null ||
          (fetchedSpace.endedAt != null && fetchedSpace.endedAt! > 0)) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted) return;
          Navigator.pop(context);
        });
        return;
      }

      setState(() {
        space.value = fetchedSpace;
      });

      if (!isConnected) {
        try {
          handleJoinOrCreateRoom();
        } catch (e, s) {
          debugPrint('Error handling room creation/joining: $e $s');
        }
      }

      final participant = fetchedSpace.participants.firstWhereOrNull(
        (p) => p.id == uid,
      );
      if (participant != null) {
        currentUser.value = participant;
      }

      // Determine canSpeak status
      if (participant != null &&
          (participant.role == ParticipantRole.speaker ||
              participant.role == ParticipantRole.host ||
              !(fetchedSpace.askToSpeak))) {
        canSpeak.value = true;
      } else {
        canSpeak.value = false;
      }

      // Compute 'scheduled' based on current time and space's start time
      final now = DateTime.now().millisecondsSinceEpoch;
      scheduled = fetchedSpace.startedAt > now;

      // Check if the user is banned
      if (fetchedSpace.banned.contains(uid)) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted) return;
          setMessage("You have been banned from this space.");
          setState(() {
            showRoomDetails.value = null;
            showRoom.value = false;
          });
          Future.delayed(const Duration(seconds: 1), () {
            if (!mounted) return;
            Navigator.pop(context);
          });
        });
        return;
      }
    } catch (e) {
      debugPrint('Error fetching space details: $e');
    } finally {
      isLoading.value = false;
    }
  }

  // Handle Room Creation or Joining
  void handleJoinOrCreateRoom() {
    final now = DateTime.now().millisecondsSinceEpoch;
    final isHost = currentUser.value?.role == ParticipantRole.host;
    final canJoinNow = (space.value?.startedAt != null) &&
        (space.value!.startedAt - now <= 5 * 60 * 1000) &&
        (space.value!.active) &&
        !(space.value!.endedAt != null || !space.value!.active);
    if (canJoinNow && !showRoom.value) {
      final hasNoRoom = (space.value?.remoteName != null &&
              space.value!.remoteName.isNotEmpty &&
              space.value!.remoteName.contains('remote_')) ||
          (space.value?.remoteName == null || space.value!.remoteName.isEmpty);
      if (isHost && hasNoRoom && currentUser.value != null) {
        createRoom();
      } else if (!hasNoRoom && currentUser.value != null && !showRoom.value) {
        joinRoom();
      }
    }
  }

  void _updateStateParameters(MediasfuParameters? params) {
    if (!mounted) return;
    if (params == null ||
        params.roomName.isEmpty ||
        params.roomName == 'none') {
      return;
    }

    if (videoOn != params.videoAlreadyOn) {
      videoOn = params.videoAlreadyOn;
    }

    bool hasNoRoom = (space.value?.remoteName != null &&
            space.value!.remoteName.isNotEmpty &&
            space.value!.remoteName.contains('remote_')) ||
        (space.value?.remoteName == null || space.value!.remoteName.isEmpty);

    if (hasNoRoom) {
      if (params.roomName.isNotEmpty) {
        APIService.instance.updateSpace(space.value!.id, {
          'remoteName': params.roomName,
        });
        if (!isConnected) {
          setState(() {
            isConnected = true;
          });
        }

        debugPrint('Room Name Updated: ${params.roomName}');

        // Avoid auto wave
        mediasfuParams.value!.updateAutoWave(false);
      }
    } else {
      if (params.roomName.isNotEmpty &&
          params.roomName != 'none' &&
          !isConnected) {
        if (!isConnected) {
          isConnected = true;
        }

        // Avoid auto wave
        mediasfuParams.value!.updateAutoWave(false);
      }
    }

    if (!const ListEquality()
        .equals(params.audioOnlyStreams, allRoomAudios.value)) {
      allRoomAudios.value = params.audioOnlyStreams;
    }

    if (!const ListEquality()
        .equals(params.allVideoStreams, allRoomVideoStreams.value)) {
      allRoomVideoStreams.value = params.allVideoStreams;
    }

    if (!const ListEquality()
        .equals(params.otherGridStreams, allRoomVideos.value)) {
      allRoomVideos.value = params.otherGridStreams;
    }

    if (!const ListEquality().equals(params.mainGridStream, mainVideo.value)) {
      mainVideo.value = params.mainGridStream;
    }

    if (isMuted != !params.audioAlreadyOn) {
      isMuted = !params.audioAlreadyOn;

      final newParticipants = space.value?.participants.map((p) {
        if (p.id == currentUser.value?.id) {
          return p.copyWith(muted: !params.audioAlreadyOn);
        }
        return p;
      }).toList();

      //convert the list of participants to a list of maps

      final newParticipantsMap =
          newParticipants?.map((p) => p.toJson()).toList();

      APIService.instance.updateSpace(space.value!.id, {
        'participants': newParticipantsMap,
      });
    }

    if (params.audioLevel != null && params.audioLevel != audioLevel.value) {
      audioLevel.value = params.audioLevel!;
    }

    if (params.alertMessage != message.value &&
        params.alertMessage.isNotEmpty) {
      message.value = params.alertMessage;
      if (params.alertMessage.isNotEmpty &&
          !params.alertMessage.contains('rotate')) {
        setMessage(params.alertMessage);
      }
      if (params.alertMessage.contains('meeting has ended')) {
        if (currentUser.value?.role == ParticipantRole.host && isConnected) {
          handleEndSpace();
        } else {
          handleLeave();
        }
      }
    }
  }

  /// Disconnects the room and updates the state.
  Future<void> disconnectRoomFromSpace() async {
    await disconnectRoom(
      sourceParameters: mediasfuParams.value,
    );
  }

  /// Handles joining the space via API and MediaSFU.
  Future<void> handleJoin() async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    final user = currentUser.value;
    if (user == null) return;

    if (space.value?.banned.contains(user.id) ?? false) {
      setMessage("You have been banned from this space.");
      setState(() {
        showRoomDetails.value = null;
        showRoom.value = false;
      });

      Future.delayed(const Duration(seconds: 1), () {
        if (!mounted) return;
        Navigator.pop(context);
      });
      return;
    }

    if ((space.value?.askToJoin ?? false) &&
        !(user.role == ParticipantRole.host ||
            space.value!.approvedToJoin.contains(user.id))) {
      // Handle join requests
      if (space.value!.askToJoinQueue.contains(user.id)) {
        setMessage("Your request to join is pending approval by the host.");
        return;
      } else if (space.value!.askToJoinHistory.contains(user.id)) {
        setMessage("Your request to join was rejected by the host.");
        return;
      }

      try {
        await APIService.instance.joinSpace(
            spaceId,
            UserProfile(
              id: user.id,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              taken: true,
            ),
            asSpeaker: !(space.value?.askToSpeak ?? false));
        setMessage(
            "Your request to join has been sent and is pending approval.");
        fetchSpaceDetails();
      } catch (e) {
        setMessage("Error requesting to join. Please try again.");
      }
    } else {
      // Directly join
      try {
        await APIService.instance.joinSpace(
            spaceId,
            UserProfile(
              id: user.id,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              taken: true,
            ),
            asSpeaker: !(space.value?.askToSpeak ?? false));
        fetchSpaceDetails();
      } catch (e) {
        setMessage("Error joining the space. Please try again.");
      }
    }
  }

  /// Handles leaving the space and disconnecting from MediaSFU.
  Future<void> handleLeave() async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    final user = currentUser.value;
    if (user == null) return;

    try {
      await APIService.instance.leaveSpace(spaceId, user.id);
      await disconnectRoomFromSpace();
      Future.delayed(const Duration(seconds: 1), () {
        if (!mounted) return;
        Navigator.pop(context);
      });
    } catch (e) {
      setMessage("Error leaving the space. Please try again.");
    }
  }

  /// Mutes a specific participant.
  Future<void> handleMuteParticipant(String participantId) async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    try {
      await restrictMedia(
          sourceParameters: mediasfuParams.value,
          remoteMember: participantId,
          mediaType: "audio");
      await APIService.instance.muteParticipant(spaceId, participantId, true);
      fetchSpaceDetails();
    } catch (e) {
      setMessage("Error muting participant. Please try again.");
    }
  }

  /// Ends the space if the current user is the host.
  Future<void> handleEndSpace() async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    try {
      await APIService.instance.endSpace(spaceId);
      await disconnectRoomFromSpace();
      Future.delayed(const Duration(seconds: 1), () {
        if (!mounted) return;
        Navigator.of(context)
          ..pop()
          ..pop();
      });
    } catch (e) {
      setMessage("Error ending the space. Please try again.");
    }
  }

  /// Removes a participant from the space if the current user is the host.
  Future<void> handleRemoveParticipant(String participantId) async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    try {
      //Implement the removeMember method
      await removeMember(
          sourceParameters: mediasfuParams.value, remoteMember: participantId);
      await APIService.instance.banParticipant(spaceId, participantId);
      setMessage("Participant removed successfully.");
      fetchSpaceDetails();
    } catch (e) {
      setMessage("Error removing participant. Please try again.");
    }
  }

  /// Toggles the microphone state.
  Future<void> handleToggleMic() async {
    final user = currentUser.value;
    if (user == null) return;

    if (user.role == ParticipantRole.speaker ||
        user.role == ParticipantRole.host ||
        !(space.value?.askToSpeak ?? false)) {
      try {
        await toggleVideo(sourceParameters: mediasfuParams.value);

        // Get the list of all available media devices
        List<MediaDeviceInfo> devices =
            await navigator.mediaDevices.enumerateDevices();

        // Filter devices to get only audio and video input devices
        videoInputs =
            devices.where((device) => device.kind == 'videoinput').toList();
      } catch (e) {
        setMessage("Error toggling mic.");
      }
    } else {
      setMessage("You do not have permission to toggle your mic.");
    }
  }

  /// Checks and requests to speak.
  Future<void> checkRequestToSpeak() async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    final user = currentUser.value;
    if (user == null) return;

    if (space.value?.rejectedSpeakers.contains(user.id) ?? false) {
      setMessage("You have been rejected from speaking in this space.");
      return;
    }

    if (space.value?.askToSpeakQueue.contains(user.id) ?? false) {
      setMessage("Your request to speak is pending approval by the host.");
      return;
    }

    try {
      await APIService.instance.requestToSpeak(spaceId, user.id);
      setMessage(
          "Your request to speak has been sent and is pending approval.");
      fetchSpaceDetails();
    } catch (e) {
      setMessage("Error requesting to speak. Please try again.");
    }
  }

  /// Sets a temporary message.
  void setMessage(String msg) {
    if (!mounted) return;
    setState(() {
      message.value = msg;
    });
    _messageTimer?.cancel(); // Cancel any existing timer.
    _messageTimer = Timer(const Duration(seconds: 4), () {
      if (!mounted) return;
      setState(() {
        message.value = "";
      });
    });
  }

  // Helper Methods

  Future<void> approveJoinRequest(String userId) async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    try {
      await APIService.instance.approveJoinRequest(spaceId, userId);
      setMessage("Join request approved.");
      fetchSpaceDetails();
    } catch (e) {
      setMessage("Error approving join request.");
    }
  }

  Future<void> rejectJoinRequest(String userId) async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    try {
      await APIService.instance.rejectJoinRequest(spaceId, userId);
      setMessage("Join request rejected.");
      fetchSpaceDetails();
    } catch (e) {
      setMessage("Error rejecting join request.");
    }
  }

  Future<void> approveSpeakRequest(String userId) async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    try {
      await APIService.instance.approveRequest(spaceId, userId, true);
      setMessage("Speak request approved.");
      fetchSpaceDetails();
    } catch (e) {
      setMessage("Error approving speak request.");
    }
  }

  Future<void> rejectSpeakRequest(String userId) async {
    final spaceId = widget.spaceId;
    if (spaceId == null) return;

    try {
      await APIService.instance.rejectRequest(spaceId, userId);
      setMessage("Speak request rejected.");
      fetchSpaceDetails();
    } catch (e) {
      setMessage("Error rejecting speak request.");
    }
  }

  String _resolveAvatarUrl(String? url) {
    if (kIsWeb && url != null && url.contains('pravatar.cc')) {
      // Generate a unique identifier for the fallback URL
      int? randomId;
      // first check if the url contains a unique query parameter
      if (url.contains('img=')) {
        randomId = int.tryParse(url.split('img=')[1]);
      }
      // if not, generate a random number
      randomId ??= Random().nextInt(1000);

      return 'https://picsum.photos/200?unique=$randomId';
    }
    return url ?? 'https://www.mediasfu.com/logo192.png';
  }

  /// Builds status icons with labels.
  Widget _buildStatusIcon(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12.0),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 2.0,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          FaIcon(icon, color: Colors.white, size: 14.0),
          const SizedBox(width: 4.0),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12.0,
            ),
          ),
        ],
      ),
    );
  }

  void handleSelectCamera(String? deviceId) {
    setState(() {
      selectedVideoInput = deviceId;
    });
    // Implement camera switching logic with mediasfu_sdk
    selectCamera(
      sourceParameters: mediasfuParams.value,
      deviceId: deviceId!,
    );
  }

  MediaStream? getVideoStreamForParticipant({
    required Participant refParticipant, // Reference participant on Mediasfu
    required ParticipantData? currentUser,
    required ParticipantData participant,
    required List<List<Widget>> allRoomVideos,
    required List<Widget> mainVideo,
    required List<Stream> allRoomVideoStreams,
    required MediasfuParameters? mediasfuParams,
  }) {
    try {
      // // Option 1: Check in allRoomVideos for a matching participant name
      // final flattenedAllRoomVideos =
      //     allRoomVideos.expand((list) => list).toList();

      // Widget? videoComponent = flattenedAllRoomVideos.firstWhereOrNull(
      //   (widget) {
      //     // Check if the widget's runtimeType is 'VideoCard'
      //     if (widget.runtimeType.toString() == 'VideoCard') {
      //       // Safely cast to dynamic to access properties
      //       final dynamic dynamicWidget = widget;

      //       // Access the 'options' property dynamically
      //       if (dynamicWidget.options != null) {
      //         final isDirectMatch =
      //             dynamicWidget.options.name == participant.id;
      //         final isYouYouMatch =
      //             dynamicWidget.options.name.contains('youyou') &&
      //                 refParticipant.name == currentUser?.id;

      //         return isDirectMatch || isYouYouMatch;
      //       }
      //     }
      //     return false;
      //   },
      // );

      // if (videoComponent != null) {
      //   // Safely cast to dynamic to access properties
      //   final dynamic dynamicWidget = videoComponent;

      //   final options = dynamicWidget.options;
      //   final videoStream = options.videoStream;
      //   return videoStream;
      // } else if (videoComponent == null &&
      //     mainVideo.isNotEmpty &&
      //     participant.role == ParticipantRole.host) {
      //   //get first item in mainVideo
      //   final videoStreamWidget = mainVideo.first;
      //   // Safely cast to dynamic to access properties
      //   final dynamic dynamicWidget = videoStreamWidget;
      //   return dynamicWidget.options.videoStream;
      // }

      // return null;

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100], // Light background for the app
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints:
                const BoxConstraints(maxWidth: 800), // Max width set to 800px
            child: Container(
              padding: const EdgeInsets.all(16.0),
              child: Stack(
                children: [
                  ValueListenableBuilder<bool>(
                    valueListenable: isLoading,
                    builder: (context, loading, child) {
                      if (loading) {
                        return const Center(child: Spinner());
                      }

                      if (space.value == null) {
                        return const Center(child: Text('Space not found.'));
                      }

                      return SingleChildScrollView(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            // Header with Back and Action Buttons
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                // Back Button
                                ElevatedButton.icon(
                                  onPressed: () => Navigator.pop(context),
                                  icon: const FaIcon(
                                    FontAwesomeIcons.arrowLeft,
                                    size: 16.0,
                                  ),
                                  label: const Text('Back'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    foregroundColor: const Color(0xFF1DA1F2),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 12.0, vertical: 8.0),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8.0),
                                    ),
                                    elevation: 0,
                                  ).copyWith(
                                    overlayColor:
                                        WidgetStateProperty.resolveWith<Color?>(
                                      (states) {
                                        if (states
                                            .contains(WidgetState.hovered)) {
                                          return const Color(0xFF1DA1F2)
                                              .withOpacity(0.1);
                                        }
                                        return null;
                                      },
                                    ),
                                  ),
                                ),

                                // Audio Controls (End Space or Leave)
                                if (currentUser.value != null &&
                                    space.value!.active)
                                  Row(
                                    children: [
                                      // Connection Status Indicator
                                      Container(
                                        padding: const EdgeInsets.all(4.0),
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: isConnected
                                              ? Colors.green
                                              : const Color(0xFFAF4646),
                                        ),
                                        child: Tooltip(
                                          message: isConnected
                                              ? "Connected"
                                              : "Disconnected",
                                          child: Container(
                                            width: 10,
                                            height: 10,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: isConnected
                                                  ? Colors.green
                                                  : const Color(0xFFAF4646),
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8.0),

                                      // Conditional Buttons
                                      if (isConnected)
                                        if (canSpeak.value)
                                          Row(
                                            children: [
                                              // Toggle Mic Button
                                              ElevatedButton.icon(
                                                onPressed: handleToggleMic,
                                                icon: isMuted
                                                    ? const FaIcon(
                                                        FontAwesomeIcons
                                                            .microphoneSlash,
                                                        size: 16.0,
                                                      )
                                                    : const FaIcon(
                                                        FontAwesomeIcons
                                                            .microphone,
                                                        size: 16.0,
                                                      ),
                                                label: Text(isMuted
                                                    ? "Turn on Mic"
                                                    : "Turn off Mic"),
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: isMuted
                                                      ? Colors.green
                                                      : Colors.blue,
                                                  foregroundColor: Colors.white,
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 12.0,
                                                      vertical: 8.0),
                                                  shape: RoundedRectangleBorder(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            8.0),
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 8.0),

                                              if (videoOn)
                                                ElevatedButton.icon(
                                                  onPressed: () => switchCamera(
                                                    sourceParameters:
                                                        mediasfuParams.value,
                                                  ),
                                                  icon: const FaIcon(
                                                    FontAwesomeIcons.camera,
                                                    size: 16.0,
                                                  ),
                                                  label: const Text(
                                                      'Switch Camera'),
                                                  style:
                                                      ElevatedButton.styleFrom(
                                                    backgroundColor:
                                                        Colors.blue,
                                                    foregroundColor:
                                                        Colors.white,
                                                    padding: const EdgeInsets
                                                        .symmetric(
                                                        horizontal: 12.0,
                                                        vertical: 8.0),
                                                    shape:
                                                        RoundedRectangleBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              8.0),
                                                    ),
                                                  ),
                                                ),

                                              const SizedBox(width: 8.0),
                                              if (videoInputs.length > 1)
                                                Container(
                                                  decoration: BoxDecoration(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            8),
                                                    border: Border.all(
                                                        color: Colors.white
                                                            .withOpacity(0.3)),
                                                  ),
                                                  padding: const EdgeInsets
                                                      .symmetric(horizontal: 8),
                                                  child:
                                                      DropdownButtonHideUnderline(
                                                    child: ConstrainedBox(
                                                      constraints:
                                                          const BoxConstraints(
                                                              maxWidth: 100),
                                                      child: DropdownButton<
                                                          String>(
                                                        value:
                                                            selectedVideoInput,
                                                        onChanged:
                                                            handleSelectCamera,
                                                        icon: const FaIcon(
                                                          FontAwesomeIcons
                                                              .camera,
                                                          size: 14.0,
                                                          color: Colors.white70,
                                                        ),
                                                        dropdownColor:
                                                            Colors.black87,
                                                        iconEnabledColor:
                                                            Colors.white70,
                                                        style: const TextStyle(
                                                          fontSize: 13,
                                                          color: Colors.white,
                                                          fontWeight:
                                                              FontWeight.w500,
                                                        ),
                                                        isExpanded: true,
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(8),
                                                        items: videoInputs
                                                            .map((input) =>
                                                                DropdownMenuItem(
                                                                  value: input
                                                                      .deviceId,
                                                                  child: Text(
                                                                    input.label,
                                                                    overflow:
                                                                        TextOverflow
                                                                            .ellipsis,
                                                                  ),
                                                                ))
                                                            .toList(),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                            ],
                                          )
                                        else
                                          // Request to Speak Button
                                          ElevatedButton.icon(
                                            onPressed: checkRequestToSpeak,
                                            icon: const FaIcon(
                                              FontAwesomeIcons.microphoneSlash,
                                              size: 16.0,
                                            ),
                                            label:
                                                const Text('Request to Speak'),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  const Color(0xFFE74C3C),
                                              foregroundColor: Colors.white,
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 12.0,
                                                      vertical: 8.0),
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(8.0),
                                              ),
                                            ),
                                          )
                                      else
                                        // Connect Audio Button
                                        ElevatedButton.icon(
                                          onPressed: () {
                                            if (!showRoom.value) {
                                              checkJoinRoom();
                                            }
                                          },
                                          icon: const FaIcon(
                                            FontAwesomeIcons.connectdevelop,
                                            size: 16.0,
                                          ),
                                          label: const Text('Connect Audio'),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.blue,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 12.0,
                                                vertical: 8.0),
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(8.0),
                                            ),
                                          ),
                                        ),

                                      const SizedBox(width: 8.0),

                                      // End Space or Leave Button
                                      ElevatedButton.icon(
                                        onPressed: currentUser.value!.role ==
                                                ParticipantRole.host
                                            ? handleEndSpace
                                            : handleLeave,
                                        icon: currentUser.value!.role ==
                                                ParticipantRole.host
                                            ? const FaIcon(
                                                FontAwesomeIcons.powerOff,
                                                size: 16.0,
                                              )
                                            : const FaIcon(
                                                FontAwesomeIcons
                                                    .rightFromBracket,
                                                size: 16.0,
                                              ),
                                        label: currentUser.value!.role ==
                                                ParticipantRole.host
                                            ? const Text('End Space')
                                            : const Text('Leave'),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor:
                                              currentUser.value!.role ==
                                                      ParticipantRole.host
                                                  ? const Color(0xFFD93025)
                                                  : Colors.blue,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 12.0, vertical: 8.0),
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(8.0),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                              ],
                            ),
                            const SizedBox(height: 16.0),

                            // Message Display
                            ValueListenableBuilder<String>(
                              valueListenable: message,
                              builder: (context, msg, child) {
                                if (msg.isEmpty) {
                                  return const SizedBox.shrink();
                                }
                                return GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      message.value = "";
                                    });
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 8.0, horizontal: 16.0),
                                    margin: const EdgeInsets.only(bottom: 16.0),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE0DB9A),
                                      border: Border.all(
                                          color: const Color(0xFFE0DB9A)),
                                      borderRadius: BorderRadius.circular(12.0),
                                      boxShadow: const [
                                        BoxShadow(
                                          color: Colors.black12,
                                          blurRadius: 4.0,
                                          offset: Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.error,
                                            color: Colors.red),
                                        const SizedBox(width: 8.0),
                                        Expanded(
                                          child: Text(
                                            msg,
                                            style: const TextStyle(
                                                color: Color(0xFF151414),
                                                fontSize: 12.0),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),

                            // Space Information Container
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(16.0),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF7F7F7),
                                borderRadius: BorderRadius.circular(10.0),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Colors.black12,
                                    blurRadius: 10.0,
                                    offset: Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  // Space Title
                                  Text(
                                    space.value!.title,
                                    style: const TextStyle(
                                      fontSize: 24.0,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black87,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 8.0),

                                  // Space Description
                                  Text(
                                    space.value!.description,
                                    style: const TextStyle(
                                      fontSize: 16.0,
                                      color: Colors.grey,
                                      height: 1.6,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 16.0),

                                  // Status Icons
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      if (space.value!.endedAt != null &&
                                          !space.value!.active)
                                        _buildStatusIcon(
                                            FontAwesomeIcons.flagCheckered,
                                            'Ended',
                                            const Color(0xFFD93025)),
                                      if (scheduled &&
                                          !DateTime.fromMillisecondsSinceEpoch(
                                                  space.value!.endedAt!)
                                              .isBefore(DateTime.now()))
                                        _buildStatusIcon(
                                            FontAwesomeIcons.clock,
                                            'Scheduled',
                                            const Color(0xFFFBC02D)),
                                      if (!scheduled &&
                                          space.value!.active &&
                                          space.value!.endedAt == null)
                                        _buildStatusIcon(
                                            FontAwesomeIcons.circleCheck,
                                            'Live Now',
                                            const Color(0xFF1DA1F2)),
                                    ],
                                  ),
                                  const SizedBox(height: 16.0),

                                  // Audio Level Bars
                                  ValueListenableBuilder<double>(
                                    valueListenable: audioLevel,
                                    builder: (context, audioLevel, child) {
                                      return AudioLevelBars(
                                          audioLevel: audioLevel);
                                    },
                                  ),

                                  const SizedBox(height: 16.0),

                                  // Viewer and Listener Counts
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Row(
                                        children: [
                                          const FaIcon(FontAwesomeIcons.users,
                                              color: Colors.grey, size: 14.0),
                                          const SizedBox(width: 4.0),
                                          Text(
                                              '${space.value!.speakers.isEmpty ? 1 : (space.value!.speakers.length + 1)} Speakers'),
                                        ],
                                      ),
                                      const SizedBox(width: 16.0),
                                      Row(
                                        children: [
                                          const FaIcon(FontAwesomeIcons.eye,
                                              color: Colors.grey, size: 14.0),
                                          const SizedBox(width: 4.0),
                                          Text(
                                              '${space.value!.listeners.length} Listeners'),
                                        ],
                                      ),
                                    ],
                                  ),

                                  const SizedBox(height: 16.0),

                                  // Progress Bar
                                  if (space.value!.active &&
                                      space.value!.endedAt == null)
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(8.0),
                                          child: LinearProgressIndicator(
                                            value: (DateTime.now()
                                                        .millisecondsSinceEpoch -
                                                    space.value!.startedAt) /
                                                space.value!.duration!,
                                            minHeight: 8.0,
                                            backgroundColor: Colors.grey[300],
                                            valueColor:
                                                const AlwaysStoppedAnimation<
                                                    Color>(Color(0xFFA6CDE7)),
                                          ),
                                        ),
                                        const SizedBox(height: 4.0),
                                      ],
                                    ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 12.0),

                            // Manage Requests (Join & Speak) for Hosts
                            if (currentUser.value != null &&
                                currentUser.value!.role ==
                                    ParticipantRole.host &&
                                space.value!.active &&
                                (space.value!.askToJoin ||
                                    space.value!.askToSpeak))
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(12.0),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12.0),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Colors.black12,
                                      blurRadius: 6.0,
                                      offset: Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    if (space.value!.askToJoin)
                                      Stack(
                                        children: [
                                          ElevatedButton.icon(
                                            onPressed: () =>
                                                showJoinRequests.value = true,
                                            icon: const FaIcon(
                                              FontAwesomeIcons.userSlash,
                                              size: 14.0,
                                            ),
                                            label: const Text('Join Requests'),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  const Color(0xFF839FB0),
                                              foregroundColor: Colors.white,
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 12.0,
                                                      vertical: 8.0),
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(8.0),
                                              ),
                                            ),
                                          ),
                                          if (space
                                              .value!.askToJoinQueue.isNotEmpty)
                                            Positioned(
                                              top: -4,
                                              right: -4,
                                              child: Container(
                                                padding:
                                                    const EdgeInsets.all(2.0),
                                                decoration: const BoxDecoration(
                                                  color: Colors.red,
                                                  shape: BoxShape.circle,
                                                ),
                                                constraints:
                                                    const BoxConstraints(
                                                  minWidth: 16,
                                                  minHeight: 16,
                                                ),
                                                child: Center(
                                                  child: Text(
                                                    '${space.value!.askToJoinQueue.length}',
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 10.0,
                                                    ),
                                                    textAlign: TextAlign.center,
                                                  ),
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                    const SizedBox(width: 16.0),
                                    if (space.value!.askToSpeak)
                                      Stack(
                                        children: [
                                          ElevatedButton.icon(
                                            onPressed: () =>
                                                showSpeakRequests.value = true,
                                            icon: const FaIcon(
                                              FontAwesomeIcons.microphone,
                                              size: 14.0,
                                            ),
                                            label: const Text('Speak Requests'),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  const Color(0xFF839FB0),
                                              foregroundColor: Colors.white,
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 12.0,
                                                      vertical: 8.0),
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(8.0),
                                              ),
                                            ),
                                          ),
                                          if (space.value!.askToSpeakQueue
                                              .isNotEmpty)
                                            Positioned(
                                              top: -4,
                                              right: -4,
                                              child: Container(
                                                padding:
                                                    const EdgeInsets.all(2.0),
                                                decoration: const BoxDecoration(
                                                  color: Colors.red,
                                                  shape: BoxShape.circle,
                                                ),
                                                constraints:
                                                    const BoxConstraints(
                                                  minWidth: 16,
                                                  minHeight: 16,
                                                ),
                                                child: Center(
                                                  child: Text(
                                                    '${space.value!.askToSpeakQueue.length}',
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 10.0,
                                                    ),
                                                    textAlign: TextAlign.center,
                                                  ),
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                  ],
                                ),
                              ),

                            const SizedBox(height: 24.0),

                            // Participants Section
                            const Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                'Participants',
                                style: TextStyle(
                                  fontSize: 20.0,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8.0),
                            Wrap(
                              spacing: 16.0,
                              runSpacing: 16.0,
                              children:
                                  space.value!.participants.map((participant) {
                                // Fetch the corresponding video stream for the participant
                                MediaStream? videoStream;

                                Participant? refParticipant = mediasfuParams
                                    .value?.participants
                                    .firstWhereOrNull(
                                  (p) => p.name == participant.id,
                                );
                                if (refParticipant != null) {
                                  videoStream = getVideoStreamForParticipant(
                                    refParticipant: refParticipant,
                                    currentUser: currentUser.value,
                                    participant: participant,
                                    allRoomVideos: allRoomVideos.value,
                                    mainVideo: mainVideo.value,
                                    allRoomVideoStreams:
                                        allRoomVideoStreams.value,
                                    mediasfuParams: mediasfuParams.value,
                                  );
                                }

                                return SizedBox(
                                  width: 120.0,
                                  height: 120.0,
                                  child: ParticipantCard(
                                      participant: participant,
                                      isHost: currentUser.value?.role ==
                                          ParticipantRole.host,
                                      onMute: handleMuteParticipant,
                                      currentUserId: currentUser.value?.id,
                                      onToggleMic: handleToggleMic,
                                      onRemove: handleRemoveParticipant,
                                      onApprove: approveSpeakRequest,
                                      onReject: rejectSpeakRequest,
                                      space: space.value,
                                      videoStream: videoStream),
                                );
                              }).toList(),
                            ),

                            const SizedBox(height: 24.0),

                            // Audio Grid
                            SizedBox(
                              height: 0,
                              width: 0,
                              child: AudioGrid(
                                  options: AudioGridOptions(
                                componentsToRender: allRoomAudios.value,
                              )),
                            ),

                            const SizedBox(height: 24.0),

                            // SizedBox(
                            //   height: 400,
                            //   width: 600,
                            //   child: VideoCardTransformer(
                            //       children: allRoomVideos.value.isNotEmpty &&
                            //               allRoomVideos.value[0].isNotEmpty
                            //           ? allRoomVideos.value[0]
                            //           : []),
                            // ),

                            const SizedBox(height: 24.0),

                            SizedBox(
                              height: 400,
                              width: 600,
                              child: FlexibleGrid(
                                options: FlexibleGridOptions(
                                  componentsToRender:
                                      allRoomVideos.value.isNotEmpty &&
                                              allRoomVideos.value[0].isNotEmpty
                                          ? allRoomVideos.value[0]
                                          : [],
                                  columns: allRoomVideos.value.isNotEmpty &&
                                          allRoomVideos.value[0].isNotEmpty
                                      ? allRoomVideos.value[0].length
                                      : 0,
                                  rows: 1,
                                  customWidth: 600,
                                  customHeight: 400,
                                  showAspect: allRoomVideos.value.isNotEmpty &&
                                      allRoomVideos.value[0].isNotEmpty,
                                ),
                              ),
                            ),

                            // Main Video
                            // SizedBox(
                            //   height: 400,
                            //   width: 600,
                            //   child: FlexibleVideo(
                            //     options: FlexibleVideoOptions(
                            //       componentsToRender: mainVideo.value.isNotEmpty
                            //           ? mainVideo.value
                            //           : [const SizedBox.shrink()],
                            //       columns: 1,
                            //       rows: 1,
                            //       customWidth: 600,
                            //       customHeight: 400,
                            //       showAspect: mainVideo.value.isNotEmpty,
                            //     ),
                            //   ),
                            // ),

                            // MediaSFU Handler
                            ValueListenableBuilder<bool>(
                              valueListenable: showRoom,
                              builder: (context, show, child) {
                                return show && showRoomDetails.value != null
                                    ? MediaSFUHandler(
                                        options: showRoomDetails.value!,
                                      )
                                    : const SizedBox.shrink();
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  ),

                  // Modals for Join and Speak Requests
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Join Requests Modal
                        ValueListenableBuilder<bool>(
                          valueListenable: showJoinRequests,
                          builder: (context, show, child) {
                            if (!show) return const SizedBox.shrink();
                            return CustomModal(
                              isOpen: show,
                              onClose: () => showJoinRequests.value = false,
                              title: "Join Requests",
                              child: space.value!.askToJoinQueue.isEmpty
                                  ? const Text("No join requests.")
                                  : Column(
                                      children:
                                          space.value!.askToJoinQueue.map((id) {
                                        final user = space.value!.participants
                                            .firstWhereOrNull(
                                                (p) => p.id == id);
                                        return ListTile(
                                          leading: CircleAvatar(
                                            backgroundImage: NetworkImage(
                                                _resolveAvatarUrl(
                                                    user?.avatarUrl)),
                                          ),
                                          title: Text(user?.displayName ?? id),
                                          trailing: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              IconButton(
                                                icon: const FaIcon(
                                                    FontAwesomeIcons.check,
                                                    color: Colors.green),
                                                onPressed: () =>
                                                    approveJoinRequest(id),
                                                tooltip: 'Approve',
                                              ),
                                              IconButton(
                                                icon: const FaIcon(
                                                    FontAwesomeIcons.xmark,
                                                    color: Colors.red),
                                                onPressed: () =>
                                                    rejectJoinRequest(id),
                                                tooltip: 'Reject',
                                              ),
                                            ],
                                          ),
                                        );
                                      }).toList(),
                                    ),
                            );
                          },
                        ),

                        // Speak Requests Modal
                        ValueListenableBuilder<bool>(
                          valueListenable: showSpeakRequests,
                          builder: (context, show, child) {
                            if (!show) return const SizedBox.shrink();
                            return CustomModal(
                              isOpen: show,
                              onClose: () => showSpeakRequests.value = false,
                              title: "Speak Requests",
                              child: space.value!.askToSpeakQueue.isEmpty
                                  ? const Text("No speak requests.")
                                  : Column(
                                      children: space.value!.askToSpeakQueue
                                          .map((id) {
                                        final user = space.value!.participants
                                            .firstWhereOrNull(
                                                (p) => p.id == id);
                                        return ListTile(
                                          leading: CircleAvatar(
                                            backgroundImage: NetworkImage(
                                                _resolveAvatarUrl(
                                                    user?.avatarUrl)),
                                          ),
                                          title: Text(user?.displayName ?? id),
                                          trailing: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              IconButton(
                                                icon: const FaIcon(
                                                    FontAwesomeIcons.check,
                                                    color: Colors.green),
                                                onPressed: () =>
                                                    approveSpeakRequest(id),
                                                tooltip: 'Approve Speak',
                                              ),
                                              IconButton(
                                                icon: const FaIcon(
                                                    FontAwesomeIcons.xmark,
                                                    color: Colors.red),
                                                onPressed: () =>
                                                    rejectSpeakRequest(id),
                                                tooltip: 'Reject Speak',
                                              ),
                                            ],
                                          ),
                                        );
                                      }).toList(),
                                    ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
