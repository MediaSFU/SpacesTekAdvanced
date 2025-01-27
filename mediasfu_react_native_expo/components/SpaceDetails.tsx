import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal as RNModal,
  ScrollView,
} from "react-native";
import { FontAwesome5 as Icon } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  fetchSpaceById,
  joinSpace,
  leaveSpace,
  muteParticipant,
  endSpace,
  rejectRequest,
  approveRequest,
  fetchUserById,
  requestToSpeak,
  approveJoinRequest,
  rejectJoinRequest,
  updateSpace,
  banParticipant,
} from "../api";
import { Space, ParticipantData } from "../types";
import {
  toggleAudio,
  toggleVideo,
  switchCamera,
  selectCamera,
  disconnectRoom,
  restrictMedia,
  removeMember,
} from "../hooks/useAudioVideoSDK";
import Spinner from "./Spinner";
import ParticipantCard from "./ParticipantCard";
import MediaSFUHandler, { MediaSFUHandlerProps } from "./MediaSFUHandler";
import {
  AudioGrid,
  FlexibleGrid,
  FlexibleVideo,
  Participant,
  Stream,
} from "mediasfu-reactnative-expo";
import VideoCardTransformer from "./transforms/VideoCardTransformer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AudioLevelBars from "./AudioLevelBars";
import { mediaDevices, MediaStream } from "./custom/webrtc/webrtc";
import DropDownPicker from "react-native-dropdown-picker";

const SpaceDetails: React.FC = () => {
  const router = useRouter();
  let { spaceId } = useLocalSearchParams();
  if (Array.isArray(spaceId)) {
    spaceId = spaceId[0];
  }

  const [space, setSpace] = useState<Space | undefined>();
  const [currentUser, setCurrentUser] = useState<ParticipantData | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [canSpeak, setCanSpeak] = useState(
    currentUser !== undefined &&
      (currentUser?.role === "speaker" ||
        currentUser?.role === "host" ||
        !space?.askToSpeak)
  );
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [showSpeakRequests, setShowSpeakRequests] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedVideoInput, setSelectedVideoInput] = useState<string | null>(
    null
  );
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [showCameraPicker, setShowCameraPicker] = useState(false);
  const [alertedRemainingTime, setAlertedRemainingTime] = useState(false);

  // Determine if the current user has been rejected from speaking
  const hasRejectedSpeakRequest = space?.askToSpeakHistory.includes(
    currentUser?.id || ""
  );

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [banned, setBanned] = useState<boolean>(false);
  const [sourceChanged, setSourceChanged] = useState(0);
  const sourceParameters = useRef<{
    [key: string]: any;
  }>({});

  const updateSourceParameters = (params: { [key: string]: any }) => {
    if (params !== sourceParameters.current) {
      sourceParameters.current = params;
      setSourceChanged((prev) => prev + 1);
    }
  };

  const showRoomDetails = useRef<MediaSFUHandlerProps | null>(null);
  const [showRoom, setShowRoom] = useState(false);
  const isPending = useRef(false);

  const allRoomAudios = useRef<JSX.Element[]>([]);
  const allRoomVideos = useRef<JSX.Element[][]>([]);
  const allRoomVideoStreams = useRef<(Participant | Stream)[]>([]);
  const mainVideo = useRef<JSX.Element[]>([]);
  const [mediasfuAlert, setMediasfuAlert] = useState("");

  const now = Date.now();
  const ended = space?.endedAt !== 0 || !space?.active;
  const scheduled = now < space?.startedAt!;
  const remainingTime = space?.duration
    ? space?.startedAt + space?.duration - now
    : 0;
  const totalDuration = space?.duration || 1; // avoid division by zero
  const progress = Math.max(
    0,
    Math.min((1 - remainingTime / totalDuration) * 100, 100)
  );

  const isHost = currentUser?.id === space?.host;
  const canJoinNow =
    (space?.startedAt || 0) - now <= 5 * 60 * 1000 &&
    (space?.active || false) &&
    !ended;

  // Fetch space and user data
  useEffect(() => {
    (async () => {
      const uid = await AsyncStorage.getItem("currentUserId");
      if (!uid) {
        router.replace({ pathname: "/welcome" }); // Redirect to welcome if no user ID
        return;
      }

      try {
        const s = await fetchSpaceById(spaceId);
        if (!s) {
          router.replace({ pathname: "/" }); // Redirect to home if space not found
          return;
        }
        setSpace(s);

        const p = s.participants.find((part) => part.id === uid);
        if (p) {
          setCurrentUser(p);
          // Determine if the user can speak
          if (p.role === "speaker" || p.role === "host" || !s.askToSpeak) {
            setCanSpeak(true);
            p.role !== "host" &&
              setMessage("You have been granted speaker role.");
          }
        }
      } catch (error) {
        console.error("Error fetching space:", error);
        router.replace({ pathname: "/" }); // Redirect on error
      } finally {
        setIsLoading(false); // Stop loading
      }
    })();
  }, [spaceId]);

  const loadSpace = async () => {
    try {
      const newSpace = await fetchSpaceById(spaceId);
      if (newSpace && JSON.stringify(newSpace) !== JSON.stringify(space)) {
        setSpace(newSpace);
        const currentUserId = await AsyncStorage.getItem("currentUserId");
        if (currentUserId) {
          const p = newSpace.participants.find(
            (part) => part.id === currentUserId
          );
          if (p) {
            setCurrentUser(p);
          }
        }
      }
    } catch (error) {
      console.error("Error loading space:", error);
    }
  };

  const joinRoom = async () => {
    if (isPending.current) return;
    isPending.current = true;
    showRoomDetails.current = {
      action: "join",
      name: currentUser?.id!,
      meetingID: space?.remoteName!,
      sourceParameters: sourceParameters.current,
      updateSourceParameters: updateSourceParameters,
    };
    setShowRoom(true);
    isPending.current = false;
  };

  const createRoom = async () => {
    if (isPending.current) return;
    isPending.current = true;
    showRoomDetails.current = {
      action: "create",
      duration: space?.duration! / (1000 * 60),
      capacity: space?.capacity!,
      name: currentUser?.id!,
      meetingID: space?.remoteName!,
      sourceParameters: sourceParameters.current,
      updateSourceParameters: updateSourceParameters,
    };
    setShowRoom(true);
    isPending.current = false;
  };

  const isRoomCreated = () => {
    return space && space.remoteName && !space.remoteName.includes("remote_");
  };

  useFocusEffect(
    React.useCallback(() => {
      const interval = setInterval(loadSpace, 1000);

      return () => {
        clearInterval(interval);
      };
    }, [spaceId])
  );

  // Handle message timeout
  useFocusEffect(
    React.useCallback(() => {
      if (message) {
        const timer = setTimeout(() => {
          setMessage("");
        }, 4000);
        return () => clearTimeout(timer);
      }
    }, [message])
  );

  // Handle space duration and banning
  useFocusEffect(
    React.useCallback(() => {
      if (space?.duration) {
        const now = Date.now();
        const remainingTime = space?.startedAt + space?.duration - now;
        if (remainingTime < 0) {
          setMessage("Space has ended.");
          endSpace(spaceId!);
          // Reload space to update the UI
          setTimeout(() => {
            router.replace({ pathname: "/" });
          }, 500);
        } else if (remainingTime < 60000 && !alertedRemainingTime) {
          setMessage("Space will end in less than a minute.");
          setAlertedRemainingTime(true);
        }
      }

      if (space?.endedAt && space?.endedAt !== 0) {
        setMessage("Space has ended.");
        setTimeout(() => {
          router.replace({ pathname: "/" });
        }, 500);
      }

      if (space?.banned && space?.banned.includes(currentUser?.id!)) {
        setBanned(true);
        setMessage("You have been banned from this space.");
        handleLeave();
        setTimeout(async () => {
          if (currentUser?.id) {
            await leaveSpace(space.id, currentUser.id);
            await disconnectRoom({
              sourceParameters: sourceParameters.current,
            });
          }
          router.replace({ pathname: "/" });
        }, 500);
      }
    }, [space, spaceId, alertedRemainingTime, currentUser])
  );

  // Update speaking permissions
  useFocusEffect(
    React.useCallback(() => {
      if (
        currentUser &&
        (currentUser.role === "speaker" ||
          currentUser.role === "host" ||
          !space?.askToSpeak) &&
        !canSpeak
      ) {
        setCanSpeak(true);
      }
    }, [currentUser, canSpeak, space])
  );

  // Handle joining or creating room
  useFocusEffect(
    React.useCallback(() => {
      if (canJoinNow && !showRoom) {
        const noRoom =
          space && space.remoteName && space.remoteName.includes("remote_");
        if (isHost && noRoom && currentUser) {
          if (isPending.current) return;
          createRoom();
        } else if (!showRoom && !noRoom && currentUser) {
          joinRoom();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canJoinNow, isHost, showRoom, currentUser, space])
  );

  useFocusEffect(
    React.useCallback(() => {
      if (
        sourceParameters.current &&
        space &&
        showRoom &&
        Object.keys(sourceParameters.current).length > 0
      ) {
        const noRoom =
          space && space.remoteName && space.remoteName.includes("remote_");
        if (noRoom) {
          updateSpace(space.id, {
            remoteName: sourceParameters.current.roomName,
          });
          !isConnected && setIsConnected(true);

          console.log(
            "Updated remote name:",
            sourceParameters.current.roomName
          );

          sourceParameters.current.updateAutoWave(false);
        } else {
          if (sourceParameters.current.roomName !== "") {
            !isConnected && setIsConnected(true);

            sourceParameters.current.updateAutoWave(false);
          }
        }

        if (
          sourceParameters.current.audioOnlyStreams !== allRoomAudios.current
        ) {
          allRoomAudios.current = sourceParameters.current.audioOnlyStreams;
        }
        if (
          sourceParameters.current.otherGridStreams !== allRoomVideos.current
        ) {
          allRoomVideos.current = sourceParameters.current.otherGridStreams;
        }
        if (
          sourceParameters.current.allVideoStreams !==
          allRoomVideoStreams.current
        ) {
          allRoomVideoStreams.current =
            sourceParameters.current.allVideoStreams;
        }
        if (sourceParameters.current.mainGridStream !== mainVideo.current) {
          mainVideo.current = sourceParameters.current.mainGridStream;
        }
        if (sourceParameters.current.audioLevel !== audioLevel) {
          setAudioLevel(sourceParameters.current.audioLevel);
        }
        if (sourceParameters.current.videoAlreadyOn! !== videoOn) {
          setVideoOn(sourceParameters.current.videoAlreadyOn!);
        }
        if (sourceParameters.current.audioAlreadyOn! !== !isMuted) {
          setIsMuted(!sourceParameters.current.audioAlreadyOn!);

          const newParticipants = space?.participants.map(
            (p: ParticipantData) => {
              if (p.id === currentUser?.id) {
                return {
                  ...p,
                  muted: !sourceParameters.current.audioAlreadyOn!,
                };
              }
              return p;
            }
          );
          updateSpace(space?.id!, { participants: newParticipants });
        }
        if (
          sourceParameters.current.alertMessage !== mediasfuAlert &&
          !sourceParameters.current.alertMessage.includes("rotate")
        ) {
          setMediasfuAlert(sourceParameters.current.alertMessage);
          if (sourceParameters.current.alertMessage) {
            setMessage(sourceParameters.current.alertMessage);
            if (
              sourceParameters.current.alertMessage.includes(
                "meeting has ended"
              )
            ) {
              //if host and isconnected, handle end space, else leave
              if (isHost && isConnected) {
                handleEndSpace();
              } else {
                handleLeave();
              }
            }
          }
        }
      }
    }, [
      sourceChanged,
      isConnected,
      audioLevel,
      isMuted,
      space,
      currentUser,
      mediasfuAlert,
    ])
  );

  if (isLoading) {
    return <Spinner />;
  }

  if (!space) {
    return (
      <View style={styles.notFoundContainer}>
        <Text>Space not found. Redirecting...</Text>
      </View>
    ); // Fallback in case of redirection failure
  }

  // Handle Join
  const handleJoin = async () => {
    const currentUserId = await AsyncStorage.getItem("currentUserId");
    if (!currentUserId) {
      return;
    }
    const user = await fetchUserById(currentUserId);
    if (!user) {
      return;
    }
    if (banned || space.banned?.includes(user.id)) {
      setMessage("You have been banned from this space.");
      return;
    }

    if (
      space.askToJoin &&
      !(isHost || space.approvedToJoin.includes(user.id))
    ) {
      // Handle join requests
      const existingRequest = space.askToJoinQueue.includes(user.id);
      if (existingRequest) {
        setMessage("Your request to join is pending approval by the host.");
        return;
      } else {
        // Might be rejected in the history
        const existingHistory = space.rejectedSpeakers.includes(user.id);
        if (existingHistory) {
          setMessage("Your request to join was rejected by the host.");
          return;
        }
      }

      try {
        await joinSpace(space.id, user, !space.askToSpeak);
        const updated = await fetchSpaceById(space.id);
        if (updated) {
          setSpace(updated);
          const p = updated.participants.find(
            (part) => part.id === currentUserId
          );
          if (p) {
            setCurrentUser(p);
          }
          setMessage(
            "Your request to join has been sent and is pending approval."
          );
        }
      } catch (error) {
        setMessage("Error joining the space. Please try again.");
        console.error(error);
      }
    } else {
      // Directly join
      try {
        await joinSpace(space.id, user, !space.askToSpeak);
        const updated = await fetchSpaceById(space.id);
        if (updated) {
          setSpace(updated);
          const p = updated.participants.find(
            (part) => part.id === currentUserId
          );
          if (p) {
            setCurrentUser(p);
          }
        }
      } catch (error) {
        setMessage("Error joining the space. Please try again.");
        console.error(error);
      }
    }
  };

  // Handle Leave
  const handleLeave = async () => {
    if (currentUser) {
      try {
        await disconnectRoom({ sourceParameters: sourceParameters.current });
        await leaveSpace(space.id, currentUser.id);
        router.replace({ pathname: "/" });
      } catch (error) {
        setMessage("Error leaving the space. Please try again.");
        console.error(error);
      }
    }
  };

  // Handle Mute Participant
  const handleMuteParticipant = async (targetId: string) => {
    try {
      // add new restrictMedia function
      await restrictMedia({
        sourceParameters: sourceParameters.current,
        remoteMember: targetId,
        mediaType: "audio",
      });
      await muteParticipant(space.id, targetId, true);
      const updated = await fetchSpaceById(space.id);
      if (updated) {
        setSpace(updated);
      }
    } catch (error) {
      setMessage("Error muting participant.");
      console.error(error);
    }
  };

  // Handle End Space
  const handleEndSpace = async () => {
    if (isHost && space.active) {
      try {
        await endSpace(space.id);
        const updated = await fetchSpaceById(space.id);
        // Disconnect the room
        await disconnectRoom({ sourceParameters: sourceParameters.current });
        if (updated) {
          setSpace(updated);
        }
        setTimeout(() => {
          router.replace({ pathname: "/" });
        }, 1000);
      } catch (error) {
        setMessage("Error ending the space.");
        console.error(error);
      }
    }
  };

  // Handle Remove Participant
  const handleRemoveParticipant = async (targetId: string) => {
    if (isHost) {
      try {
        // add new removeMember function
        await removeMember({
          sourceParameters: sourceParameters.current,
          remoteMember: targetId,
        });
        await banParticipant(space.id, targetId);
        const updated = await fetchSpaceById(space.id);
        if (updated) {
          setSpace(updated);
        }
      } catch (error) {
        setMessage("Error removing participant.");
        console.error(error);
      }
    }
  };

  // Handle Toggle Mic
  const handleToggleMic = async () => {
    if (
      currentUser?.role === "speaker" ||
      currentUser?.role === "host" ||
      !space?.askToSpeak
    ) {
      await toggleVideo({ sourceParameters: sourceParameters.current });

      //if video is on
      const devices =
        (await mediaDevices.enumerateDevices()) as MediaDeviceInfo[];

      // Filter the devices to get only audio and video input devices
      const videoInputList = devices.filter(
        (device) => device.kind === "videoinput"
      );

      // Update the available audio and video input devices
      setVideoInputs(videoInputList);
    } else {
      setMessage("You do not have permission to toggle your mic.");
    }
  };

  // Check Request to Speak
  const checkRequestToSpeak = () => {
    if (hasRejectedSpeakRequest) {
      setMessage("You have been rejected from speaking in this space.");
      return;
    }

    const isPending = space?.askToSpeakQueue.includes(currentUser?.id || "");
    if (isPending) {
      setMessage("Your request to speak is pending approval by the host.");
      return;
    } else if (space?.rejectedSpeakers.includes(currentUser?.id || "")) {
      setMessage("Your request to speak was rejected by the host.");
      return;
    }
    // If not pending and not rejected, allow to request
    requestToSpeak(space.id, currentUser?.id || "")
      .then(() => {
        setMessage(
          "Your request to speak has been sent and is pending approval."
        );
        loadSpace();
      })
      .catch((error) => {
        setMessage("Error requesting to speak. Please try again.");
        console.error(error);
      });
  };

  // Handle Approve Join
  const handleApproveJoin = async (userId: string) => {
    try {
      await approveJoinRequest(space.id, userId, false); // Approve as listener
      loadSpace();
    } catch (error) {
      setMessage("Error approving join request.");
      console.error(error);
    }
  };

  // Handle Reject Join
  const handleRejectJoin = async (userId: string) => {
    try {
      await rejectJoinRequest(space.id, userId);
      loadSpace();
    } catch (error) {
      setMessage("Error rejecting join request.");
      console.error(error);
    }
  };

  // Handle Approve Speak
  const handleApproveSpeak = async (userId: string) => {
    try {
      await approveRequest(space.id, userId, true); // Approve as speaker
      loadSpace();
    } catch (error) {
      setMessage("Error approving speak request.");
      console.error(error);
    }
  };

  // Handle Reject Speak
  const handleRejectSpeak = async (userId: string) => {
    try {
      await rejectRequest(space.id, userId);
      loadSpace();
    } catch (error) {
      setMessage("Error rejecting speak request.");
      console.error(error);
    }
  };

  // Get Counts of Speakers and Listeners
  const getCounts = (space: Space) => {
    const speakers = space.speakers.length;
    const listeners = space.listeners.length;
    // Add the host as a speaker if not already
    if (space.host && !space.speakers.includes(space.host)) {
      return { speakers: speakers + 1, listeners };
    }

    return { speakers, listeners };
  };

  const { speakers, listeners } = getCounts(space);

  const handleSelectCamera = async (deviceId: string) => {
    if (deviceId === selectedVideoInput) return;
    setSelectedVideoInput(deviceId);
    await selectCamera({
      sourceParameters: sourceParameters.current,
      deviceId,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Back and End Space Buttons */}
      <View style={styles.spaceHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace({ pathname: "/" })}
          accessibilityLabel="Navigate back to home"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" style={styles.backIcon} />
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        {currentUser && space?.active && !ended && (
          <View style={styles.audioControls}>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.connectionStatus,
                  isConnected ? styles.connected : styles.disconnected,
                ]}
              />
              <Text>{isConnected ? "Conn." : "Disconn."}</Text>
            </View>

            {isConnected ? (
              canSpeak ? (
                <>
                  <TouchableOpacity
                    style={styles.toggleMicBtn}
                    onPress={handleToggleMic}
                    accessibilityLabel={
                      isMuted ? "Turn on mic" : "Turn off mic"
                    }
                    accessibilityRole="button"
                  >
                    {isMuted ? (
                      <Icon name="microphone-slash" style={styles.icon} />
                    ) : (
                      <Icon name="microphone" style={styles.icon} />
                    )}
                    <Text style={styles.buttonText}>
                      {isMuted ? "Turn on Mic" : "Turn off Mic"}
                    </Text>
                  </TouchableOpacity>
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
                  {videoInputs.length > 1 && (
                    <View style={styles.cameraPicker}>
                      <DropDownPicker
                        open={showCameraPicker}
                        value={selectedVideoInput}
                        items={videoInputs.map((input) => ({
                          label: input.label || "Camera",
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
                </>
              ) : (
                <TouchableOpacity
                  style={styles.requestSpeakBtn}
                  onPress={checkRequestToSpeak}
                  accessibilityLabel="Request to speak"
                  accessibilityRole="button"
                >
                  <Icon name="microphone-slash" style={styles.icon} />
                  <Text style={styles.buttonText}>Request to Speak</Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                style={styles.connectBtn}
                onPress={() => {
                  if (!canJoinNow) {
                    setMessage("You cannot connect to the room yet.");
                  } else if (!showRoom && isRoomCreated()) {
                    joinRoom();
                  } else if (!showRoom && !isRoomCreated() && isHost) {
                    createRoom();
                  } else if (!showRoom && !isRoomCreated() && !isHost) {
                    setMessage("Sorry, the host has not created the room yet.");
                  }
                }}
                accessibilityLabel="Connect Audio"
                accessibilityRole="button"
              >
                <Icon name="connectdevelop" style={styles.icon} />
                <Text style={styles.buttonText}>Connect Audio</Text>
              </TouchableOpacity>
            )}
            {isHost && space?.active ? (
              <TouchableOpacity
                style={styles.endSpaceButton}
                onPress={handleEndSpace}
                accessibilityLabel="End Space"
                accessibilityRole="button"
              >
                <Icon name="power-off" style={styles.icon} />
                <Text style={styles.buttonText}>End Space</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleLeave}
                accessibilityLabel="Leave Space"
                accessibilityRole="button"
              >
                <Icon name="sign-out-alt" style={styles.icon} />
                <Text style={styles.buttonText}>Leave</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* Join and Speak Controls */}
        {!currentUser && space?.active && canJoinNow && !ended && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoin}
            accessibilityLabel="Join Space"
            accessibilityRole="button"
          >
            <Icon name="check-circle" style={styles.icon} />
            <Text style={styles.buttonText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Display Message */}
      {message !== "" && (
        <View style={styles.errorMessage}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      {/* Space Information */}
      <View style={styles.spaceInfo}>
        <Text style={styles.spaceTitle}>{space.title}</Text>
        <Text style={styles.spaceDescription}>{space.description}</Text>
        <View style={styles.spaceStatusIcons}>
          {ended && (
            <View style={[styles.statusIcon, styles.ended]}>
              <Icon name="flag-checkered" style={styles.statusIconIcon} />
              <Text style={styles.statusText}>Ended</Text>
            </View>
          )}
          {scheduled && !ended && (
            <View style={[styles.statusIcon, styles.scheduled]}>
              <Icon name="clock" style={styles.statusIconIcon} />
              <Text style={styles.statusText}>Scheduled</Text>
            </View>
          )}
          {!scheduled && space.active && !ended && (
            <View style={[styles.statusIcon, styles.live]}>
              <Icon name="check-circle" style={styles.statusIconIcon} />
              <Text style={styles.statusText}>Live Now</Text>
            </View>
          )}
        </View>
        {/* Audio Level Bars */}
        {isConnected && <AudioLevelBars audioLevel={audioLevel} />}
        {/* Viewer and Listener Counts */}
        <View style={styles.spaceCounts}>
          <View style={styles.countItem}>
            <Icon name="users" style={styles.countIcon} />
            <Text style={styles.countText}>{speakers} Speakers</Text>
          </View>
          <View style={styles.countItem}>
            <Icon name="eye" style={styles.countIcon} />
            <Text style={styles.countText}>{listeners} Listeners</Text>
          </View>
        </View>
        {/* Progress Bar */}
        {space.active && !ended && (
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${progress}%` }]} />
          </View>
        )}
        {/* Request Management Buttons */}
        {isHost && (space.askToJoin || space.askToSpeak) && !ended && (
          <View style={styles.requestButtons}>
            {space.askToJoin && (
              <TouchableOpacity
                style={styles.manageRequestBtn}
                onPress={() => setShowJoinRequests(true)}
              >
                <Icon name="user-slash" style={styles.icon} />
                <Text style={styles.buttonText}>Join Requests</Text>
                {space.askToJoinQueue.length > 0 && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>
                      {space.askToJoinQueue.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            {space.askToSpeak && (
              <TouchableOpacity
                style={styles.manageRequestBtn}
                onPress={() => setShowSpeakRequests(true)}
              >
                <Icon name="microphone" style={styles.icon} />
                <Text style={styles.buttonText}>Speak Requests</Text>
                {space.askToSpeakQueue.length > 0 && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>
                      {space.askToSpeakQueue.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Join Requests Modal */}
      <RNModal
        visible={showJoinRequests}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowJoinRequests(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Requests</Text>
              <TouchableOpacity onPress={() => setShowJoinRequests(false)}>
                <Icon name="times" style={styles.modalCloseIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {space.askToJoinQueue.length === 0 ? (
                <Text style={styles.modalText}>No join requests.</Text>
              ) : (
                space.askToJoinQueue.map((id) => {
                  const user = space.participants.find((p) => p.id === id);
                  return (
                    <View key={id} style={styles.requestCard}>
                      <Text style={styles.requestName}>
                        {user?.displayName || id}
                      </Text>
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => handleApproveJoin(id)}
                          accessibilityLabel="Approve Join"
                        >
                          <Icon name="check" style={styles.actionIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => handleRejectJoin(id)}
                          accessibilityLabel="Reject Join"
                        >
                          <Icon name="times" style={styles.actionIcon} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </View>
      </RNModal>

      {/* Speak Requests Modal */}
      <RNModal
        visible={showSpeakRequests}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSpeakRequests(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Speak Requests</Text>
              <TouchableOpacity onPress={() => setShowSpeakRequests(false)}>
                <Icon name="times" style={styles.modalCloseIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {space.askToSpeakQueue.length === 0 ? (
                <Text style={styles.modalText}>No speak requests.</Text>
              ) : (
                space.askToSpeakQueue.map((id) => {
                  const user = space.participants.find((p) => p.id === id);
                  return (
                    <View key={id} style={styles.requestCard}>
                      <Text style={styles.requestName}>
                        {user?.displayName || id}
                      </Text>
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => handleApproveSpeak(id)}
                          accessibilityLabel="Approve Speak"
                          accessibilityRole="button"
                        >
                          <Icon name="check" style={styles.actionIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => handleRejectSpeak(id)}
                          accessibilityLabel="Reject Speak"
                          accessibilityRole="button"
                        >
                          <Icon name="times" style={styles.actionIcon} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </View>
      </RNModal>

      {/* Participant Grid */}
      <View style={styles.participantsSection}>
        <Text style={styles.participantsHeader}>Participants</Text>
        <FlatList
          data={space.participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            let videoStream: MediaStream | undefined;
            const p = item;

            // try {
            //   const video_stream = allRoomVideos.current
            //     .flat()
            //     .find(
            //       (stream) =>
            //         stream.props.name === p.id ||
            //         (stream.props.participant?.id.includes("youyou") &&
            //           p.id === currentUser?.id)
            //     );
            //   videoStream = video_stream
            //     ? video_stream.props.videoStream
            //     : undefined;

            //   if (
            //     !videoStream &&
            //     p.role === "host" &&
            //     mainVideo.current &&
            //     mainVideo.current.length > 0
            //   ) {
            //     videoStream = mainVideo.current[0].props.videoStream;
            //   }
            // } catch (error) {}

            //option 2, look in allVideoStreams for the video stream with the name as the participant id

            try {
              const refParticipant =
                sourceParameters?.current.participants?.find(
                  (part: Participant) => part.name === p.id
                );

              // Find the video stream of the refParticipant with videoID as the stream producerId
              const video_stream =
                refParticipant &&
                allRoomVideoStreams.current.find(
                  (stream) => stream.producerId === refParticipant?.videoID
                );
              videoStream = video_stream ? video_stream.stream : undefined;

              if (!videoStream && p.id === currentUser?.id) {
                videoStream = sourceParameters.current?.localStreamVideo;
              }

              if (
                !videoStream &&
                p.role === "host" &&
                sourceParameters.current?.oldAllStreams &&
                sourceParameters.current?.oldAllStreams.length > 0
              ) {
                videoStream =
                  sourceParameters.current?.oldAllStreams[0].stream ||
                  undefined;
              }
            } catch (error) {}

            return (
              <ParticipantCard
                participant={item}
                isHost={isHost}
                currentUserId={currentUser?.id}
                onMute={(id) => {
                  handleMuteParticipant(id);
                }}
                onToggleMic={() => {
                  if (item.id === currentUser?.id && item.role === "speaker") {
                    handleToggleMic();
                  }
                }}
                onRemove={(id) => {
                  if (isHost) {
                    handleRemoveParticipant(id);
                  }
                }}
                space={space}
                video={videoStream!}
              />
            );
          }}
          horizontal={false}
          numColumns={2} // Adjust based on your design
          contentContainerStyle={styles.participantsGrid}
          ListEmptyComponent={
            <Text style={styles.participantsEmpty}>No participants</Text>
          }
          scrollEnabled={false}
        />
      </View>

      {/* Audio Grid */}
      <AudioGrid componentsToRender={allRoomAudios.current} />

      {/* Video Grid */}
      <FlexibleGrid
        customWidth={200}
        customHeight={200}
        rows={1}
        columns={
          allRoomVideos.current.length > 0 ? allRoomVideos.current[0].length : 1
        }
        componentsToRender={
          allRoomVideos.current.length > 0 ? allRoomVideos.current[0] : []
        }
        backgroundColor={"rgba(217, 227, 234, 0.99)"}
      />

      {/* Video Grid Transform*/}
      <View style={styles.videoGrid}>
        {allRoomVideos.current &&
          allRoomVideos.current.map((row, index) => (
            <View key={index} style={styles.videoRow}>
              {/* <VideoCardTransformer children={row} /> */}
              {row.map((video) => (
                video
              ))}
            </View>
          ))}
      </View>

      {/* Main Video */}
      <FlexibleVideo
        rows={1}
        columns={1}
        customWidth={400}
        customHeight={200}
        componentsToRender={mainVideo.current}
        backgroundColor={"rgba(217, 227, 234, 0.99)"}
        showAspect={mainVideo.current.length > 0}
      />

      {/* MediaSFU Handler */}
      {showRoom && <MediaSFUHandler {...showRoomDetails.current} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    marginHorizontal: "auto",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spaceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    width: "100%",
    maxWidth: "100%",
    overflow: "visible",
    zIndex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "transparent",
    color: "#1da1f2",
    borderWidth: 1,
    borderColor: "#1da1f2",
    borderRadius: 8,
    padding: 5,
    marginRight: 5,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1da1f2",
    borderRadius: 8,
    padding: 5,
  },
  endSpaceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#d93025",
    borderRadius: 8,
    padding: 5,
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    padding: 5,
  },
  buttonText: {
    color: "black",
    fontSize: 12,
  },
  backIcon: {
    fontSize: 16,
    color: "black",
  },
  icon: {
    fontSize: 16,
    color: "#fff",
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  connectionStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "gray",
  },
  connected: {
    backgroundColor: "green",
  },
  disconnected: {
    backgroundColor: "red",
  },
  toggleMicBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f39c12",
    padding: 5,
    borderRadius: 8,
  },
  requestSpeakBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f39c12",
    padding: 5,
    borderRadius: 8,
  },
  connectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1da1f2",
    padding: 5,
    borderRadius: 8,
  },
  manageRequestBtn: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#839fb0",
    padding: 5,
    borderRadius: 8,
  },
  pill: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  spaceInfo: {
    padding: 20,
    backgroundColor: "#f7f7f7",
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  spaceTitle: {
    fontSize: 24,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  spaceDescription: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  spaceStatusIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 10,
  },
  statusIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  ended: {
    backgroundColor: "#d93025",
  },
  scheduled: {
    backgroundColor: "#fbc02d",
  },
  live: {
    backgroundColor: "#1da1f2",
  },
  statusIconIcon: {
    fontSize: 16,
    color: "#fff",
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
  },
  spaceCounts: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginBottom: 10,
  },
  countItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  countIcon: {
    fontSize: 16,
    color: "#555",
  },
  countText: {
    fontSize: 14,
    color: "#555",
  },
  progressBar: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    height: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  progress: {
    backgroundColor: "#a6cde7",
    height: "100%",
  },
  requestButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
  },
  errorMessage: {
    backgroundColor: "#e0db9a",
    borderColor: "#e0db9a",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    fontSize: 14,
    color: "#151414",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    textAlign: "center",
    color: "#151414",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    width: "90%",
    maxWidth: 500,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    color: "#333",
  },
  modalCloseIcon: {
    fontSize: 20,
    color: "#171515",
  },
  modalBody: {
    maxHeight: 400,
    overflow: "scroll",
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  requestCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  requestName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
  },
  acceptBtn: {
    backgroundColor: "#1da1f2",
    padding: 5,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectBtn: {
    backgroundColor: "#e74c3c",
    padding: 5,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    color: "#fff",
    fontSize: 16,
  },
  participantsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  participantsHeader: {
    fontSize: 20,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  participantsGrid: {
    justifyContent: "space-between",
  },
  participantsEmpty: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  videoGrid: {
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  videoRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 10,
    width: 300,
    height: 200,
  },
  cameraPicker: {
    flex: 1,
    width: "100%",
    maxWidth: 200,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 4,
    zIndex: 2000,
    position: "relative",
    justifyContent: "center",
  },
  picker: {
    height: 22,
    minHeight: 22,
    flex: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    fontSize: 12,
    zIndex: 2100,
  },
  dropDownContainer: {
    borderColor: "#ddd",
    backgroundColor: "#fff",
    maxHeight: 150,
    borderRadius: 6,
    zIndex: 2200,
    position: "absolute",
    overflow: "visible",
  },
  dropdownContainer: {
    zIndex: 2000,
    position: "relative",
  },
});

export default SpaceDetails;
