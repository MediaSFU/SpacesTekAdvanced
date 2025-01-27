import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophoneSlash,
  faVideoSlash,
  faDesktop,
  faPhone,
  faUsers,
  faBars,
  faComments,
  faShareAlt,
  faSync,
  faChartBar,
  faRecordVinyl,
  faCog,
  faClock,
  faUserPlus,
  faTools,
  faPlayCircle,
  faPauseCircle,
  faStopCircle,
  faDotCircle,
  faVideo,
  faMicrophone,
  faPoll,
  faUserFriends,
  faChalkboardTeacher,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import './MediasfuCSS.css';

//initial values
import { 
    initialValuesState,
    LoadingModal, MainAspectComponent, ControlButtonsComponent, ControlButtonsAltComponent, ControlButtonsComponentTouch, OtherGridComponent, MainScreenComponent, MainGridComponent, SubAspectComponent, MainContainerComponent, AlertComponent, MenuModal, RecordingModal, RequestsModal, WaitingRoomModal, DisplaySettingsModal, EventSettingsModal, CoHostModal, ParticipantsModal, MessagesModal, MediaSettingsModal, ConfirmExitModal, ConfirmHereModal, ShareEventModal, WelcomePage, 
    Pagination, FlexibleGrid, FlexibleVideo, AudioGrid,
    launchMenuModal, launchRecording, startRecording, confirmRecording, launchWaiting, launchCoHost, launchMediaSettings, launchDisplaySettings, launchSettings, launchRequests, launchParticipants, launchMessages, launchConfirmExit,
    connectSocket, connectLocalSocket, joinRoomClient, joinLocalRoom, updateRoomParametersClient, createDeviceClient,
    switchVideoAlt, clickVideo, clickAudio, clickScreenShare, streamSuccessVideo, streamSuccessAudio, streamSuccessScreen, streamSuccessAudioSwitch, checkPermission, 
    updateMiniCardsGrid, mixStreams, dispStreams, stopShareScreen, checkScreenShare, startShareScreen, requestScreenShare, reorderStreams, prepopulateUserMedia, getVideos, rePort, trigger, consumerResume, connectSendTransportAudio, connectSendTransportVideo, connectSendTransportScreen, processConsumerTransports, resumePauseStreams, readjust, checkGrid, getEstimate, 
    calculateRowsAndColumns, onScreenChanges, sleep, changeVids, compareActiveNames, compareScreenStates, createSendTransport, resumeSendTransportAudio, receiveAllPipedTransports, disconnectSendTransportVideo, disconnectSendTransportAudio, disconnectSendTransportScreen, connectSendTransport, getPipedProducersAlt, signalNewConsumerTransport, connectRecvTransport, reUpdateInter, updateParticipantAudioDecibels, closeAndResize, autoAdjust, switchUserVideoAlt, switchUserVideo, switchUserAudio, receiveRoomMessages, formatNumber, connectIps,
    startMeetingProgressTimer, updateRecording, stopRecording,
    
    userWaiting, personJoined, allWaitingRoomMembers, roomRecordParams, banParticipant, updatedCoHost, participantRequested, screenProducerId, updateMediaSettings, producerMediaPaused, producerMediaResumed, producerMediaClosed, controlMediaHost, meetingEnded, disconnectUserSelf, receiveMessage, meetingTimeRemaining, meetingStillThere, startRecords, reInitiateRecording, getDomains, updateConsumingDomains, recordingNotice, timeLeftRecording, stoppedRecording, hostRequestResponse, allMembers, allMembersRest, disconnect,


    

    captureCanvasStream, resumePauseAudioStreams, processConsumerTransportsAudio,
    pollUpdated, handleCreatePoll, handleVotePoll, handleEndPoll, breakoutRoomUpdated,

    launchPoll, launchBreakoutRooms, launchConfigureWhiteboard,

    PollModal, BackgroundModal, BreakoutRoomsModal, ConfigureWhiteboardModal, Whiteboard, Screenboard, ScreenboardModal,

    createResponseJoinRoom,
    WelcomePageOptions,
    connectLocalIps
} from "mediasfu-reactjs";
import { addVideosGrid } from "./addVideosGrid";

import { Socket } from "socket.io-client";
import {
  AParamsType,
  AudioDecibels,
  BreakoutParticipant,
  CoHostResponsibility,
  ComponentSizes,
  GridSizes,
  HParamsType,
  MeetingRoomParams,
  Message,
  Participant,
  Poll,
  ResponseJoinRoom,
  ResponseJoinLocalRoom,
  ScreenParamsType,
  ScreenState,
  Stream,
  UserRecordingParams,
  VParamsType,
  VidCons,
  WaitingRoomParticipant,
  WhiteboardUser,
  Shape,
  Request,
  Transport as TransportType,
  RecordParams,
  EventType,
  ConsumeSocket,
  AllMembersData,
  AllMembersRestData,
  AllWaitingRoomMembersData,
  UpdatedCoHostData,
  Settings,
  UpdateConsumingDomainsData,
  HostRequestResponseData,
  PollUpdatedData,
  BreakoutRoomUpdatedData,
  ButtonTouch,
  CustomButton,
  SeedData,
  PreJoinPageOptions,
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
  JoinRoomOnMediaSFUType,
  CreateRoomOnMediaSFUType,
} from "mediasfu-reactjs";
import {
  Device,
  Producer,
  ProducerOptions,
  RtpCapabilities,
  Transport,
} from "mediasoup-client/lib/types";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

export type MediasfuGenericOptions = {
  PrejoinPage?: (
    options: PreJoinPageOptions | WelcomePageOptions
  ) => React.ReactNode;
  localLink?: string;
  connectMediaSFU?: boolean;
  credentials?: { apiUserName: string; apiKey: string };
  useLocalUIMode?: boolean;
  seedData?: SeedData;
  useSeed?: boolean;
  imgSrc?: string;
  sourceParameters?: { [key: string]: any };
  updateSourceParameters?: (data: { [key: string]: any }) => void;
  returnUI?: boolean;
  noUIPreJoinOptions?: CreateMediaSFURoomOptions | JoinMediaSFURoomOptions;
  joinMediaSFURoom?: JoinRoomOnMediaSFUType;
  createMediaSFURoom?: CreateRoomOnMediaSFUType;
};

/**
 * MediasfuGeneric component provides and combines the generic functionalities for MediaSFU.
 * It supports webinar, broadcast, chat, conference views
 * Participants can share media (audio, video, screen share) with each other.
 * Participants can chat with each other and engage in polls and breakout rooms, share screens, and more during the conference.
 *
 * @typedef {Object} MediasfuGenericOptions
 * @property {function} [PrejoinPage=WelcomePage] - Function to render the prejoin page.
 * @property {string} [localLink=""] - Local link for the media server (if using Community Edition).
 * @property {boolean} [connectMediaSFU=true] - Flag to connect to the MediaSFU server (if using Community Edition and still need to connect to the server)
 * @property {Object} [credentials={ apiUserName: "", apiKey: "" }] - API credentials.
 * @property {boolean} [useLocalUIMode=false] - Flag to use local UI mode.
 * @property {SeedData} [seedData={}] - Seed data for initial state.
 * @property {boolean} [useSeed=false] - Flag to use seed data.
 * @property {string} [imgSrc="https://mediasfu.com/images/logo192.png"] - Image source URL.
 * @property {Object} [sourceParameters={}] - Source parameters.
 * @property {function} [updateSourceParameters] - Function to update source parameters.
 * @property {boolean} [returnUI=true] - Flag to return the UI.
 * @property {CreateMediaSFURoomOptions | JoinMediaSFURoomOptions} [noUIPreJoinOptions] - Options for the prejoin page.
 * @property {JoinRoomOnMediaSFUType} [joinMediaSFURoom] - Function to join a room on MediaSFU.
 * @property {CreateRoomOnMediaSFUType} [createMediaSFURoom] - Function to create a room on MediaSFU.
 *
 * MediasfuGeneric component.
 *
 * @component
 * @param {MediasfuGenericOptions} props - Component properties.
 * @returns {React.FC<MediasfuGenericOptions>} - React functional component.
 *
 * @example
 * ```tsx
 * <MediasfuGeneric
 *   PrejoinPage={CustomPrejoinPage}
 *   localLink="https://localhost:3000"
 *   connectMediaSFU={true}
 *   credentials={{ apiUserName: "user", apiKey: "key" }}
 *   useLocalUIMode={true}
 *   seedData={customSeedData}
 *   useSeed={true}
 *   imgSrc="https://example.com/logo.png"
 *   sourceParameters={{ key: value }}
 *   updateSourceParameters={updateSourceParameters}
 *   returnUI={true}
 *   noUIPreJoinOptions={customPreJoinOptions}
 *   joinMediaSFURoom={joinRoomOnMediaSFU}
 *   createMediaSFURoom={createRoomOnMediaSFU}
 * />
 * ```
 *
 * @description
 * This component handles the generic functionalities for MediaSFU, including joining rooms,
 * managing participants, and handling media streams. It uses various hooks and methods to
 * manage state and perform actions such as joining a room, updating initial values, and
 * handling media streams.
 *
 */

const MediasfuGenericAlt: React.FC<MediasfuGenericOptions> = ({
  PrejoinPage = WelcomePage,
  localLink = "",
  connectMediaSFU = true,
  credentials = { apiUserName: "", apiKey: "" },
  useLocalUIMode = false,
  seedData = {},
  useSeed = false,
  imgSrc = "https://mediasfu.com/images/logo192.png",
  sourceParameters,
  updateSourceParameters,
  returnUI = true,
  noUIPreJoinOptions,
  joinMediaSFURoom,
  createMediaSFURoom,
}) => {

  const updateStatesToInitialValues = async () => {
    const initialValues = initialValuesState as { [key: string]: any };
    const updateFunctions = getAllParams() as unknown as {
      [key: string]: (value: any) => void;
    };

    for (const key in initialValues) {
      if (Object.prototype.hasOwnProperty.call(initialValues, key)) {
        const updateFunctionName = `update${
          key.charAt(0).toUpperCase() + key.slice(1)
        }`;
        const updateFunction = updateFunctions[updateFunctionName];

        if (typeof updateFunction === "function") {
          try {
            updateFunction(initialValues[key]);
          } catch {
            // Do nothing
          }
        }
      }
    }
  };

  //logic to join room using socket
  async function joinRoom(data: {
    socket: Socket;
    roomName: string;
    islevel: string;
    member: string;
    sec: string;
    apiUserName: string;
  }): Promise<ResponseJoinRoom | null> {
    const { socket, roomName, islevel, member, sec, apiUserName } = data;
    try {
      // Emit the joinRoom event to the server using the provided socket
      const response = await joinRoomClient({
        socket,
        roomName,
        islevel,
        member,
        sec,
        apiUserName,
      });
      return response;
          } catch (error) {
      // Handle and log errors during the joinRoom process
      console.log("error", error);
      throw new Error(
        "Failed to join the room. Please check your connection and try again."
      );

      // throw new Error('Failed to join the room. Please check your connection and try again.');
    }
  }

  //validated is true if the user has entered the correct details and checked from the server
  const [validated, setValidated] = useState<boolean>(useLocalUIMode); // Validated state as boolean

  // UseRef hooks with type annotations
  const localUIMode = useRef<boolean>(useLocalUIMode); // Local UI mode (desktop or touch) as boolean
  const socket = useRef<Socket>({} as Socket); // Socket for the media server, type Socket or null
  const localSocket = useRef<Socket | null>(null); // Local socket for the media server, type Socket or null
  const roomData = useRef<ResponseJoinRoom | null>(null); // Room data, type ResponseJoinRoom or null
  const device = useRef<Device | null>(null); // Mediasoup Device, type Device or null

  // String references with useRef
  const apiUserName = useRef<string>(""); // API username, type string
  const apiToken = useRef<string>(""); // API token, type string
  const link = useRef<string>(""); // Link to the media server, type string

  //Room Details
  const roomName = useRef<string>(""); // Room name as string
  const member = useRef<string>(
    useSeed && seedData?.member ? seedData?.member : ""
  ); // Member name as string
  const adminPasscode = useRef<string>(""); // Admin passcode as string
  const islevel = useRef<string>(
    useSeed && seedData?.member
      ? seedData.member == seedData?.host
        ? "2"
        : "1"
      : "1"
  ); // Level of the user as string
  const coHost = useRef<string>(""); // Co-host as string
  const coHostResponsibility = useRef<CoHostResponsibility[]>([
    { name: "participants", value: false, dedicated: false },
    { name: "media", value: false, dedicated: false },
    { name: "waiting", value: false, dedicated: false },
    { name: "chat", value: false, dedicated: false },
  ]); // Array of co-host responsibilities
  const youAreCoHost = useRef<boolean>(
    coHost.current ? coHost.current == member.current : false
  ); // True if the user is a co-host as boolean
  const youAreHost = useRef<boolean>(islevel ? islevel.current == "2" : false); // True if the user is a host as boolean
  const confirmedToRecord = useRef<boolean>(false); // True if the user has confirmed to record as boolean
  const meetingDisplayType = useRef<string>("media"); // Meeting display type as string
  const meetingVideoOptimized = useRef<boolean>(false); // True if the meeting video is optimized as boolean
  const eventType = useRef<EventType>(
    useSeed && seedData?.eventType ? seedData?.eventType : "webinar"
  ); // Event type as string
  const participants = useRef<Participant[]>(
    useSeed && seedData?.participants ? seedData?.participants : []
  ); // Array of participants
  const filteredParticipants = useRef<Participant[]>(participants.current); // Filtered participants as array of Participant
  const participantsCounter = useRef<number>(0); // Participants counter as number
  const participantsFilter = useRef<string>(""); // Participants filter as string
  // Media and Room Details
  const consume_sockets = useRef<ConsumeSocket[]>([]); // Array of consume sockets
  const rtpCapabilities = useRef<RtpCapabilities | null>(null); // RTP capabilities from MediaSoup, type RtpCapabilities or null
  const roomRecvIPs = useRef<string[]>([]); // Receiving IPs (domains) for the room consumer as strings
  const meetingRoomParams = useRef<MeetingRoomParams | null>(null); // Room parameters for the meeting/event room, type MeetingRoomParams or null
  const itemPageLimit = useRef<number>(4); // Number of items to show per page in the media display as number
  const audioOnlyRoom = useRef<boolean>(false); // True if the room is audio-only and does not support video as boolean
  const addForBasic = useRef<boolean>(false); // True if the room supports few producers as boolean
  const screenPageLimit = useRef<number>(4); // Number of people on the side-view of screen share as number
  const shareScreenStarted = useRef<boolean>(false); // True if screen share has started and started remotely as boolean
  const shared = useRef<boolean>(false); // True if screen share has started and started locally as boolean
  const targetOrientation = useRef<string>("landscape"); // Orientation of the media to be captured as string
  const targetResolution = useRef<string>("sd"); // Resolution of the media to be captured as string
  const targetResolutionHost = useRef<string>("sd"); // Resolution of the host media to be captured as string
  const vidCons = useRef<VidCons>({ width: 640, height: 360 }); // Constraints for video capture as array of VidConsType
  const frameRate = useRef<number>(10); // Frame rate for video capture as number
  const hParams = useRef<HParamsType>({} as HParamsType); // Host video encoding parameters, type HParamsType or null
  const vParams = useRef<VParamsType>({} as VParamsType); // Rest of members video encoding parameters, type VParamsType or null
  const screenParams = useRef<ScreenParamsType>({} as ScreenParamsType); // Screen share encoding parameters, type ScreenParamsType or null
  const aParams = useRef<AParamsType>({} as AParamsType); // Audio encoding parameters, type AParamsType or null

  //more room details
  // Room Details - Recording
  const recordingAudioPausesLimit = useRef<number>(0); // Number of pauses allowed for audio recording
  const recordingAudioPausesCount = useRef<number>(0); // Number of pauses for audio recording
  const recordingAudioSupport = useRef<boolean>(false); // True if the room supports audio recording
  const recordingAudioPeopleLimit = useRef<number>(0); // Number of people allowed for audio recording
  const recordingAudioParticipantsTimeLimit = useRef<number>(0); // Time limit for audio recording
  const recordingVideoPausesCount = useRef<number>(0); // Number of pauses for video recording
  const recordingVideoPausesLimit = useRef<number>(0); // Number of pauses allowed for video recording
  const recordingVideoSupport = useRef<boolean>(false); // True if the room supports video recording
  const recordingVideoPeopleLimit = useRef<number>(0); // Number of people allowed for video recording
  const recordingVideoParticipantsTimeLimit = useRef<number>(0); // Time limit for video recording
  const recordingAllParticipantsSupport = useRef<boolean>(false); // True if the room supports recording all participants
  const recordingVideoParticipantsSupport = useRef<boolean>(false); // True if the room supports recording video participants
  const recordingAllParticipantsFullRoomSupport = useRef<boolean>(false); // True if the room supports recording all participants in full room
  const recordingVideoParticipantsFullRoomSupport = useRef<boolean>(false); // True if the room supports recording video participants in full room
  const recordingPreferredOrientation = useRef<string>("landscape"); // Preferred orientation for recording
  const recordingSupportForOtherOrientation = useRef<boolean>(false); // True if the room supports recording for other orientations
  const recordingMultiFormatsSupport = useRef<boolean>(false); // True if the room supports recording multiple formats

  // User Recording Parameters
  const userRecordingParams = useRef<UserRecordingParams>({
    mainSpecs: {
      mediaOptions: "video", // 'audio', 'video',
      audioOptions: "all", // 'all', 'onScreen', 'host'
      videoOptions: "all", // 'all', 'mainScreen'
      videoType: "fullDisplay", // 'all', 'bestDisplay', 'fullDisplay'
      videoOptimized: false, // true, false
      recordingDisplayType: "media", // 'media', 'video', 'all'
      addHLS: false, // true, false
    },
    dispSpecs: {
      nameTags: true, // true, false
      backgroundColor: "#000000", // '#000000', '#ffffff'
      nameTagsColor: "#ffffff", // '#000000', '#ffffff'
      orientationVideo: "portrait", // 'landscape', 'portrait', 'all'
    },
  }); // User recording parameters with type UserRecordingParams

  // More Room Details - Recording
  const canRecord = useRef<boolean>(false); // True if the user can record
  const startReport = useRef<boolean>(false); // True if the user has started recording
  const endReport = useRef<boolean>(false); // True if the user has stopped recording
  const recordTimerInterval = useRef<NodeJS.Timeout | null>(null); // Interval for the recording timer
  const recordStartTime = useRef<number>(0); // Start time for the recording timer as timestamp or null
  const recordElapsedTime = useRef<number>(0); // Elapsed time for the recording timer
  const isTimerRunning = useRef<boolean>(false); // True if the recording timer is running
  const canPauseResume = useRef<boolean>(false); // True if the user can pause/resume recording
  const recordChangeSeconds = useRef<number>(15000); // Number of seconds to change the recording timer by
  const pauseLimit = useRef<number>(0); // Number of pauses allowed for recording
  const pauseRecordCount = useRef<number>(0); // Number of pauses for recording
  const canLaunchRecord = useRef<boolean>(true); // True if the user can launch recording
  const stopLaunchRecord = useRef<boolean>(false); // True if the user can stop recording

  //misc variables
  // State and references with type annotations
  const firstAll = useRef<boolean>(false); // True if it is the first time getting all parameters
  const updateMainWindow = useRef<boolean>(false); // Update main window
  const first_round = useRef<boolean>(false); // True if it is the first round of screen share
  const landScaped = useRef<boolean>(false); // True if the screen share is in landscape mode
  const lock_screen = useRef<boolean>(false); // True if the screen is locked in place for screen share
  const screenId = useRef<string>(""); // Screen share producer ID
  const allVideoStreams = useRef<(Participant | Stream)[]>([]); // Array of all video streams
  const newLimitedStreams = useRef<(Participant | Stream)[]>([]); // Array of new limited streams
  const newLimitedStreamsIDs = useRef<string[]>([]); // Array of new limited stream IDs
  const activeSounds = useRef<string[]>([]); // Array of active sounds
  const screenShareIDStream = useRef<string>(""); // Screen share stream ID
  const screenShareNameStream = useRef<string>(""); // Screen share stream name
  const adminIDStream = useRef<string>(""); // Admin stream ID
  const adminNameStream = useRef<string>(""); // Admin stream name
  const youYouStream = useRef<(Participant | Stream)[]>([]); // YouYou (own) stream
  const youYouStreamIDs = useRef<string[]>([]); // Array of YouYou (own) stream IDs
  const localStream = useRef<MediaStream | null>(null); // Local stream
  const recordStarted = useRef<boolean>(false); // True if recording has started
  const recordResumed = useRef<boolean>(false); // True if recording has resumed
  const recordPaused = useRef<boolean>(false); // True if recording has paused
  const recordStopped = useRef<boolean>(false); // True if recording has stopped
  const adminRestrictSetting = useRef<boolean>(false); // Admin's restrict setting
  const videoRequestState = useRef<string | null>(null); // Video request state as string or null
  const videoRequestTime = useRef<number>(0); // Video request time
  const videoAction = useRef<boolean>(false); // Video action as string
  const localStreamVideo = useRef<MediaStream | null>(null); // Local stream video
  const userDefaultVideoInputDevice = useRef<string>(""); // User's default video input device
  const currentFacingMode = useRef<string>("user"); // Current facing mode of the video input device
  const prevFacingMode = useRef<string>("user"); // Previous facing mode of the video input device
  const defVideoID = useRef<string>(""); // Default video ID
  const allowed = useRef<boolean>(false); // True if the user is allowed to turn on their camera
  const dispActiveNames = useRef<string[]>([]); // Display active names
  const p_dispActiveNames = useRef<string[]>([]); // Display active names (previous)
  const activeNames = useRef<string[]>([]); // Active names
  const prevActiveNames = useRef<string[]>([]); // Active names (previous)
  const p_activeNames = useRef<string[]>([]); // Active names (previous)
  const membersReceived = useRef<boolean>(false); // True if members have been received
  const deferScreenReceived = useRef<boolean>(false); // True if receiving the screen share has been deferred
  const hostFirstSwitch = useRef<boolean>(false); // True if the host has switched to the main screen
  const micAction = useRef<boolean>(false); // True if the user has requested to unmute
  const screenAction = useRef<boolean>(false); // True if the user has requested to share their screen
  const chatAction = useRef<boolean>(false); // True if the user has requested to chat
  const audioRequestState = useRef<string | null>(null); // Audio request state as string or null
  const screenRequestState = useRef<string | null>(null); // Screen request state as string or null
  const chatRequestState = useRef<string | null>(null); // Chat request state as string or null
  const audioRequestTime = useRef<number>(0); // Audio request time
  const screenRequestTime = useRef<number>(0); // Screen request time
  const chatRequestTime = useRef<number>(0); // Chat request time
  const updateRequestIntervalSeconds = useRef<number>(240); // Update request interval in seconds
  const oldSoundIds = useRef<string[]>([]); // Array of old sound IDs
  const hostLabel = useRef<string>("Host"); // Host label as string
  const mainScreenFilled = useRef<boolean>(false); // True if the main screen is filled
  const localStreamScreen = useRef<MediaStream | null>(null); // Local stream screen
  const [screenAlreadyOn, setScreenAlreadyOn] = useState<boolean>(false); // True if the screen is already on
  const [chatAlreadyOn, setChatAlreadyOn] = useState<boolean>(false); // True if the chat is already on
  const redirectURL = useRef<string>(""); // Redirect URL as string or null
  const oldAllStreams = useRef<(Participant | Stream)[]>([]); // Array of old all streams
  const adminVidID = useRef<string>(""); // Admin video ID as string or null
  const streamNames = useRef<Stream[]>([]); // Array of stream names
  const non_alVideoStreams = useRef<Participant[]>([]); // Array of non-al video streams
  const sortAudioLoudness = useRef<boolean>(false); // True if audio loudness is sorted
  const audioDecibels = useRef<AudioDecibels[]>([]); // Array of audio decibels
  const mixed_alVideoStreams = useRef<(Participant | Stream)[]>([]); // Array of mixed al video streams
  const non_alVideoStreams_muted = useRef<Participant[]>([]); // Array of non-al video streams muted
  const paginatedStreams = useRef<(Participant | Stream)[][]>([]); // Array of paginated streams
  const localStreamAudio = useRef<MediaStream | null>(null); // Local stream audio
  const defAudioID = useRef<string>(""); // Default audio ID as string or null
  const userDefaultAudioInputDevice = useRef<string>(""); // User's default audio input device
  const userDefaultAudioOutputDevice = useRef<string>(""); // User's default audio output device
  const prevAudioInputDevice = useRef<string>(""); // Previous audio input device
  const prevVideoInputDevice = useRef<string>(""); // Previous video input device
  const audioPaused = useRef<boolean>(false); // True if audio is paused
  const mainScreenPerson = useRef<string>(""); // Main screen person as string
  const adminOnMainScreen = useRef<boolean>(false); // True if the admin is on the main screen
  const screenStates = useRef<ScreenState[]>([
    {
      mainScreenPerson: "",
      mainScreenProducerId: "",
      mainScreenFilled: false,
      adminOnMainScreen: false,
    },
  ]); // Array of screen states

  const prevScreenStates = useRef<ScreenState[]>([
    {
      mainScreenPerson: "",
      mainScreenProducerId: "",
      mainScreenFilled: false,
      adminOnMainScreen: false,
    },
  ]); // Array of previous screen states

  const updateDateState = useRef<number | null>(null); // Date state for updating the screen states as number or null
  const lastUpdate = useRef<number | null>(null); // Last update time for updating the screen states as number or null
  const nForReadjustRecord = useRef<number>(0); // Number of times for readjusting the recording
  const fixedPageLimit = useRef<number>(4); // Fixed page limit for pagination
  const removeAltGrid = useRef<boolean>(false); // True if the alt grid should be removed
  const nForReadjust = useRef<number>(0); // Number of times for readjusting the recording
  const reorderInterval = useRef<number>(30000); // Reorder interval in milliseconds
  const fastReorderInterval = useRef<number>(10000); // Fast reorder interval in milliseconds
  const lastReorderTime = useRef<number>(0); // Last reorder time in milliseconds
  const audStreamNames = useRef<Stream[]>([]); // Array of audio stream names as strings
  const currentUserPage = useRef<number>(0); // Current user page

  const [mainHeightWidth, setMainHeightWidth] = useState<number>(
    eventType.current === "webinar"
      ? 67
      : eventType.current === "broadcast"
      ? 100
      : 0
  ); // Main height and width as number

  const prevMainHeightWidth = useRef<number>(mainHeightWidth); // Previous main height and width
  const prevDoPaginate = useRef<boolean>(false); // Previous doPaginate as boolean
  const doPaginate = useRef<boolean>(false); // Do paginate as boolean
  const shareEnded = useRef<boolean>(false); // True if the share has ended
  const lStreams = useRef<(Participant | Stream)[]>([]); // Array of limited streams
  const chatRefStreams = useRef<(Participant | Stream)[]>([]); // Array of chat ref streams

  const [controlHeight, setControlHeight] = useState<number>(0); // Control height as number
  const isWideScreen = useRef<boolean>(false); // True if the screen is wide
  const isMediumScreen = useRef<boolean>(false); // True if the screen is medium
  const isSmallScreen = useRef<boolean>(false); // True if the screen is small
  const addGrid = useRef<boolean>(false); // True if the grid should be added
  const addAltGrid = useRef<boolean>(false); // True if the alt grid should be added

  const [gridRows, setGridRows] = useState<number>(0); // Grid rows as number
  const [gridCols, setGridCols] = useState<number>(0); // Grid columns as number
  const [altGridRows, setAltGridRows] = useState<number>(0); // Alt grid rows as number
  const [altGridCols, setAltGridCols] = useState<number>(0); // Alt grid columns as number
  const [numberPages, setNumberPages] = useState<number>(0); // Number of pages as number
  const currentStreams = useRef<(Participant | Stream)[]>([]); // Array of current streams

  const [showMiniView, setShowMiniView] = useState<boolean>(false); // True if the mini view should be shown
  const nStream = useRef<MediaStream | null>(null); // New stream as MediaStream or null
  const defer_receive = useRef<boolean>(false); // True if receiving the stream has been deferred
  const allAudioStreams = useRef<(Participant | Stream)[]>([]); // Array of all audio streams
  const remoteScreenStream = useRef<Stream[]>([]); // Array of remote screen streams

  const screenProducer = useRef<Producer | null>(null); // Screen producer as Producer or null
  const localScreenProducer = useRef<Producer | null>(null); // Local screen producer as Producer or null
  const gotAllVids = useRef<boolean>(false); // True if all videos have been received
  const paginationHeightWidth = useRef<number>(40); // Pagination height/width as number
  const paginationDirection = useRef<"horizontal" | "vertical">("horizontal"); // Pagination direction as string

  const gridSizes = useRef<GridSizes>({
    gridWidth: 0,
    gridHeight: 0,
    altGridWidth: 0,
    altGridHeight: 0,
  }); // Grid sizes with type GridSizes

  const screenForceFullDisplay = useRef<boolean>(false); // True if the screen should be forced to full display
  const mainGridStream = useRef<JSX.Element[]>([]); // Array of main grid streams as JSX.Element[]
  const [otherGridStreams, setOtherGridStreams] = useState<JSX.Element[][]>([
    [],
    [],
  ]); // Other grid streams as 2D array of JSX.Element[]
  const audioOnlyStreams = useRef<JSX.Element[]>([]); // Array of audio-only streams

  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]); // Video inputs as array of MediaDeviceInfo
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]); // Audio inputs as array of MediaDeviceInfo
  const [meetingProgressTime, setMeetingProgressTime] =
    useState<string>("00:00:00"); // Meeting progress time as string
  const meetingElapsedTime = useRef<number>(0); // Meeting elapsed time as number

  const ref_participants = useRef<Participant[]>([]); // Array of participants as Participant[]

  // All Participants - Room Details
  const participantsAll = useRef<Participant[]>([]); // All participants as an array of Participant

  //update Room Details Functions
  const updateValidated = (value: boolean) => {
    setValidated(value);
  };

  const updateSocket = (value: Socket) => {
    socket.current = value;
  };

  const updateLocalSocket = (value: Socket | null) => {
    localSocket.current = value;
  };

  const updateDevice = (value: Device | null) => {
    device.current = value;
  };

  const updateApiUserName = (value: string) => {
    apiUserName.current = value;
  };

  const updateApiToken = (value: string) => {
    apiToken.current = value;
  };

  const updateLink = (value: string) => {
    link.current = value;
  };

  const updateRoomName = (value: string) => {
    roomName.current = value;
  };

  const updateMember = (value: string) => {
    if (value.length > 0 && value.includes("_")) {
      updateIslevel(value.split("_")[1]);
      value = value.split("_")[0];
    }
    member.current = value;
  };

  const updateAdminPasscode = (value: string) => {
    adminPasscode.current = value;
  };

  const updateIslevel = (value: string) => {
    islevel.current = value;
  };

  const updateCoHost = (value: string) => {
    coHost.current = value;
  };

  const updateCoHostResponsibility = (value: CoHostResponsibility[]) => {
    coHostResponsibility.current = value;
  };

  const updateYouAreCoHost = (value: boolean) => {
    youAreCoHost.current = value;
  };

  const updateYouAreHost = (value: boolean) => {
    youAreHost.current = value;
  };

  const updateConfirmedToRecord = (value: boolean) => {
    confirmedToRecord.current = value;
  };

  const updateMeetingDisplayType = (value: string) => {
    meetingDisplayType.current = value;
  };

  const updateMeetingVideoOptimized = (value: boolean) => {
    meetingVideoOptimized.current = value;
  };

  const updateEventType = (value: EventType) => {
    eventType.current = value;
    if (value != "none") {
      //update the display type

      try {
        setTimeout(() => {
          onResize();
        }, 1000);
      } catch {
        // Do nothing
      }
    }
  };

  const updateParticipants = (value: Participant[]) => {
    participants.current = value;
    filteredParticipants.current = value;
    participantsCounter.current = value.length;
  };

  const updateParticipantsCounter = (value: number) => {
    participantsCounter.current = value;
  };

  const updateParticipantsFilter = (value: string) => {
    participantsFilter.current = value;
  };

  const updateRecordingAudioPausesLimit = (value: number) => {
    recordingAudioPausesLimit.current = value;
  };

  const updateRecordingAudioPausesCount = (value: number) => {
    recordingAudioPausesCount.current = value;
  };

  const updateRecordingAudioSupport = (value: boolean) => {
    recordingAudioSupport.current = value;
  };

  const updateRecordingAudioPeopleLimit = (value: number) => {
    recordingAudioPeopleLimit.current = value;
  };

  const updateRecordingAudioParticipantsTimeLimit = (value: number) => {
    recordingAudioParticipantsTimeLimit.current = value;
  };

  const updateRecordingVideoPausesCount = (value: number) => {
    recordingVideoPausesCount.current = value;
  };

  const updateRecordingVideoPausesLimit = (value: number) => {
    recordingVideoPausesLimit.current = value;
  };

  const updateRecordingVideoSupport = (value: boolean) => {
    recordingVideoSupport.current = value;
  };

  const updateRecordingVideoPeopleLimit = (value: number) => {
    recordingVideoPeopleLimit.current = value;
  };

  const updateRecordingVideoParticipantsTimeLimit = (value: number) => {
    recordingVideoParticipantsTimeLimit.current = value;
  };

  const updateRecordingAllParticipantsSupport = (value: boolean) => {
    recordingAllParticipantsSupport.current = value;
  };

  const updateRecordingVideoParticipantsSupport = (value: boolean) => {
    recordingVideoParticipantsSupport.current = value;
  };

  const updateRecordingAllParticipantsFullRoomSupport = (value: boolean) => {
    recordingAllParticipantsFullRoomSupport.current = value;
  };

  const updateRecordingVideoParticipantsFullRoomSupport = (value: boolean) => {
    recordingVideoParticipantsFullRoomSupport.current = value;
  };

  const updateRecordingPreferredOrientation = (value: string) => {
    recordingPreferredOrientation.current = value;
  };

  const updateRecordingSupportForOtherOrientation = (value: boolean) => {
    recordingSupportForOtherOrientation.current = value;
  };

  const updateRecordingMultiFormatsSupport = (value: boolean) => {
    recordingMultiFormatsSupport.current = value;
  };

  const updateUserRecordingParams = (value: UserRecordingParams) => {
    userRecordingParams.current = value;
  };

  const updateCanRecord = (value: boolean) => {
    canRecord.current = value;
  };

  const updateStartReport = (value: boolean) => {
    startReport.current = value;
  };

  const updateEndReport = (value: boolean) => {
    endReport.current = value;
  };

  const updateRecordTimerInterval = (value: NodeJS.Timeout | null) => {
    recordTimerInterval.current = value;
  };

  const updateRecordStartTime = (value: number) => {
    recordStartTime.current = value;
  };

  const updateRecordElapsedTime = (value: number) => {
    recordElapsedTime.current = value;
  };

  const updateIsTimerRunning = (value: boolean) => {
    isTimerRunning.current = value;
  };

  const updateCanPauseResume = (value: boolean) => {
    canPauseResume.current = value;
  };

  const updateRecordChangeSeconds = (value: number) => {
    recordChangeSeconds.current = value;
  };

  const updatePauseLimit = (value: number) => {
    pauseLimit.current = value;
  };

  const updatePauseRecordCount = (value: number) => {
    pauseRecordCount.current = value;
  };

  const updateCanLaunchRecord = (value: boolean) => {
    canLaunchRecord.current = value;
  };

  const updateStopLaunchRecord = (value: boolean) => {
    stopLaunchRecord.current = value;
  };

  const updateParticipantsAll = (value: Participant[]) => {
    participantsAll.current = value;
  };

  const updateConsume_sockets = (value: ConsumeSocket[]) => {
    consume_sockets.current = value;
  };

  const updateRtpCapabilities = (value: RtpCapabilities | null) => {
    rtpCapabilities.current = value;
  };

  const updateRoomRecvIPs = (value: string[]) => {
    roomRecvIPs.current = value;
  };

  const updateMeetingRoomParams = (value: MeetingRoomParams | null) => {
    meetingRoomParams.current = value;
  };

  const updateItemPageLimit = (value: number) => {
    itemPageLimit.current = value;
  };

  const updateAudioOnlyRoom = (value: boolean) => {
    audioOnlyRoom.current = value;
  };

  const updateAddForBasic = (value: boolean) => {
    addForBasic.current = value;
  };

  const updateScreenPageLimit = (value: number) => {
    screenPageLimit.current = value;
  };

  const updateShareScreenStarted = (value: boolean) => {
    shareScreenStarted.current = value;
  };

  const updateShared = (value: boolean) => {
    shared.current = value;
    setScreenShareActive(value);
    if (value) {
      setTimeout(async () => {
        window.dispatchEvent(new Event("resize"));
      }, 2000);
    }
  };

  const updateTargetOrientation = (value: string) => {
    targetOrientation.current = value;
  };

  const updateTargetResolution = (value: string) => {
    targetResolution.current = value;
  };

  const updateTargetResolutionHost = (value: string) => {
    targetResolutionHost.current = value;
  };

  const updateVidCons = (value: VidCons) => {
    vidCons.current = value;
  };

  const updateFrameRate = (value: number) => {
    frameRate.current = value;
  };

  const updateHParams = (value: HParamsType) => {
    hParams.current = value;
  };

  const updateVParams = (value: VParamsType) => {
    vParams.current = value;
  };

  const updateScreenParams = (value: ScreenParamsType) => {
    screenParams.current = value;
  };

  const updateAParams = (value: AParamsType) => {
    aParams.current = value;
  };

  const updateFirstAll = (value: boolean) => {
    firstAll.current = value;
  };

  const updateUpdateMainWindow = (value: boolean) => {
    updateMainWindow.current = value;
  };

  const updateFirst_round = (value: boolean) => {
    first_round.current = value;
  };

  const updateLandScaped = (value: boolean) => {
    landScaped.current = value;
  };

  const updateLock_screen = (value: boolean) => {
    lock_screen.current = value;
  };

  const updateScreenId = (value: string) => {
    screenId.current = value;
  };

  const updateAllVideoStreams = (value: (Participant | Stream)[]) => {
    allVideoStreams.current = value;
  };

  const updateNewLimitedStreams = (value: (Participant | Stream)[]) => {
    newLimitedStreams.current = value;
  };

  const updateNewLimitedStreamsIDs = (value: string[]) => {
    newLimitedStreamsIDs.current = value;
  };

  const updateActiveSounds = (value: string[]) => {
    activeSounds.current = value;
  };

  const updateScreenShareIDStream = (value: string) => {
    screenShareIDStream.current = value;
  };

  const updateScreenShareNameStream = (value: string) => {
    screenShareNameStream.current = value;
  };

  const updateAdminIDStream = (value: string) => {
    adminIDStream.current = value;
  };

  const updateAdminNameStream = (value: string) => {
    adminNameStream.current = value;
  };

  const updateYouYouStream = (value: (Participant | Stream)[]) => {
    youYouStream.current = value;
  };

  const updateYouYouStreamIDs = (value: string[]) => {
    youYouStreamIDs.current = value;
  };

  const updateLocalStream = (value: MediaStream | null) => {
    localStream.current = value;
  };

  const updateRecordStarted = (value: boolean) => {
    recordStarted.current = value;
  };

  const updateRecordResumed = (value: boolean) => {
    recordResumed.current = value;
  };

  const updateRecordPaused = (value: boolean) => {
    recordPaused.current = value;
  };

  const updateRecordStopped = (value: boolean) => {
    recordStopped.current = value;
  };

  const updateAdminRestrictSetting = (value: boolean) => {
    adminRestrictSetting.current = value;
  };

  const updateVideoRequestState = (value: string | null) => {
    videoRequestState.current = value;
  };

  const updateVideoRequestTime = (value: number) => {
    videoRequestTime.current = value;
  };

  const updateVideoAction = (value: boolean) => {
    videoAction.current = value;
  };

  const updateLocalStreamVideo = (value: MediaStream | null) => {
    localStreamVideo.current = value;
  };

  const updateUserDefaultVideoInputDevice = (value: string) => {
    userDefaultVideoInputDevice.current = value;
  };

  const updateCurrentFacingMode = (value: string) => {
    currentFacingMode.current = value;
  };

  const updatePrevFacingMode = (value: string) => {
    prevFacingMode.current = value;
  };

  const updateDefVideoID = (value: string) => {
    defVideoID.current = value;
  };

  const updateAllowed = (value: boolean) => {
    allowed.current = value;
  };

  const updateDispActiveNames = (value: string[]) => {
    dispActiveNames.current = value;
  };

  const updateP_dispActiveNames = (value: string[]) => {
    p_dispActiveNames.current = value;
  };

  const updateActiveNames = (value: string[]) => {
    activeNames.current = value;
  };

  const updatePrevActiveNames = (value: string[]) => {
    prevActiveNames.current = value;
  };

  const updateP_activeNames = (value: string[]) => {
    p_activeNames.current = value;
  };

  const updateMembersReceived = (value: boolean) => {
    membersReceived.current = value;
  };

  const updateDeferScreenReceived = (value: boolean) => {
    deferScreenReceived.current = value;
  };

  const updateHostFirstSwitch = (value: boolean) => {
    hostFirstSwitch.current = value;
  };

  const updateMicAction = (value: boolean) => {
    micAction.current = value;
  };

  const updateScreenAction = (value: boolean) => {
    screenAction.current = value;
  };

  const updateChatAction = (value: boolean) => {
    chatAction.current = value;
  };

  const updateAudioRequestState = (value: string | null) => {
    audioRequestState.current = value;
  };

  const updateScreenRequestState = (value: string | null) => {
    screenRequestState.current = value;
  };

  const updateChatRequestState = (value: string | null) => {
    chatRequestState.current = value;
  };

  const updateAudioRequestTime = (value: number) => {
    audioRequestTime.current = value;
  };

  const updateScreenRequestTime = (value: number) => {
    screenRequestTime.current = value;
  };

  const updateChatRequestTime = (value: number) => {
    chatRequestTime.current = value;
  };

  const updateOldSoundIds = (value: string[]) => {
    oldSoundIds.current = value;
  };

  const updatehostLabel = (value: string) => {
    hostLabel.current = value;
  };

  const updateMainScreenFilled = (value: boolean) => {
    mainScreenFilled.current = value;
  };

  const updateLocalStreamScreen = (value: MediaStream | null) => {
    localStreamScreen.current = value;
  };

  const updateScreenAlreadyOn = (value: boolean) => {
    setScreenAlreadyOn(value);
  };

  const updateChatAlreadyOn = (value: boolean) => {
    setChatAlreadyOn(value);
  };

  const updateRedirectURL = (value: string) => {
    redirectURL.current = value;
  };

  const updateOldAllStreams = (value: (Participant | Stream)[]) => {
    oldAllStreams.current = value;
  };

  const updateAdminVidID = (value: string) => {
    adminVidID.current = value;
  };

  const updateStreamNames = (value: Stream[]) => {
    streamNames.current = value;
  };

  const updateNon_alVideoStreams = (value: Participant[]) => {
    non_alVideoStreams.current = value;
  };

  const updateSortAudioLoudness = (value: boolean) => {
    sortAudioLoudness.current = value;
  };

  const updateAudioDecibels = (value: AudioDecibels[]) => {
    audioDecibels.current = value;
  };

  const updateMixed_alVideoStreams = (value: (Participant | Stream)[]) => {
    mixed_alVideoStreams.current = value;
  };

  const updateNon_alVideoStreams_muted = (value: Participant[]) => {
    non_alVideoStreams_muted.current = value;
  };

  const updatePaginatedStreams = (value: (Participant | Stream)[][]) => {
    paginatedStreams.current = value;
  };

  const updateLocalStreamAudio = (value: MediaStream | null) => {
    localStreamAudio.current = value;
  };

  const updateDefAudioID = (value: string) => {
    defAudioID.current = value;
  };

  const updateUserDefaultAudioInputDevice = (value: string) => {
    userDefaultAudioInputDevice.current = value;
  };

  const updateUserDefaultAudioOutputDevice = (value: string) => {
    userDefaultAudioOutputDevice.current = value;
  };

  const updatePrevAudioInputDevice = (value: string) => {
    prevAudioInputDevice.current = value;
  };

  const updatePrevVideoInputDevice = (value: string) => {
    prevVideoInputDevice.current = value;
  };

  const updateAudioPaused = (value: boolean) => {
    audioPaused.current = value;
  };

  const updateMainScreenPerson = (value: string) => {
    mainScreenPerson.current = value;
  };

  const updateAdminOnMainScreen = (value: boolean) => {
    adminOnMainScreen.current = value;
  };

  const updateScreenStates = (value: ScreenState[]) => {
    screenStates.current = value;
  };

  const updatePrevScreenStates = (value: ScreenState[]) => {
    prevScreenStates.current = value;
  };

  const updateUpdateDateState = (value: number | null) => {
    updateDateState.current = value;
  };

  const updateLastUpdate = (value: number | null) => {
    lastUpdate.current = value;
  };

  const updateNForReadjustRecord = (value: number) => {
    nForReadjustRecord.current = value;
  };

  const updateFixedPageLimit = (value: number) => {
    fixedPageLimit.current = value;
  };

  const updateRemoveAltGrid = (value: boolean) => {
    removeAltGrid.current = value;
  };

  const updateNForReadjust = (value: number) => {
    nForReadjust.current = value;
  };

  const updateLastReorderTime = (value: number) => {
    lastReorderTime.current = value;
  };

  const updateAudStreamNames = (value: Stream[]) => {
    audStreamNames.current = value;
  };

  const updateCurrentUserPage = (value: number) => {
    currentUserPage.current = value;
  };

  const updateMainHeightWidth = (value: number) => {
    setMainHeightWidth(value);
  };

  const updatePrevMainHeightWidth = (value: number) => {
    prevMainHeightWidth.current = value;
  };

  const updatePrevDoPaginate = (value: boolean) => {
    prevDoPaginate.current = value;
  };

  const updateDoPaginate = (value: boolean) => {
    doPaginate.current = value;
  };

  const updateShareEnded = (value: boolean) => {
    shareEnded.current = value;
  };

  const updateLStreams = (value: (Participant | Stream)[]) => {
    lStreams.current = value;
  };

  const updateChatRefStreams = (value: (Participant | Stream)[]) => {
    chatRefStreams.current = value;
  };

  const updateControlHeight = (value: number) => {
    setControlHeight(value);
  };

  const updateIsWideScreen = (value: boolean) => {
    isWideScreen.current = value;
  };

  const updateIsMediumScreen = (value: boolean) => {
    isMediumScreen.current = value;
  };

  const updateIsSmallScreen = (value: boolean) => {
    isSmallScreen.current = value;
  };

  const updateAddGrid = (value: boolean) => {
    addGrid.current = value;
  };

  const updateAddAltGrid = (value: boolean) => {
    addAltGrid.current = value;
  };

  const updateGridRows = (value: number) => {
    setGridRows(value);
  };

  const updateGridCols = (value: number) => {
    setGridCols(value);
  };

  const updateAltGridRows = (value: number) => {
    setAltGridRows(value);
  };

  const updateAltGridCols = (value: number) => {
    setAltGridCols(value);
  };

  const updateNumberPages = (value: number) => {
    setNumberPages(value);
  };

  const updateCurrentStreams = (value: (Participant | Stream)[]) => {
    currentStreams.current = value;
  };

  const updateShowMiniView = (value: boolean) => {
    setShowMiniView(value);
  };

  const updateNStream = (value: MediaStream | null) => {
    nStream.current = value;
  };

  const updateDefer_receive = (value: boolean) => {
    defer_receive.current = value;
  };

  const updateAllAudioStreams = (value: (Participant | Stream)[]) => {
    allAudioStreams.current = value;
  };

  const updateRemoteScreenStream = (value: Stream[]) => {
    remoteScreenStream.current = value;
  };

  const updateScreenProducer = (value: Producer | null) => {
    screenProducer.current = value;
  };

  const updateLocalScreenProducer = (value: Producer | null) => {
    localScreenProducer.current = value;
  };

  const updateGotAllVids = (value: boolean) => {
    gotAllVids.current = value;
  };

  const updatePaginationHeightWidth = (value: number) => {
    paginationHeightWidth.current = value;
  };

  const updatePaginationDirection = (value: "horizontal" | "vertical") => {
    paginationDirection.current = value;
  };

  const updateGridSizes = (value: GridSizes) => {
    gridSizes.current = value;
  };

  const updateScreenForceFullDisplay = (value: boolean) => {
    screenForceFullDisplay.current = value;
  };

  const updateMainGridStream = (value: JSX.Element[]) => {
    mainGridStream.current = value;
  };

  const updateOtherGridStreams = (value: JSX.Element[][]) => {
    setOtherGridStreams(value);
  };

  const updateAudioOnlyStreams = (value: JSX.Element[]) => {
    audioOnlyStreams.current = value;
  };

  const updateVideoInputs = (value: MediaDeviceInfo[]) => {
    setVideoInputs(value);
  };

  const updateAudioInputs = (value: MediaDeviceInfo[]) => {
    setAudioInputs(value);
  };

  const updateMeetingProgressTime = (value: string) => {
    setMeetingProgressTime(value);
  };

  const updateMeetingElapsedTime = (value: number) => {
    meetingElapsedTime.current = value;
  };

  const updateRef_participants = (value: Participant[]) => {
    ref_participants.current = value;
  };

  // Messages
  const messages = useRef<Message[]>(
    useSeed && seedData?.messages ? seedData.messages : []
  ); // Messages array of type Message[]

  const startDirectMessage = useRef<boolean>(false); // Start direct message as boolean
  const directMessageDetails = useRef<Participant | null>(null); // Direct message details, type Participant or null

  const [showMessagesBadge, setShowMessagesBadge] = useState<boolean>(false); // True if the messages badge should be shown as boolean

  // Event settings related variables
  const audioSetting = useRef<string>("allow"); // User's audio setting as string
  const videoSetting = useRef<string>("allow"); // User's video setting as string
  const screenshareSetting = useRef<string>("allow"); // User's screenshare setting as string
  const chatSetting = useRef<string>("allow"); // User's chat setting as string

  // Display settings related variables
  const displayOption = useRef<string>(
    meetingDisplayType.current ? meetingDisplayType.current : "media"
  ); // Display option as string

  const autoWave = useRef<boolean>(true); // Auto wave setting as boolean

  const forceFullDisplay = useRef<boolean>(
    eventType.current === "webinar" || eventType.current === "conference"
      ? false
      : true
  ); // Force full display setting as boolean

  const prevForceFullDisplay = useRef<boolean>(false); // Previous force full display setting as boolean
  const prevMeetingDisplayType = useRef<string>("video"); // Previous meeting display type as string

  // Waiting room
  const waitingRoomFilter = useRef<string>(""); // Filter for the waiting room as string

  const waitingRoomList = useRef<WaitingRoomParticipant[]>(
    useSeed && seedData?.waitingList ? seedData.waitingList : []
  ); // Waiting room list as array of WaitingRoomParticipant

  const waitingRoomCounter = useRef<number>(0); // Waiting room counter as number

  const filteredWaitingRoomList = useRef<WaitingRoomParticipant[]>(
    waitingRoomList.current
  ); // Filtered waiting room list as array of WaitingRoomParticipant

  // Requests
  const requestFilter = useRef<string>(""); // Filter for the requests as string
  const requestList = useRef<Request[]>(
    useSeed && seedData?.requests ? seedData.requests : []
  ); // Request list as array of Request[]

  const requestCounter = useRef<number>(0); // Request counter as number
  const filteredRequestList = useRef<Request[]>(requestList.current); // Filtered request list as array of Request[]

  // Total requests and waiting room
  const totalReqWait = useRef<number>(0); // Total requests and waiting room as number

  // Show Alert modal
  const [alertVisible, setAlertVisible] = useState<boolean>(false); // True if the alert is visible as boolean
  const [alertMessage, setAlertMessage] = useState<string>(""); // Alert message as string
  const [alertType, setAlertType] = useState<"success" | "danger">("success"); // Alert type with specific string values
  const [alertDuration, setAlertDuration] = useState<number>(3000); // Alert duration in milliseconds as number

  // Progress Timer
  const [progressTimerVisible] = useState<boolean>(true); // True if the progress timer is visible as boolean
  const [progressTimerValue] = useState<number>(0); // Progress timer value as number

  // Menu modals
  const [isMenuModalVisible, setIsMenuModalVisible] = useState<boolean>(false); // True if the menu modal is visible as boolean
  const [isRecordingModalVisible, setIsRecordingModalVisible] =
    useState<boolean>(false); // True if the recording modal is visible as boolean
  const [isSettingsModalVisible, setIsSettingsModalVisible] =
    useState<boolean>(false); // True if the settings modal is visible as boolean
  const [isRequestsModalVisible, setIsRequestsModalVisible] =
    useState<boolean>(false); // True if the requests modal is visible as boolean
  const [isWaitingModalVisible, setIsWaitingModalVisible] =
    useState<boolean>(false); // True if the waiting room modal is visible as boolean
  const [isCoHostModalVisible, setIsCoHostModalVisible] =
    useState<boolean>(false); // True if the co-host modal is visible as boolean
  const [isMediaSettingsModalVisible, setIsMediaSettingsModalVisible] =
    useState<boolean>(false); // True if the media settings modal is visible as boolean
  const [isDisplaySettingsModalVisible, setIsDisplaySettingsModalVisible] =
    useState<boolean>(false); // True if the display settings modal is visible as boolean

  // Other Modals
  const [isParticipantsModalVisible, setIsParticipantsModalVisible] =
    useState<boolean>(false); // True if the participants modal is visible as boolean
  const [isMessagesModalVisible, setIsMessagesModalVisible] =
    useState<boolean>(false); // True if the messages modal is visible as boolean
  const [isConfirmExitModalVisible, setIsConfirmExitModalVisible] =
    useState<boolean>(false); // True if the confirm exit modal is visible as boolean
  const [isConfirmHereModalVisible, setIsConfirmHereModalVisible] =
    useState<boolean>(false); // True if the confirm here modal is visible as boolean
  const [isShareEventModalVisible, setIsShareEventModalVisible] =
    useState<boolean>(false); // True if the share event modal is visible as boolean
  const [isLoadingModalVisible, setIsLoadingModalVisible] =
    useState<boolean>(false); // True if the loading modal is visible as boolean

  // Recording-related variables
  const recordingMediaOptions = useRef<string>("video"); // Media type for recording as string
  const recordingAudioOptions = useRef<string>("all"); // Audio options for recording as string
  const recordingVideoOptions = useRef<string>("all"); // Video options for recording as string
  const recordingVideoType = useRef<string>("fullDisplay"); // Type of video for recording as string
  const recordingVideoOptimized = useRef<boolean>(false); // Whether video recording is optimized as boolean
  const recordingDisplayType = useRef<"media" | "video" | "all">("media"); // Type of recording display as specific string values
  const recordingAddHLS = useRef<boolean>(true); // Whether to add HLS for recording as boolean
  const recordingNameTags = useRef<boolean>(true); // Whether to include name tags in recording as boolean

  const [recordingBackgroundColor, setRecordingBackgroundColor] =
    useState<string>("#83c0e9"); // Background color for recording as string
  const [recordingNameTagsColor, setRecordingNameTagsColor] =
    useState<string>("#ffffff"); // Name tag color for recording as string

  const recordingAddText = useRef<boolean>(false); // Whether to add text to recording as boolean
  const recordingCustomText = useRef<string>("Add Text"); // Custom text for recording as string
  const recordingCustomTextPosition = useRef<string>("top"); // Custom text position for recording as string

  const [recordingCustomTextColor, setRecordingCustomTextColor] =
    useState<string>("#ffffff"); // Custom text color for recording as string

  const recordingOrientationVideo = useRef<string>("landscape"); // Orientation for video recording as string
  const clearedToResume = useRef<boolean>(true); // True if cleared to resume recording as boolean
  const clearedToRecord = useRef<boolean>(true); // True if cleared to record as boolean
  const [recordState, setRecordState] = useState<string>("green"); // Recording state with specific values

  const [showRecordButtons, setShowRecordButtons] = useState<boolean>(false); // Show record buttons as boolean
  const [recordingProgressTime, setRecordingProgressTime] =
    useState<string>("00:00:00"); // Recording progress time as string
  const [audioSwitching, setAudioSwitching] = useState<boolean>(false); // True if audio is switching as boolean
  const [videoSwitching, setVideoSwitching] = useState<boolean>(false); // True if video is switching as boolean

  // Media-related variables
  const videoAlreadyOn = useRef<boolean>(false); // True if video is already on as boolean
  const audioAlreadyOn = useRef<boolean>(false); // True if audio is already on as boolean

  const componentSizes = useRef<ComponentSizes>({
    // Component sizes as ComponentSizes
    mainHeight: 0,
    otherHeight: 0,
    mainWidth: 0,
    otherWidth: 0,
  }); // Component sizes

  // Permissions-related variables
  const [hasCameraPermission, setHasCameraPermission] =
    useState<boolean>(false); // True if the user has camera permission
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean>(false); // True if the user has audio permission

  // Transports-related variables
  const transportCreated = useRef<boolean>(false); // True if the transport has been created
  const localTransportCreated = useRef<boolean>(false); // True if the local transport has been created
  const transportCreatedVideo = useRef<boolean>(false); // True if the transport has been created for video
  const transportCreatedAudio = useRef<boolean>(false); // True if the transport has been created for audio
  const transportCreatedScreen = useRef<boolean>(false); // True if the transport has been created for screen share
  const producerTransport = useRef<Transport | null>(null); // Producer transport as Transport or null
  const localProducerTransport = useRef<Transport | null>(null); // Local producer transport as Transport or null
  const videoProducer = useRef<Producer | null>(null); // Video producer as Producer or null
  const localVideoProducer = useRef<Producer | null>(null); // Local video producer as Producer or null
  const params = useRef<ProducerOptions>({} as ProducerOptions); // Parameters for the producer as ProducerOptions
  const videoParams = useRef<ProducerOptions>({} as ProducerOptions); // Parameters for the video producer as ProducerOptions
  const audioParams = useRef<ProducerOptions>({} as ProducerOptions); // Parameters for the audio producer as ProducerOptions
  const audioProducer = useRef<Producer | null>(null); // Audio producer as Producer or null
  const audioLevel = useRef<number>(0); // Audio level as number, default 0 for muted
  const localAudioProducer = useRef<Producer | null>(null); // Local audio producer as Producer or null
  const consumerTransports = useRef<TransportType[]>([]); // Array of consumer transports
  const consumingTransports = useRef<string[]>([]); // Array of consuming transport IDs

  // Polls-related variables
  const polls = useRef<Poll[]>(
    useSeed && seedData?.polls ? seedData.polls : []
  ); // Polls as array of Poll
  const poll = useRef<Poll | null>(null); // Single poll as Poll or null
  const [isPollModalVisible, setIsPollModalVisible] = useState<boolean>(false); // True if the poll modal should be shown

  // Background-related variables
  const customImage = useRef<string>(""); // Custom image as string or null
  const selectedImage = useRef<string>(""); // Selected image as string or null
  const segmentVideo = useRef<MediaStream | null>(null); // Segment video as MediaStream or null
  const selfieSegmentation = useRef<SelfieSegmentation | null>(null); // Selfie segmentation as SelfieSegmentation or null
  const pauseSegmentation = useRef<boolean>(false); // Pause segmentation as boolean
  const processedStream = useRef<MediaStream | null>(null); // Processed stream as MediaStream or null
  const keepBackground = useRef<boolean>(false); // Keep background as boolean
  const backgroundHasChanged = useRef<boolean>(false); // Background has changed as boolean
  const virtualStream = useRef<MediaStream | null>(null); // Virtual stream as MediaStream or null
  const mainCanvas = useRef<HTMLCanvasElement | null>(null); // Main canvas as HTMLCanvasElement or null
  const prevKeepBackground = useRef<boolean>(false); // Previous keep background setting as boolean
  const appliedBackground = useRef<boolean>(false); // Applied background as boolean
  const [isBackgroundModalVisible, setIsBackgroundModalVisible] =
    useState<boolean>(false); // True if the background modal should be shown
  const autoClickBackground = useRef<boolean>(false); // Auto click background as boolean

  // Breakout rooms-related variables
  const breakoutRooms = useRef<BreakoutParticipant[][]>(
    useSeed && seedData?.breakoutRooms ? seedData.breakoutRooms : []
  ); // Breakout rooms as array of arrays of BreakoutParticipant
  const currentRoomIndex = useRef<number>(0); // Current room index as number
  const canStartBreakout = useRef<boolean>(false); // True if the breakout room can be started
  const breakOutRoomStarted = useRef<boolean>(false); // True if the breakout room has started
  const breakOutRoomEnded = useRef<boolean>(false); // True if the breakout room has ended
  const hostNewRoom = useRef<number>(-1); // Host new room index as number
  const limitedBreakRoom = useRef<BreakoutParticipant[]>([]); // Limited breakout room as array of BreakoutParticipant
  const mainRoomsLength = useRef<number>(0); // Main rooms length as number
  const memberRoom = useRef<number>(-1); // Member room index as number
  const [isBreakoutRoomsModalVisible, setIsBreakoutRoomsModalVisible] =
    useState<boolean>(false); // True if the breakout rooms modal should be shown

  // Whiteboard-related variables
  const whiteboardUsers = useRef<WhiteboardUser[]>(
    useSeed && seedData?.whiteboardUsers ? seedData.whiteboardUsers : []
  ); // Whiteboard users as array of WhiteboardUser
  const currentWhiteboardIndex = useRef<number | null>(null); // Current whiteboard index as number or null
  const canStartWhiteboard = useRef<boolean>(false); // True if the whiteboard can be started
  const whiteboardStarted = useRef<boolean>(false); // True if the whiteboard has started
  const whiteboardEnded = useRef<boolean>(false); // True if the whiteboard has ended
  const whiteboardLimit = useRef<number>(itemPageLimit.current); // Whiteboard limit as number
  const [isWhiteboardModalVisible, setIsWhiteboardModalVisible] =
    useState<boolean>(false); // True if the whiteboard modal should be shown
  const [
    isConfigureWhiteboardModalVisible,
    setIsConfigureWhiteboardModalVisible,
  ] = useState<boolean>(false); // True if the configure whiteboard modal should be shown
  const shapes = useRef<Shape[]>([]); // Shapes as array of Shape
  const useImageBackground = useRef<boolean>(true); // Use image background as boolean
  const redoStack = useRef<Shape[]>([]); // Redo stack as array of Shape
  const undoStack = useRef<string[]>([]); // Undo stack as array of strings (e.g., action IDs)
  const canvasStream = useRef<MediaStream | null>(null); // Canvas stream as MediaStream or null
  const canvasWhiteboard = useRef<HTMLCanvasElement | null>(null); // Canvas reference as HTMLCanvasElement or null

  // Screenboard-related variables
  const canvasScreenboard = useRef<HTMLCanvasElement | null>(null); // Canvas screenboard as HTMLCanvasElement or null
  const processedScreenStream = useRef<MediaStream | null>(null); // Processed screen stream as MediaStream or null
  const annotateScreenStream = useRef<boolean>(false); // Annotate screen stream as boolean
  const mainScreenCanvas = useRef<HTMLCanvasElement | null>(null); // Main screen canvas as HTMLCanvasElement or null
  const [isScreenboardModalVisible, setIsScreenboardModalVisible] =
    useState<boolean>(false); // True if the screenboard modal should be shown

  // Update functions
  const updateMessages = (value: Message[]) => {
    messages.current = value;
  };

  const updateStartDirectMessage = (value: boolean) => {
    startDirectMessage.current = value;
  };

  const updateDirectMessageDetails = (value: Participant | null) => {
    directMessageDetails.current = value;
  };

  const updateShowMessagesBadge = (value: boolean) => {
    setShowMessagesBadge(value);
  };

  const updateAudioSetting = (value: string) => {
    audioSetting.current = value;
  };

  const updateVideoSetting = (value: string) => {
    videoSetting.current = value;
  };

  const updateScreenshareSetting = (value: string) => {
    screenshareSetting.current = value;
  };

  const updateChatSetting = (value: string) => {
    chatSetting.current = value;
  };

  const updateDisplayOption = (value: string) => {
    displayOption.current = value;
  };

  const updateAutoWave = (value: boolean) => {
    autoWave.current = value;
  };

  const updateForceFullDisplay = (value: boolean) => {
    forceFullDisplay.current = value;
  };

  const updatePrevForceFullDisplay = (value: boolean) => {
    prevForceFullDisplay.current = value;
  };

  const updatePrevMeetingDisplayType = (value: string) => {
    prevMeetingDisplayType.current = value;
  };

  const updateWaitingRoomCounter = (value: number) => {
    waitingRoomCounter.current = value;
  };

  const updateWaitingRoomFilter = (value: string) => {
    waitingRoomFilter.current = value;
  };

  const updateWaitingRoomList = (value: WaitingRoomParticipant[]) => {
    waitingRoomList.current = value;
    filteredWaitingRoomList.current = value;
    waitingRoomCounter.current = value.length;
  };

  const updateRequestCounter = (value: number) => {
    requestCounter.current = value;
  };

  const updateRequestFilter = (value: string) => {
    requestFilter.current = value;
  };

  const updateRequestList = (value: Request[]) => {
    requestList.current = value;
    filteredRequestList.current = value;
    requestCounter.current = value.length;
  };

  const updateTotalReqWait = (value: number) => {
    totalReqWait.current = value;
  };

  const onWaitingRoomFilterChange = (value: string) => {
    //filter the waiting room list based on the value
    if (value !== "" && value.length > 0) {
      let filteredWaitingRoom = waitingRoomList.current.filter(
        (waitingRoom) => {
          return waitingRoom.name.toLowerCase().includes(value.toLowerCase());
        }
      );
      filteredWaitingRoomList.current = filteredWaitingRoom;
      waitingRoomCounter.current = filteredWaitingRoom.length;
    } else {
      filteredWaitingRoomList.current = waitingRoomList.current;
      waitingRoomCounter.current = waitingRoomList.current.length;
    }
  };

  const onRequestFilterChange = (value: string) => {
    //filter the request list based on the value
    if (value !== "" && value.length > 0) {
      let filteredRequest = requestList.current.filter((request: Request) => {
        return request!.name!.toLowerCase().includes(value.toLowerCase());
      });
      filteredRequestList.current = filteredRequest;
      requestCounter.current = filteredRequest.length;
    } else {
      filteredRequestList.current = requestList.current;
      requestCounter.current = requestList.current.length;
    }
  };

  const onParticipantsFilterChange = (value: string) => {
    //filter the participants list based on the value

    if (value !== "" && value.length > 0) {
      let filteredParts = participants.current.filter((participant) => {
        return participant.name.toLowerCase().includes(value.toLowerCase());
      });
      filteredParticipants.current = filteredParts;
      participantsCounter.current = filteredParts.length;
    } else {
      filteredParticipants.current = participants.current;
      participantsCounter.current = participants.current.length;
    }
  };

  const updateIsMenuModalVisible = (value: boolean) => {
    setIsMenuModalVisible(value);
  };

  const updateIsRecordingModalVisible = (value: boolean) => {
    setIsRecordingModalVisible(value);
    if (value == true) {
      updateConfirmedToRecord(false);
    } else {
      if (
        clearedToRecord.current == true &&
        clearedToResume.current == true &&
        recordStarted.current == true
      ) {
        updateShowRecordButtons(true);
      }
    }
  };

  const updateIsSettingsModalVisible = (value: boolean) => {
    setIsSettingsModalVisible(value);
  };

  const updateIsRequestsModalVisible = (value: boolean) => {
    setIsRequestsModalVisible(value);
  };

  const updateIsWaitingModalVisible = (value: boolean) => {
    setIsWaitingModalVisible(value);
  };

  const updateIsCoHostModalVisible = (value: boolean) => {
    setIsCoHostModalVisible(value);
  };

  const updateIsMediaSettingsModalVisible = (value: boolean) => {
    setIsMediaSettingsModalVisible(value);
  };

  const updateIsDisplaySettingsModalVisible = (value: boolean) => {
    setIsDisplaySettingsModalVisible(value);
  };

  const updateIsParticipantsModalVisible = (value: boolean) => {
    setIsParticipantsModalVisible(value);
  };

  const updateIsMessagesModalVisible = (value: boolean) => {
    setIsMessagesModalVisible(value);
    if (value == false) {
      updateShowMessagesBadge(false);
    }
  };

  const updateIsConfirmExitModalVisible = (value: boolean) => {
    setIsConfirmExitModalVisible(value);
  };

  const updateIsConfirmHereModalVisible = (value: boolean) => {
    setIsConfirmHereModalVisible(value);
  };

  const updateIsLoadingModalVisible = (value: boolean) => {
    setIsLoadingModalVisible(value);
  };

  const updateIsShareEventModalVisible = (value: boolean) => {
    setIsShareEventModalVisible(value);
  };

  const updateRecordingMediaOptions = (value: string) => {
    recordingMediaOptions.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingAudioOptions = (value: string) => {
    recordingAudioOptions.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingVideoOptions = (value: string) => {
    recordingVideoOptions.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingVideoType = (value: string) => {
    recordingVideoType.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingVideoOptimized = (value: boolean) => {
    recordingVideoOptimized.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingDisplayType = (value: "media" | "video" | "all") => {
    recordingDisplayType.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingAddHLS = (value: boolean) => {
    recordingAddHLS.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingAddText = (value: boolean) => {
    recordingAddText.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingCustomText = (value: string) => {
    recordingCustomText.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingCustomTextPosition = (value: string) => {
    recordingCustomTextPosition.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingCustomTextColor = (value: string) => {
    setRecordingCustomTextColor(value);
    clearedToRecord.current = false;
  };

  const updateRecordingNameTags = (value: boolean) => {
    recordingNameTags.current = value;
    clearedToRecord.current = false;
  };

  const updateRecordingBackgroundColor = (value: string) => {
    setRecordingBackgroundColor(value);
    clearedToRecord.current = false;
  };

  const updateRecordingNameTagsColor = (value: string) => {
    setRecordingNameTagsColor(value);
    clearedToRecord.current = false;
  };

  const updateRecordingOrientationVideo = (value: string) => {
    recordingOrientationVideo.current = value;
    clearedToRecord.current = false;
  };

  const updateClearedToResume = (value: boolean) => {
    clearedToResume.current = value;
  };

  const updateClearedToRecord = (value: boolean) => {
    clearedToRecord.current = value;
  };

  const updateRecordState = (value: string) => {
    setRecordState(value);
  };

  const updateShowRecordButtons = (value: boolean) => {
    setShowRecordButtons(value);
  };

  const updateRecordingProgressTime = (value: string) => {
    setRecordingProgressTime(value);
  };

  const updateAudioSwitching = (value: boolean) => {
    setAudioSwitching(value);
  };

  const updateVideoSwitching = (value: boolean) => {
    setVideoSwitching(value);
  };

  const updateVideoAlreadyOn = (value: boolean) => {
    videoAlreadyOn.current = value;
    setVideoActive(value);
  };

  const updateAudioAlreadyOn = (value: boolean) => {
    audioAlreadyOn.current = value;
    setMicActive(value);
  };

  const updateComponentSizes = (sizes: ComponentSizes) => {
    componentSizes.current = sizes;
  };

  const updateHasCameraPermission = (value: boolean) => {
    setHasCameraPermission(value);
  };

  const updateHasAudioPermission = (value: boolean) => {
    setHasAudioPermission(value);
  };

  const requestPermissionCamera = async () => {
    return "granted";
  };

  const requestPermissionAudio = async () => {
    // Request audio permissions

    return "granted";
  };

  const updateTransportCreated = (value: boolean) => {
    transportCreated.current = value;
  };

  const updateLocalTransportCreated = (value: boolean) => {
    localTransportCreated.current = value;
  };

  const updateTransportCreatedVideo = (value: boolean) => {
    transportCreatedVideo.current = value;
  };

  const updateTransportCreatedAudio = (value: boolean) => {
    transportCreatedAudio.current = value;
  };

  const updateTransportCreatedScreen = (value: boolean) => {
    transportCreatedScreen.current = value;
  };

  const updateProducerTransport = (value: Transport | null) => {
    producerTransport.current = value;
  };

  const updateLocalProducerTransport = (value: Transport | null) => {
    localProducerTransport.current = value;
  };

  const updateVideoProducer = (value: Producer | null) => {
    videoProducer.current = value;
  };

  const updateLocalVideoProducer = (value: Producer | null) => {
    localVideoProducer.current = value;
  };

  const updateParams = (value: ProducerOptions) => {
    params.current = value;
  };

  const updateVideoParams = (value: ProducerOptions) => {
    videoParams.current = value;
  };

  const updateAudioParams = (value: ProducerOptions) => {
    audioParams.current = value;
  };

  const updateAudioProducer = (value: Producer | null) => {
    audioProducer.current = value;
  };

  const updateAudioLevel = (value: number) => {
    audioLevel.current = value;
  };

  const updateLocalAudioProducer = (value: Producer | null) => {
    localAudioProducer.current = value;
  };

  const updateConsumerTransports = (value: TransportType[]) => {
    consumerTransports.current = value;
  };

  const updateConsumingTransports = (value: string[]) => {
    consumingTransports.current = value;
  };

  const updatePolls = (value: Poll[]) => {
    polls.current = value;
  };

  const updatePoll = (value: Poll | null) => {
    poll.current = value;
  };

  const updateIsPollModalVisible = (value: boolean) => {
    setIsPollModalVisible(value);
  };

  // Update functions
  const updateCustomImage = (value: string) => {
    customImage.current = value;
  };

  const updateSelectedImage = (value: string) => {
    selectedImage.current = value;
  };

  const updateSegmentVideo = (value: MediaStream | null) => {
    segmentVideo.current = value;
  };

  const updateSelfieSegmentation = (value: SelfieSegmentation | null) => {
    selfieSegmentation.current = value;
  };

  const updatePauseSegmentation = (value: boolean) => {
    pauseSegmentation.current = value;
  };

  const updateProcessedStream = (value: MediaStream | null) => {
    processedStream.current = value;
  };

  const updateKeepBackground = (value: boolean) => {
    keepBackground.current = value;
  };

  const updateBackgroundHasChanged = (value: boolean) => {
    backgroundHasChanged.current = value;
  };

  const updateVirtualStream = (value: MediaStream | null) => {
    virtualStream.current = value;
  };

  const updateMainCanvas = (value: HTMLCanvasElement | null) => {
    mainCanvas.current = value;
  };

  const updatePrevKeepBackground = (value: boolean) => {
    prevKeepBackground.current = value;
  };

  const updateAppliedBackground = (value: boolean) => {
    appliedBackground.current = value;
  };

  const updateIsBackgroundModalVisible = (value: boolean) => {
    setIsBackgroundModalVisible(value);
  };

  const updateAutoClickBackground = (value: boolean) => {
    autoClickBackground.current = value;
  };

  const updateBreakoutRooms = (value: BreakoutParticipant[][]) => {
    breakoutRooms.current = value;
  };

  const updateCurrentRoomIndex = (value: number) => {
    currentRoomIndex.current = value;
  };

  const updateCanStartBreakout = (value: boolean) => {
    canStartBreakout.current = value;
  };

  const updateBreakOutRoomStarted = (value: boolean) => {
    breakOutRoomStarted.current = value;
  };

  const updateBreakOutRoomEnded = (value: boolean) => {
    breakOutRoomEnded.current = value;
  };

  const updateHostNewRoom = (value: number) => {
    hostNewRoom.current = value;
  };

  const updateLimitedBreakRoom = (value: BreakoutParticipant[]) => {
    limitedBreakRoom.current = value;
  };

  const updateMainRoomsLength = (value: number) => {
    mainRoomsLength.current = value;
  };

  const updateMemberRoom = (value: number) => {
    memberRoom.current = value;
  };

  const updateIsBreakoutRoomsModalVisible = (value: boolean) => {
    setIsBreakoutRoomsModalVisible(value);
  };

  const updateWhiteboardUsers = (value: WhiteboardUser[]) => {
    whiteboardUsers.current = value;
  };

  const updateCurrentWhiteboardIndex = (value: number | null) => {
    currentWhiteboardIndex.current = value;
  };

  const updateCanStartWhiteboard = (value: boolean) => {
    canStartWhiteboard.current = value;
  };

  const updateWhiteboardStarted = (value: boolean) => {
    whiteboardStarted.current = value;
  };

  const updateWhiteboardEnded = (value: boolean) => {
    whiteboardEnded.current = value;
  };

  const updateWhiteboardLimit = (value: number) => {
    whiteboardLimit.current = value;
  };

  const updateIsWhiteboardModalVisible = (value: boolean) => {
    setIsWhiteboardModalVisible(value);
  };

  const updateIsConfigureWhiteboardModalVisible = (value: boolean) => {
    setIsConfigureWhiteboardModalVisible(value);
  };

  const updateShapes = (value: Shape[]) => {
    shapes.current = value;
  };

  const updateUseImageBackground = (value: boolean) => {
    useImageBackground.current = value;
  };

  const updateRedoStack = (value: Shape[]) => {
    redoStack.current = value;
  };

  const updateUndoStack = (value: string[]) => {
    undoStack.current = value;
  };

  const updateCanvasStream = (value: MediaStream | null) => {
    canvasStream.current = value;
  };

  const updateCanvasWhiteboard = (value: HTMLCanvasElement | null) => {
    canvasWhiteboard.current = value;
  };

  const updateCanvasScreenboard = (value: HTMLCanvasElement | null) => {
    canvasScreenboard.current = value;
  };

  const updateProcessedScreenStream = (value: MediaStream | null) => {
    processedScreenStream.current = value;
  };

  const updateAnnotateScreenStream = (value: boolean) => {
    annotateScreenStream.current = value;
  };

  const updateMainScreenCanvas = (value: HTMLCanvasElement | null) => {
    mainScreenCanvas.current = value;
  };

  const updateIsScreenboardModalVisible = (value: boolean) => {
    setIsScreenboardModalVisible(value);
  };

  function checkOrientation() {
    // Check the device orientation using window.matchMedia()
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;

    return isPortrait ? "portrait" : "landscape";
  }

  const getUpdatedAllParams = () => {
    // Get all the params for the room as well as the update functions for them and Media SFU functions and return them
    try {
      if (sourceParameters !== null) {
        sourceParameters = {
          ...getAllParams(),
          ...mediaSFUFunctions(),
        };
        if (updateSourceParameters){
          updateSourceParameters(sourceParameters);
        }
      }
    } catch {
      // Do nothing
    }

    return {
      ...getAllParams(),
      ...mediaSFUFunctions(),
    };
  };

  const mediaSFUFunctions = () => {
    // Media SFU functions

    return {
      updateMiniCardsGrid,
      mixStreams,
      dispStreams,
      stopShareScreen,
      checkScreenShare,
      startShareScreen,
      requestScreenShare,
      reorderStreams,
      prepopulateUserMedia,
      getVideos,
      rePort,
      trigger,
      consumerResume,
      connectSendTransport,
      connectSendTransportAudio,
      connectSendTransportVideo,
      connectSendTransportScreen,
      processConsumerTransports,
      resumePauseStreams,
      readjust,
      checkGrid,
      getEstimate,
      calculateRowsAndColumns,
      addVideosGrid,
      onScreenChanges,
      sleep,
      changeVids,
      compareActiveNames,
      compareScreenStates,
      createSendTransport,
      resumeSendTransportAudio,
      receiveAllPipedTransports,
      disconnectSendTransportVideo,
      disconnectSendTransportAudio,
      disconnectSendTransportScreen,
      getPipedProducersAlt,
      signalNewConsumerTransport,
      connectRecvTransport,
      reUpdateInter,
      updateParticipantAudioDecibels,
      closeAndResize,
      autoAdjust,
      switchUserVideoAlt,
      switchUserVideo,
      switchUserAudio,
      getDomains,
      formatNumber,
      connectIps,
      connectLocalIps,
      createDeviceClient,

      handleCreatePoll,
      handleEndPoll,
      handleVotePoll,

      captureCanvasStream,
      resumePauseAudioStreams,
      processConsumerTransportsAudio,

      checkPermission,
      streamSuccessVideo,
      streamSuccessAudio,
      streamSuccessScreen,
      streamSuccessAudioSwitch,
      clickVideo,
      clickAudio,
      clickScreenShare,
      switchVideoAlt,
      requestPermissionCamera,
      requestPermissionAudio,
    };
  };

  const getAllParams = () => {
    //get all the params for the room as well as the update functions for them and return them

    return {
      localUIMode: localUIMode.current, // Local UI mode

      //Room Details
      roomName: roomName.current,
      member: member.current,
      adminPasscode: adminPasscode.current,
      youAreCoHost: youAreCoHost.current,
      youAreHost: youAreHost.current,
      islevel: islevel.current,
      confirmedToRecord: confirmedToRecord.current,
      meetingDisplayType: meetingDisplayType.current,
      meetingVideoOptimized: meetingVideoOptimized.current,
      eventType: eventType.current,
      participants: participants.current,
      filteredParticipants: filteredParticipants.current,
      participantsCounter: participantsCounter.current,
      participantsFilter: participantsFilter.current,

      //more room details - media
      consume_sockets: consume_sockets.current,
      rtpCapabilities: rtpCapabilities.current,
      roomRecvIPs: roomRecvIPs.current,
      meetingRoomParams: meetingRoomParams.current,
      itemPageLimit: itemPageLimit.current,
      audioOnlyRoom: audioOnlyRoom.current,
      addForBasic: addForBasic.current,
      screenPageLimit: screenPageLimit.current,
      shareScreenStarted: shareScreenStarted.current,
      shared: shared.current,
      targetOrientation: targetOrientation.current,
      targetResolution: targetResolution.current,
      targetResolutionHost: targetResolutionHost.current,
      vidCons: vidCons.current,
      frameRate: frameRate.current,
      hParams: hParams.current,
      vParams: vParams.current,
      screenParams: screenParams.current,
      aParams: aParams.current,

      //more room details - recording
      recordingAudioPausesLimit: recordingAudioPausesLimit.current,
      recordingAudioPausesCount: recordingAudioPausesCount.current,
      recordingAudioSupport: recordingAudioSupport.current,
      recordingAudioPeopleLimit: recordingAudioPeopleLimit.current,
      recordingAudioParticipantsTimeLimit:
        recordingAudioParticipantsTimeLimit.current,
      recordingVideoPausesCount: recordingVideoPausesCount.current,
      recordingVideoPausesLimit: recordingVideoPausesLimit.current,
      recordingVideoSupport: recordingVideoSupport.current,
      recordingVideoPeopleLimit: recordingVideoPeopleLimit.current,
      recordingVideoParticipantsTimeLimit:
        recordingVideoParticipantsTimeLimit.current,
      recordingAllParticipantsSupport: recordingAllParticipantsSupport.current,
      recordingVideoParticipantsSupport:
        recordingVideoParticipantsSupport.current,
      recordingAllParticipantsFullRoomSupport:
        recordingAllParticipantsFullRoomSupport.current,
      recordingVideoParticipantsFullRoomSupport:
        recordingVideoParticipantsFullRoomSupport.current,
      recordingPreferredOrientation: recordingPreferredOrientation.current,
      recordingSupportForOtherOrientation:
        recordingSupportForOtherOrientation.current,
      recordingMultiFormatsSupport: recordingMultiFormatsSupport.current,

      userRecordingParams: userRecordingParams.current,
      canRecord: canRecord.current,
      startReport: startReport.current,
      endReport: endReport.current,
      recordStartTime: recordStartTime.current,
      recordElapsedTime: recordElapsedTime.current,
      isTimerRunning: isTimerRunning.current,
      canPauseResume: canPauseResume.current,
      recordChangeSeconds: recordChangeSeconds.current,
      pauseLimit: pauseLimit.current,
      pauseRecordCount: pauseRecordCount.current,
      canLaunchRecord: canLaunchRecord.current,
      stopLaunchRecord: stopLaunchRecord.current,

      participantsAll: participantsAll.current,

      firstAll: firstAll.current,
      updateMainWindow: updateMainWindow.current,
      first_round: first_round.current,
      landScaped: landScaped.current,
      lock_screen: lock_screen.current,
      screenId: screenId.current,
      allVideoStreams: allVideoStreams.current,
      newLimitedStreams: newLimitedStreams.current,
      newLimitedStreamsIDs: newLimitedStreamsIDs.current,
      activeSounds: activeSounds.current,
      screenShareIDStream: screenShareIDStream.current,
      screenShareNameStream: screenShareNameStream.current,
      adminIDStream: adminIDStream.current,
      adminNameStream: adminNameStream.current,
      youYouStream: youYouStream.current,
      youYouStreamIDs: youYouStreamIDs.current,
      localStream: localStream.current,
      recordStarted: recordStarted.current,
      recordResumed: recordResumed.current,
      recordPaused: recordPaused.current,
      recordStopped: recordStopped.current,
      adminRestrictSetting: adminRestrictSetting.current,
      videoRequestState: videoRequestState.current,
      videoRequestTime: videoRequestTime.current,
      videoAction: videoAction.current,
      localStreamVideo: localStreamVideo.current,
      userDefaultVideoInputDevice: userDefaultVideoInputDevice.current,
      currentFacingMode: currentFacingMode.current,
      prevFacingMode: prevFacingMode.current,
      defVideoID: defVideoID.current,
      allowed: allowed.current,
      dispActiveNames: dispActiveNames.current,
      p_dispActiveNames: p_dispActiveNames.current,
      activeNames: activeNames.current,
      prevActiveNames: prevActiveNames.current,
      p_activeNames: p_activeNames.current,
      membersReceived: membersReceived.current,
      deferScreenReceived: deferScreenReceived.current,
      hostFirstSwitch: hostFirstSwitch.current,
      micAction: micAction.current,
      screenAction: screenAction.current,
      chatAction: chatAction.current,
      audioRequestState: audioRequestState.current,
      screenRequestState: screenRequestState.current,
      chatRequestState: chatRequestState.current,
      audioRequestTime: audioRequestTime.current,
      screenRequestTime: screenRequestTime.current,
      chatRequestTime: chatRequestTime.current,
      updateRequestIntervalSeconds: updateRequestIntervalSeconds.current,
      oldSoundIds: oldSoundIds.current,
      hostLabel: hostLabel.current,
      mainScreenFilled: mainScreenFilled.current,
      localStreamScreen: localStreamScreen.current,
      screenAlreadyOn: screenAlreadyOn,
      chatAlreadyOn: chatAlreadyOn,
      redirectURL: redirectURL.current,
      oldAllStreams: oldAllStreams.current,
      adminVidID: adminVidID.current,
      streamNames: streamNames.current,
      non_alVideoStreams: non_alVideoStreams.current,
      sortAudioLoudness: sortAudioLoudness.current,
      audioDecibels: audioDecibels.current,
      mixed_alVideoStreams: mixed_alVideoStreams.current,
      non_alVideoStreams_muted: non_alVideoStreams_muted.current,
      paginatedStreams: paginatedStreams.current,
      localStreamAudio: localStreamAudio.current,
      defAudioID: defAudioID.current,
      userDefaultAudioInputDevice: userDefaultAudioInputDevice.current,
      userDefaultAudioOutputDevice: userDefaultAudioOutputDevice.current,
      prevAudioInputDevice: prevAudioInputDevice.current,
      prevVideoInputDevice: prevVideoInputDevice.current,
      audioPaused: audioPaused.current,
      mainScreenPerson: mainScreenPerson.current,
      adminOnMainScreen: adminOnMainScreen.current,
      screenStates: screenStates.current,
      prevScreenStates: prevScreenStates.current,
      updateDateState: updateDateState.current,
      lastUpdate: lastUpdate.current,
      nForReadjustRecord: nForReadjustRecord.current,
      fixedPageLimit: fixedPageLimit.current,
      removeAltGrid: removeAltGrid.current,
      nForReadjust: nForReadjust.current,
      lastReorderTime: lastReorderTime.current,
      reorderInterval: reorderInterval.current,
      fastReorderInterval: fastReorderInterval.current,
      audStreamNames: audStreamNames.current,
      currentUserPage: currentUserPage.current,
      mainHeightWidth: mainHeightWidth,
      prevMainHeightWidth: prevMainHeightWidth.current,
      prevDoPaginate: prevDoPaginate.current,
      doPaginate: doPaginate.current,
      shareEnded: shareEnded.current,
      lStreams: lStreams.current,
      chatRefStreams: chatRefStreams.current,
      controlHeight: controlHeight,
      isWideScreen: isWideScreen.current,
      isMediumScreen: isMediumScreen.current,
      isSmallScreen: isSmallScreen.current,
      addGrid: addGrid.current,
      addAltGrid: addAltGrid.current,
      gridRows: gridRows,
      gridCols: gridCols,
      altGridRows: altGridRows,
      altGridCols: altGridCols,
      numberPages: numberPages,
      currentStreams: currentStreams,
      showMiniView: showMiniView,
      nStream: nStream.current,
      defer_receive: defer_receive.current,
      allAudioStreams: allAudioStreams.current,
      screenProducer: screenProducer.current,
      remoteScreenStream: remoteScreenStream.current,
      gotAllVids: gotAllVids.current,
      paginationHeightWidth: paginationHeightWidth.current,
      paginationDirection: paginationDirection.current,
      gridSizes: gridSizes.current,
      screenForceFullDisplay: screenForceFullDisplay.current,
      mainGridStream: mainGridStream.current,
      otherGridStreams: otherGridStreams,
      audioOnlyStreams: audioOnlyStreams.current,
      videoInputs: videoInputs,
      audioInputs: audioInputs,
      meetingProgressTime: meetingProgressTime,
      meetingElapsedTime: meetingElapsedTime.current,

      ref_participants: ref_participants.current,

      messages: messages.current,
      startDirectMessage: startDirectMessage.current,
      directMessageDetails: directMessageDetails.current,
      coHost: coHost.current,
      coHostResponsibility: coHostResponsibility.current,

      //event settings
      audioSetting: audioSetting.current,
      videoSetting: videoSetting.current,
      screenshareSetting: screenshareSetting.current,
      chatSetting: chatSetting.current,

      //display settings
      autoWave: autoWave.current,
      forceFullDisplay: forceFullDisplay.current,
      prevForceFullDisplay: prevForceFullDisplay.current,
      prevMeetingDisplayType: prevMeetingDisplayType.current,

      //waiting room
      waitingRoomFilter: waitingRoomFilter.current,
      waitingRoomList: waitingRoomList.current,
      waitingRoomCounter: waitingRoomCounter.current,
      filteredWaitingRoomList: filteredWaitingRoomList.current,

      //Requests
      requestFilter: requestFilter.current,
      requestList: requestList.current,
      requestCounter: requestCounter.current,
      filteredRequestList: filteredRequestList.current,

      //total requests and waiting room
      totalReqWait: totalReqWait.current,

      //alerts
      alertVisible: alertVisible,
      alertMessage: alertMessage,
      alertType: alertType,
      alertDuration: alertDuration,

      //Progress Timer
      progressTimerVisible: progressTimerVisible,
      progressTimerValue: progressTimerValue,

      //Menu modals
      isMenuModalVisible: isMenuModalVisible,
      isRecordingModalVisible: isRecordingModalVisible,
      isSettingsModalVisible: isSettingsModalVisible,
      isRequestsModalVisible: isRequestsModalVisible,
      isWaitingModalVisible: isWaitingModalVisible,
      isCoHostModalVisible: isCoHostModalVisible,
      isMediaSettingsModalVisible: isMediaSettingsModalVisible,
      isDisplaySettingsModalVisible: isDisplaySettingsModalVisible,

      //Other Modals
      isParticipantsModalVisible: isParticipantsModalVisible,
      isMessagesModalVisible: isMessagesModalVisible,
      isConfirmExitModalVisible: isConfirmExitModalVisible,
      isConfirmHereModalVisible: isConfirmHereModalVisible,
      isLoadingModalVisible: isLoadingModalVisible,

      //recording Options
      recordingMediaOptions: recordingMediaOptions.current,
      recordingAudioOptions: recordingAudioOptions.current,
      recordingVideoOptions: recordingVideoOptions.current,
      recordingVideoType: recordingVideoType.current,
      recordingVideoOptimized: recordingVideoOptimized.current,
      recordingDisplayType: recordingDisplayType.current,
      recordingAddHLS: recordingAddHLS.current,
      recordingAddText: recordingAddText.current,
      recordingCustomText: recordingCustomText.current,
      recordingCustomTextPosition: recordingCustomTextPosition.current,
      recordingCustomTextColor: recordingCustomTextColor,
      recordingNameTags: recordingNameTags.current,
      recordingBackgroundColor: recordingBackgroundColor,
      recordingNameTagsColor: recordingNameTagsColor,
      recordingOrientationVideo: recordingOrientationVideo.current,
      clearedToResume: clearedToResume.current,
      clearedToRecord: clearedToRecord.current,
      recordState: recordState,
      showRecordButtons: showRecordButtons,
      recordingProgressTime: recordingProgressTime,
      audioSwitching: audioSwitching,
      videoSwitching: videoSwitching,

      //media states
      videoAlreadyOn: videoAlreadyOn.current,
      audioAlreadyOn: audioAlreadyOn.current,
      componentSizes: componentSizes.current,

      //permissions
      hasCameraPermission: hasCameraPermission,
      hasAudioPermission: hasAudioPermission,

      //transports
      transportCreated: transportCreated.current,
      localTransportCreated: localTransportCreated.current,
      transportCreatedVideo: transportCreatedVideo.current,
      transportCreatedAudio: transportCreatedAudio.current,
      transportCreatedScreen: transportCreatedScreen.current,
      producerTransport: producerTransport.current,
      localProducerTransport: localProducerTransport.current,
      videoProducer: videoProducer.current,
      localVideoProducer: localVideoProducer.current,
      params: params.current,
      videoParams: videoParams.current,
      audioParams: audioParams.current,
      audioProducer: audioProducer.current,
      audioLevel: audioLevel.current,
      localAudioProducer: localAudioProducer.current,
      consumerTransports: consumerTransports.current,
      consumingTransports: consumingTransports.current,

      //polls
      polls: polls.current,
      poll: poll.current,
      isPollModalVisible: isPollModalVisible,

      //background
      customImage: customImage.current,
      selectedImage: selectedImage.current,
      segmentVideo: segmentVideo.current,
      selfieSegmentation: selfieSegmentation.current,
      pauseSegmentation: pauseSegmentation.current,
      processedStream: processedStream.current,
      keepBackground: keepBackground.current,
      backgroundHasChanged: backgroundHasChanged.current,
      virtualStream: virtualStream.current,
      mainCanvas: mainCanvas.current,
      prevKeepBackground: prevKeepBackground.current,
      appliedBackground: appliedBackground.current,
      isBackgroundModalVisible: isBackgroundModalVisible,
      autoClickBackground: autoClickBackground.current,

      //breakout rooms
      breakoutRooms: breakoutRooms.current,
      currentRoomIndex: currentRoomIndex.current,
      canStartBreakout: canStartBreakout.current,
      breakOutRoomStarted: breakOutRoomStarted.current,
      breakOutRoomEnded: breakOutRoomEnded.current,
      hostNewRoom: hostNewRoom.current,
      limitedBreakRoom: limitedBreakRoom.current,
      mainRoomsLength: mainRoomsLength.current,
      memberRoom: memberRoom.current,
      isBreakoutRoomsModalVisible: isBreakoutRoomsModalVisible,

      //whiteboard
      whiteboardUsers: whiteboardUsers.current,
      currentWhiteboardIndex: currentWhiteboardIndex.current,
      canStartWhiteboard: canStartWhiteboard.current,
      whiteboardStarted: whiteboardStarted.current,
      whiteboardEnded: whiteboardEnded.current,
      whiteboardLimit: whiteboardLimit.current,
      isWhiteboardModalVisible: isWhiteboardModalVisible,
      isConfigureWhiteboardModalVisible: isConfigureWhiteboardModalVisible,
      shapes: shapes.current,
      useImageBackground: useImageBackground.current,
      redoStack: redoStack.current,
      undoStack: undoStack.current,
      canvasStream: canvasStream.current,
      canvasWhiteboard: canvasWhiteboard.current,

      //screenboard
      canvasScreenboard: canvasScreenboard.current,
      processedScreenStream: processedScreenStream.current,
      annotateScreenStream: annotateScreenStream.current,
      mainScreenCanvas: mainScreenCanvas.current,
      isScreenboardModalVisible: isScreenboardModalVisible,

      validated: validated,

      device: device.current,
      socket: socket.current,
      localSocket: localSocket.current!,
      checkMediaPermission: false,
      onWeb: true,
      mediaDevices: navigator.mediaDevices,

      //update functions
      //Room Details
      updateRoomName,
      updateMember,
      updateAdminPasscode,
      updateYouAreCoHost,
      updateYouAreHost,
      updateIslevel,
      updateCoHost,
      updateCoHostResponsibility,
      updateConfirmedToRecord,
      updateMeetingDisplayType,
      updateMeetingVideoOptimized,
      updateEventType,
      updateParticipants,
      updateParticipantsCounter,
      updateParticipantsFilter,

      //more room details - media
      updateConsume_sockets,
      updateRtpCapabilities,
      updateRoomRecvIPs,
      updateMeetingRoomParams,
      updateItemPageLimit,
      updateAudioOnlyRoom,
      updateAddForBasic,
      updateScreenPageLimit,
      updateShareScreenStarted,
      updateShared,
      updateTargetOrientation,
      updateTargetResolution,
      updateTargetResolutionHost,
      updateVidCons,
      updateFrameRate,
      updateHParams,
      updateVParams,
      updateScreenParams,
      updateAParams,

      //more room details - recording
      updateRecordingAudioPausesLimit,
      updateRecordingAudioPausesCount,
      updateRecordingAudioSupport,
      updateRecordingAudioPeopleLimit,
      updateRecordingAudioParticipantsTimeLimit,
      updateRecordingVideoPausesCount,
      updateRecordingVideoPausesLimit,
      updateRecordingVideoSupport,
      updateRecordingVideoPeopleLimit,
      updateRecordingVideoParticipantsTimeLimit,
      updateRecordingAllParticipantsSupport,
      updateRecordingVideoParticipantsSupport,
      updateRecordingAllParticipantsFullRoomSupport,
      updateRecordingVideoParticipantsFullRoomSupport,
      updateRecordingPreferredOrientation,
      updateRecordingSupportForOtherOrientation,
      updateRecordingMultiFormatsSupport,

      updateUserRecordingParams,
      updateCanRecord,
      updateStartReport,
      updateEndReport,
      updateRecordTimerInterval,
      updateRecordStartTime,
      updateRecordElapsedTime,
      updateIsTimerRunning,
      updateCanPauseResume,
      updateRecordChangeSeconds,
      updatePauseLimit,
      updatePauseRecordCount,
      updateCanLaunchRecord,
      updateStopLaunchRecord,

      updateParticipantsAll,

      updateFirstAll,
      updateUpdateMainWindow,
      updateFirst_round,
      updateLandScaped,
      updateLock_screen,
      updateScreenId,
      updateAllVideoStreams,
      updateNewLimitedStreams,
      updateNewLimitedStreamsIDs,
      updateActiveSounds,
      updateScreenShareIDStream,
      updateScreenShareNameStream,
      updateAdminIDStream,
      updateAdminNameStream,
      updateYouYouStream,
      updateYouYouStreamIDs,
      updateLocalStream,
      updateRecordStarted,
      updateRecordResumed,
      updateRecordPaused,
      updateRecordStopped,
      updateAdminRestrictSetting,
      updateVideoRequestState,
      updateVideoRequestTime,
      updateVideoAction,
      updateLocalStreamVideo,
      updateUserDefaultVideoInputDevice,
      updateCurrentFacingMode,
      updateRef_participants,
      updateDefVideoID,
      updateAllowed,
      updateDispActiveNames,
      updateP_dispActiveNames,
      updateActiveNames,
      updatePrevActiveNames,
      updateP_activeNames,
      updateMembersReceived,
      updateDeferScreenReceived,
      updateHostFirstSwitch,
      updateMicAction,
      updateScreenAction,
      updateChatAction,
      updateAudioRequestState,
      updateScreenRequestState,
      updateChatRequestState,
      updateAudioRequestTime,
      updateScreenRequestTime,
      updateChatRequestTime,
      updateOldSoundIds,
      updatehostLabel,
      updateMainScreenFilled,
      updateLocalStreamScreen,
      updateScreenAlreadyOn,
      updateChatAlreadyOn,
      updateRedirectURL,
      updateOldAllStreams,
      updateAdminVidID,
      updateStreamNames,
      updateNon_alVideoStreams,
      updateSortAudioLoudness,
      updateAudioDecibels,
      updateMixed_alVideoStreams,
      updateNon_alVideoStreams_muted,
      updatePaginatedStreams,
      updateLocalStreamAudio,
      updateDefAudioID,
      updateUserDefaultAudioInputDevice,
      updateUserDefaultAudioOutputDevice,
      updatePrevAudioInputDevice,
      updatePrevVideoInputDevice,
      updateAudioPaused,
      updateMainScreenPerson,
      updateAdminOnMainScreen,
      updateScreenStates,
      updatePrevScreenStates,
      updateUpdateDateState,
      updateLastUpdate,
      updateNForReadjustRecord,
      updateFixedPageLimit,
      updateRemoveAltGrid,
      updateNForReadjust,
      updateLastReorderTime,
      updateAudStreamNames,
      updateCurrentUserPage,
      updatePrevFacingMode,
      updateMainHeightWidth,
      updatePrevMainHeightWidth,
      updatePrevDoPaginate,
      updateDoPaginate,
      updateShareEnded,
      updateLStreams,
      updateChatRefStreams,
      updateControlHeight,
      updateIsWideScreen,
      updateIsMediumScreen,
      updateIsSmallScreen,
      updateAddGrid,
      updateAddAltGrid,
      updateGridRows,
      updateGridCols,
      updateAltGridRows,
      updateAltGridCols,
      updateNumberPages,
      updateCurrentStreams,
      updateShowMiniView,
      updateNStream,
      updateDefer_receive,
      updateAllAudioStreams,
      updateRemoteScreenStream,
      updateScreenProducer,
      updateLocalScreenProducer,
      updateGotAllVids,
      updatePaginationHeightWidth,
      updatePaginationDirection,
      updateGridSizes,
      updateScreenForceFullDisplay,
      updateMainGridStream,
      updateOtherGridStreams,
      updateAudioOnlyStreams,
      updateVideoInputs,
      updateAudioInputs,
      updateMeetingProgressTime,
      updateMeetingElapsedTime,

      updateMessages,
      updateStartDirectMessage,
      updateDirectMessageDetails,
      updateShowMessagesBadge,

      //event settings
      updateAudioSetting,
      updateVideoSetting,
      updateScreenshareSetting,
      updateChatSetting,

      //display settings
      updateDisplayOption,
      updateAutoWave,
      updateForceFullDisplay,
      updatePrevForceFullDisplay,
      updatePrevMeetingDisplayType,

      //waiting room
      updateWaitingRoomFilter,
      updateWaitingRoomList,
      updateWaitingRoomCounter,

      //Requests
      updateRequestFilter,
      updateRequestList,
      updateRequestCounter,

      //total requests and waiting room
      updateTotalReqWait,

      //showAlert modal
      updateIsMenuModalVisible,
      updateIsRecordingModalVisible,
      updateIsSettingsModalVisible,
      updateIsRequestsModalVisible,
      updateIsWaitingModalVisible,
      updateIsCoHostModalVisible,
      updateIsMediaSettingsModalVisible,
      updateIsDisplaySettingsModalVisible,

      //Other Modals
      updateIsParticipantsModalVisible,
      updateIsMessagesModalVisible,
      updateIsConfirmExitModalVisible,
      updateIsConfirmHereModalVisible,
      updateIsLoadingModalVisible,

      //recording Options
      updateRecordingMediaOptions,
      updateRecordingAudioOptions,
      updateRecordingVideoOptions,
      updateRecordingVideoType,
      updateRecordingVideoOptimized,
      updateRecordingDisplayType,
      updateRecordingAddHLS,
      updateRecordingAddText,
      updateRecordingCustomText,
      updateRecordingCustomTextPosition,
      updateRecordingCustomTextColor,
      updateRecordingNameTags,
      updateRecordingBackgroundColor,
      updateRecordingNameTagsColor,
      updateRecordingOrientationVideo,
      updateClearedToResume,
      updateClearedToRecord,
      updateRecordState,
      updateShowRecordButtons,
      updateRecordingProgressTime,
      updateAudioSwitching,
      updateVideoSwitching,

      //media states
      updateVideoAlreadyOn,
      updateAudioAlreadyOn,
      updateComponentSizes,

      //permissions
      updateHasCameraPermission,
      updateHasAudioPermission,

      //transports
      updateTransportCreated,
      updateLocalTransportCreated,
      updateTransportCreatedVideo,
      updateTransportCreatedAudio,
      updateTransportCreatedScreen,
      updateProducerTransport,
      updateLocalProducerTransport,
      updateVideoProducer,
      updateLocalVideoProducer,
      updateParams,
      updateVideoParams,
      updateAudioParams,
      updateAudioProducer,
      updateAudioLevel,
      updateLocalAudioProducer,
      updateConsumerTransports,
      updateConsumingTransports,

      //polls
      updatePolls,
      updatePoll,
      updateIsPollModalVisible,

      //background
      updateCustomImage,
      updateSelectedImage,
      updateSegmentVideo,
      updateSelfieSegmentation,
      updatePauseSegmentation,
      updateProcessedStream,
      updateKeepBackground,
      updateBackgroundHasChanged,
      updateVirtualStream,
      updateMainCanvas,
      updatePrevKeepBackground,
      updateAppliedBackground,
      updateIsBackgroundModalVisible,
      updateAutoClickBackground,

      //breakout rooms
      updateBreakoutRooms,
      updateCurrentRoomIndex,
      updateCanStartBreakout,
      updateBreakOutRoomStarted,
      updateBreakOutRoomEnded,
      updateHostNewRoom,
      updateLimitedBreakRoom,
      updateMainRoomsLength,
      updateMemberRoom,
      updateIsBreakoutRoomsModalVisible,

      //whiteboard
      updateWhiteboardUsers,
      updateCurrentWhiteboardIndex,
      updateCanStartWhiteboard,
      updateWhiteboardStarted,
      updateWhiteboardEnded,
      updateWhiteboardLimit,
      updateIsWhiteboardModalVisible,
      updateIsConfigureWhiteboardModalVisible,
      updateShapes,
      updateUseImageBackground,
      updateRedoStack,
      updateUndoStack,
      updateCanvasStream,
      updateCanvasWhiteboard,

      //screenboard
      updateCanvasScreenboard,
      updateProcessedScreenStream,
      updateAnnotateScreenStream,
      updateMainScreenCanvas,
      updateIsScreenboardModalVisible,

      checkOrientation,

      updateDevice,
      updateSocket,
      updateLocalSocket,
      updateValidated,

      showAlert,
      getUpdatedAllParams,
    };
  };

  const showAlert = ({
    message,
    type,
    duration = 3000,
  }: {
    message: string;
    type: "success" | "danger";
    duration?: number;
  }) => {
    // Show an alert message, type is 'danger', 'success', duration is in milliseconds
    setAlertMessage(message);
    setAlertType(type);
    setAlertDuration(duration);
    setAlertVisible(true);
  };

  //state variables for the control buttons
  const [micActive, setMicActive] = useState(
    audioAlreadyOn.current ? audioAlreadyOn.current : false
  ); // True if the mic is active
  const [videoActive, setVideoActive] = useState(
    videoAlreadyOn.current ? videoAlreadyOn.current : false
  ); // True if the video is active
  const [screenShareActive, setScreenShareActive] = useState(false); // True if the screen share is active
  const [endCallActive] = useState(false); // True if the end call button is active
  const [participantsActive] = useState(false); // True if the participants button is active

  const recordButton = [
    {
      icon: faRecordVinyl,
      text: "Record",
      onPress: () => {
        // Action for the Record button
        launchRecording({
          updateIsRecordingModalVisible: updateIsRecordingModalVisible,
          isRecordingModalVisible: isRecordingModalVisible,
          showAlert: showAlert,
          stopLaunchRecord: stopLaunchRecord.current,
          canLaunchRecord: canLaunchRecord.current,
          recordingAudioSupport: recordingAudioSupport.current,
          recordingVideoSupport: recordingVideoSupport.current,
          updateCanRecord: updateCanRecord,
          updateClearedToRecord: updateClearedToRecord,
          recordStarted: recordStarted.current,
          recordPaused: recordPaused.current,
          localUIMode: localUIMode.current,
        });
      },
      activeColor: "black",
      inActiveColor: "black",
      show: true,
    },
  ];

  const recordButtons = [
    //recording state control and recording timer buttons
    //Replace or remove any of the buttons as you wish

    //Refer to ControlButtonsAltComponent for more details on how to add custom buttons

    {
      icon: faPlayCircle,
      active: recordPaused.current === false,
      onPress: () => {
        updateRecording({
          parameters: { ...getAllParams(), ...mediaSFUFunctions() },
        });
      },
      activeColor: "black",
      inActiveColor: "black",
      alternateIcon: faPauseCircle,
      show: true,
    },
    {
      icon: faStopCircle,
      active: false,
      onPress: () => {
        stopRecording({
          parameters: { ...getAllParams(), ...mediaSFUFunctions() },
        });
      },
      activeColor: "green",
      inActiveColor: "black",
      show: true,
    },
    {
      customComponent: (
        <div
          style={{
            backgroundColor: "transparent",
            borderWidth: 0,
            padding: 0,
            margin: 2,
          }}
        >
          <span
            style={{
              backgroundColor: "transparent",
              borderWidth: 0,
              padding: 0,
              margin: 0,
            }}
          >
            {recordingProgressTime}
          </span>
        </div>
      ),
      show: true,
    },
    {
      icon: faDotCircle,
      active: false,
      onPress: () => console.log("Status pressed"),
      activeColor: "black",
      inActiveColor: recordPaused.current === false ? "red" : "yellow",
      show: true,
    },
    {
      icon: faCog,
      active: false,
      onPress: () => {
        launchRecording({
          updateIsRecordingModalVisible: updateIsRecordingModalVisible,
          isRecordingModalVisible: isRecordingModalVisible,
          showAlert: showAlert,
          stopLaunchRecord: stopLaunchRecord.current,
          canLaunchRecord: canLaunchRecord.current,
          recordingAudioSupport: recordingAudioSupport.current,
          recordingVideoSupport: recordingVideoSupport.current,
          updateCanRecord: updateCanRecord,
          updateClearedToRecord: updateClearedToRecord,
          recordStarted: recordStarted.current,
          recordPaused: recordPaused.current,
          localUIMode: localUIMode.current,
        });
      },
      activeColor: "green",
      inActiveColor: "black",
      show: true,
    },
  ];

  const customMenuButtons: CustomButton[] = [
    //buttons for the custom menu modal (as used for webinars and conferences)
    //Replace or remove any of the buttons as you wish

    //Refer to customButtons for more details on how to add custom buttons

    {
      icon: faRecordVinyl,
      text: "Record",
      action: () => {
        // Action for the Record button
        launchRecording({
          updateIsRecordingModalVisible: updateIsRecordingModalVisible,
          isRecordingModalVisible: isRecordingModalVisible,
          showAlert: showAlert,
          stopLaunchRecord: stopLaunchRecord.current,
          canLaunchRecord: canLaunchRecord.current,
          recordingAudioSupport: recordingAudioSupport.current,
          recordingVideoSupport: recordingVideoSupport.current,
          updateCanRecord: updateCanRecord,
          updateClearedToRecord: updateClearedToRecord,
          recordStarted: recordStarted.current,
          recordPaused: recordPaused.current,
          localUIMode: localUIMode.current,
        });
      },
      show: !showRecordButtons && islevel.current === "2",
    },
    {
      customComponent: (
        <ControlButtonsAltComponent
          buttons={recordButtons}
          direction={"horizontal"}
          showAspect={true}
        />
      ),
      show: showRecordButtons && islevel.current === "2",
      action: () => {
        console.log("record buttons pressed");
      },
    },
    {
      icon: faCog,
      text: "Event Settings",
      action: () => {
        // Action for the Event Settings button
        launchSettings({
          updateIsSettingsModalVisible: updateIsSettingsModalVisible,
          isSettingsModalVisible: isSettingsModalVisible,
        });
      },
      show: islevel.current === "2",
    },
    {
      icon: faUsers,
      text: "Requests",

      action: () => {
        // Action for the Requests button
        launchRequests({
          updateIsRequestsModalVisible: updateIsRequestsModalVisible,
          isRequestsModalVisible: isRequestsModalVisible,
        });
      },
      show:
        islevel.current === "2" ||
        (coHostResponsibility.current &&
          coHost.current &&
          coHost.current === member.current &&
          !!coHostResponsibility!.current!.find(
            (item) => item.name === "media"
          )!.value === true) ||
        false,
    },
    {
      icon: faClock,
      text: "Waiting",
      action: () => {
        // Action for the Waiting button
        launchWaiting({
          updateIsWaitingModalVisible: updateIsWaitingModalVisible,
          isWaitingModalVisible: isWaitingModalVisible,
        });
      },
      show:
        islevel.current === "2" ||
        (coHostResponsibility.current &&
          coHost.current &&
          coHost.current === member.current &&
          !!coHostResponsibility!.current!.find(
            (item) => item.name === "waiting"
          )!.value === true) ||
        false,
    },
    {
      icon: faUserPlus,
      text: "Co-host",
      action: () => {
        // Action for the Co-host button
        launchCoHost({
          updateIsCoHostModalVisible: updateIsCoHostModalVisible,
          isCoHostModalVisible: isCoHostModalVisible,
        });
      },
      show: islevel.current === "2",
    },
    {
      icon: faTools,
      text: "Set Media",
      action: () => {
        launchMediaSettings({
          updateIsMediaSettingsModalVisible: updateIsMediaSettingsModalVisible,
          isMediaSettingsModalVisible: isMediaSettingsModalVisible,
          audioInputs: audioInputs,
          videoInputs: videoInputs,
          updateAudioInputs: updateAudioInputs,
          updateVideoInputs: updateVideoInputs,
          mediaDevices: navigator.mediaDevices,
        });
      },
      show: true,
    },
    {
      icon: faDesktop,
      text: "Display",
      action: () => {
        // Action for the Display button
        launchDisplaySettings({
          updateIsDisplaySettingsModalVisible:
            updateIsDisplaySettingsModalVisible,
          isDisplaySettingsModalVisible: isDisplaySettingsModalVisible,
        });
      },
      show: true,
    },
    {
      icon: faPoll,
      text: "Poll",
      action: () => {
        // Action for the Poll button
        launchPoll({
          updateIsPollModalVisible: updateIsPollModalVisible,
          isPollModalVisible: isPollModalVisible,
        });
      },
      show: true,
    },

    {
      icon: faUserFriends,
      text: "Breakout Rooms",
      action: () => {
        // Action for the Breakout Rooms button
        launchBreakoutRooms({
          updateIsBreakoutRoomsModalVisible: updateIsBreakoutRoomsModalVisible,
          isBreakoutRoomsModalVisible: isBreakoutRoomsModalVisible,
        });
      },
      show: islevel.current == "2",
    },

    {
      icon: faChalkboardTeacher,
      text: "Whiteboard",
      action: () => {
        // Action for the Whiteboard button
        launchConfigureWhiteboard({
          updateIsConfigureWhiteboardModalVisible:
            updateIsConfigureWhiteboardModalVisible,
          isConfigureWhiteboardModalVisible: isConfigureWhiteboardModalVisible,
        });
      },
      show: islevel.current == "2",
    },
  ];

  const controlBroadcastButtons: ButtonTouch[] = [
    // control buttons for broadcast
    //Replace or remove any of the buttons as you wish

    //Refer to ControlButtonsComponentTouch for more details on how to add custom buttons

    {
      icon: faUsers,
      active: true,
      alternateIcon: faUsers,
      onPress: () => {
        launchParticipants({
          updateIsParticipantsModalVisible: updateIsParticipantsModalVisible,
          isParticipantsModalVisible: isParticipantsModalVisible,
        });
      },
      activeColor: "black",
      inActiveColor: "black",
      show: islevel.current === "2",
    },
    {
      icon: faShareAlt,
      active: true,
      alternateIcon: faShareAlt,
      onPress: () => updateIsShareEventModalVisible(!isShareEventModalVisible),
      activeColor: "black",
      inActiveColor: "black",
      show: true,
    },
    {
      customComponent: (
        <div style={{ position: "relative" }}>
          {/* Your icon */}
          <FontAwesomeIcon icon={faComments} size={"lg"} color="black" />
          {/* Conditionally render a badge */}
          {showMessagesBadge && (
            <div
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "red",
                  borderRadius: 12,
                  paddingLeft: 4,
                  paddingRight: 4,
                  paddingTop: 4,
                  paddingBottom: 4,
                }}
              >
                <span
                  style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                ></span>
              </div>
            </div>
          )}
        </div>
      ),
      onPress: () =>
        launchMessages({
          updateIsMessagesModalVisible: updateIsMessagesModalVisible,
          isMessagesModalVisible: isMessagesModalVisible,
        }),
      show: true,
    },
    {
      icon: faSync,
      active: true,
      alternateIcon: faSync,
      onPress: () =>
        switchVideoAlt({
          parameters: {
            ...getAllParams(),
            ...mediaSFUFunctions(),
          },
        }),
      activeColor: "black",
      inActiveColor: "black",
      show: islevel.current === "2",
    },
    {
      icon: faVideoSlash,
      alternateIcon: faVideo,
      active: videoActive,
      onPress: () =>
        clickVideo({
          parameters: {
            ...getAllParams(),
            ...mediaSFUFunctions(),
          },
        }),
      show: islevel.current === "2",
      activeColor: "green",
      inActiveColor: "red",
    },
    {
      icon: faMicrophoneSlash,
      alternateIcon: faMicrophone,
      active: micActive,
      onPress: () =>
        clickAudio({
          parameters: {
            ...getAllParams(),
            ...mediaSFUFunctions(),
          },
        }),
      activeColor: "green",
      inActiveColor: "red",
      show: islevel.current === "2",
    },
    {
      customComponent: (
        <div
          style={{
            backgroundColor: "transparent",
            borderWidth: 0,
            padding: 0,
            margin: 5,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesomeIcon icon={faChartBar} size={"lg"} color="black" />
          <span
            style={{
              backgroundColor: "transparent",
              borderWidth: 0,
              padding: 0,
              margin: 0,
            }}
          >
            {participantsCounter.current}
          </span>
        </div>
      ),
      show: true,
    },
    {
      icon: faPhone,
      active: endCallActive,
      onPress: () =>
        launchConfirmExit({
          updateIsConfirmExitModalVisible: updateIsConfirmExitModalVisible,
          isConfirmExitModalVisible: isConfirmExitModalVisible,
        }),
      activeColor: "green",
      inActiveColor: "red",
      show: true,
    },
    {
      icon: faPhone,
      active: endCallActive,
      onPress: () => console.log("End Call pressed"), //not in use
      activeColor: "transparent",
      inActiveColor: "transparent",
      backgroundColor: { default: "transparent" },
      show: false,
    },
  ];

  const controlChatButtons: ButtonTouch[] = [
    {
      icon: faShareAlt,
      active: true,
      alternateIcon: faShareAlt,
      onPress: () => updateIsShareEventModalVisible(!isShareEventModalVisible),
      activeColor: "black",
      inActiveColor: "black",
      show: true,
    },
    {
      customComponent: (
        <div style={{ position: "relative" }}>
          {/* Your icon */}
          <FontAwesomeIcon icon={faComments} size={"lg"} color="black" />
          {/* Conditionally render a badge */}
          {showMessagesBadge && (
            <div
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "red",
                  borderRadius: 12,
                  paddingLeft: 4,
                  paddingRight: 4,
                  paddingTop: 4,
                  paddingBottom: 4,
                }}
              >
                <span
                  style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                ></span>
              </div>
            </div>
          )}
        </div>
      ),
      onPress: () =>
        launchMessages({
          updateIsMessagesModalVisible: updateIsMessagesModalVisible,
          isMessagesModalVisible: isMessagesModalVisible,
        }),
      show: true,
    },
    {
      icon: faSync,
      active: true,
      alternateIcon: faSync,
      onPress: () =>
        switchVideoAlt({
          parameters: {
            ...getAllParams(),
            ...mediaSFUFunctions(),
          },
        }),
      activeColor: "black",
      inActiveColor: "black",
      show: true,
    },
    {
      icon: faVideoSlash,
      alternateIcon: faVideo,
      active: videoActive,
      onPress: () =>
        clickVideo({
          parameters: {
            ...getAllParams(),
            ...mediaSFUFunctions(),
          },
        }),
      activeColor: "green",
      inActiveColor: "red",
      show: true,
    },
    {
      icon: faMicrophoneSlash,
      alternateIcon: faMicrophone,
      active: micActive,
      onPress: () =>
        clickAudio({
          parameters: {
            ...getAllParams(),
            ...mediaSFUFunctions(),
          },
        }),
      activeColor: "green",
      inActiveColor: "red",
      show: true,
    },
    {
      icon: faPhone,
      active: endCallActive,
      onPress: () =>
        launchConfirmExit({
          updateIsConfirmExitModalVisible: updateIsConfirmExitModalVisible,
          isConfirmExitModalVisible: isConfirmExitModalVisible,
        }),
      activeColor: "green",
      inActiveColor: "red",
      show: true,
    },
  ];

  const controlButtons = [
    // control buttons for webinar and conference events
    //Replace or remove any of the buttons as you wish

    //Refer to ControlButtonsComponent for more details on how to add custom buttons

    {
      icon: faMicrophoneSlash,
      alternateIcon: faMicrophone,
      active: micActive,
      onPress: () =>
        clickAudio({
          parameters: {
            ...getAllParams(),
            ...mediaSFUFunctions(),
          },
        }),
      activeColor: "green",
      inActiveColor: "red",
      disabled: audioSwitching,
      show: true,
    },
    {
      icon: faVideoSlash,
      alternateIcon: faVideo,
      active: videoActive,
      onPress: () =>
        clickVideo({
          parameters: {
            ...getAllParams(),
            ...mediaSFUFunctions(),
          },
        }),
      activeColor: "green",
      inActiveColor: "red",
      disabled: videoSwitching,
      show: true,
    },
    {
      icon: faDesktop,
      alternateIconComponent: (
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* Desktop icon, change color based on disabled state */}
          <FontAwesomeIcon
            icon={faDesktop}
            size="lg"
            style={{ color: !screenShareActive ? "black" : "green" }}
          />

          {/* Red Ban icon on top if disabled */}
          {!screenShareActive && (
            <FontAwesomeIcon
              icon={faBan}
              size="lg"
              style={{
                color: "red",
                position: "absolute",
                top: 0,
                right: 0,
              }}
            />
          )}
        </div>
      ),
      active: true,
      onPress: () => {
        clickScreenShare({
          parameters: {
            ...getAllParams(),
            ...mediaSFUFunctions(),
          },
        });
      },
      activeColor: "green",
      inActiveColor: "red",
      disabled: false,
      show: true,
    },
    {
      icon: faPhone,
      active: endCallActive,
      onPress: () =>
        launchConfirmExit({
          updateIsConfirmExitModalVisible: updateIsConfirmExitModalVisible,
          isConfirmExitModalVisible: isConfirmExitModalVisible,
        }),
      activeColor: "green",
      inActiveColor: "red",
      disabled: false,
      show: true,
    },
    {
      icon: faUsers,
      active: participantsActive,
      onPress: () =>
        launchParticipants({
          updateIsParticipantsModalVisible: updateIsParticipantsModalVisible,
          isParticipantsModalVisible: isParticipantsModalVisible,
        }),
      activeColor: "black",
      inActiveColor: "black",
      disabled: false,
      show: true,
    },
    {
      customComponent: (
        <div style={{ position: "relative" }}>
          <FontAwesomeIcon icon={faBars} size={"lg"} color="black" />
          <div
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "red",
                borderRadius: "50%",
                padding: "4px 4px",
                minWidth: "8px",
                minHeight: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{ color: "white", fontSize: 10, fontWeight: "bold" }}
              >
                {totalReqWait.current}
              </span>
            </div>
          </div>
        </div>
      ),
      onPress: () =>
        launchMenuModal({
          updateIsMenuModalVisible: updateIsMenuModalVisible,
          isMenuModalVisible: isMenuModalVisible,
        }),
      show: true,
    },
    {
      customComponent: (
        <div style={{ position: "relative" }}>
          {/* Your icon */}
          <FontAwesomeIcon icon={faComments} size={"lg"} color="black" />
          {/* Conditionally render a badge */}
          {showMessagesBadge && (
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "red",
                  borderRadius: "50%",
                  padding: "4px 4px",
                  minWidth: "8px",
                  minHeight: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontSize: 10,
                    fontWeight: "bold",
                    lineHeight: "1",
                  }}
                >
                  *
                </span>
              </div>
            </div>
          )}
        </div>
      ),
      onPress: () =>
        launchMessages({
          updateIsMessagesModalVisible: updateIsMessagesModalVisible,
          isMessagesModalVisible: isMessagesModalVisible,
        }),
      show: true,
    },
  ];

  async function join_Room({
    socket,
    roomName,
    islevel,
    member,
    sec,
    apiUserName,
    isLocal = false,
  }: {
    socket: Socket;
    roomName: string;
    islevel: string;
    member: string;
    sec: string;
    apiUserName: string;
    isLocal?: boolean;
  }): Promise<void> {
    //join room and get data from server

    let data: ResponseJoinRoom | null;

    if (!isLocal) {
      data = await joinRoom({
        socket,
        roomName,
        islevel,
        member,
        sec,
        apiUserName,
      });
    } else {
      const localData: ResponseJoinLocalRoom = await joinLocalRoom({
        socket,
        roomName,
        islevel,
        member,
        sec,
        apiUserName,
        parameters: {
          imgSrc,
          showAlert,
          updateIsLoadingModalVisible,
          connectSocket,
          connectLocalSocket,
          updateSocket,
          updateLocalSocket,
          updateValidated,
          updateApiUserName,
          updateApiToken,
          updateLink,
          updateRoomName,
          updateMember,
        },
        checkConnect:
          localLink.length > 0 &&
          connectMediaSFU === true &&
          !link.current.includes("mediasfu.com"),
        localLink,
        joinMediaSFURoom,
      });

      data = await createResponseJoinRoom({ localRoom: localData });
    }

    async function updateAndComplete(data: ResponseJoinRoom) {
      //update room parameters
      try {
        // check if roomRecvIPs is not empty
        if (
          !data.roomRecvIPs ||
          (data.roomRecvIPs && data.roomRecvIPs.length == 0)
        ) {
          data.roomRecvIPs = ["none"];
          if (
            link.current !== "" &&
            link.current.includes("mediasfu.com") &&
            !isLocal
          ) {
            // Community Edition Only
            await receiveAllPipedTransports({
              community: true,
              nsock: getUpdatedAllParams().socket,
              parameters: { ...getAllParams(), ...mediaSFUFunctions() },
            });
          }
        }
        try {
          updateRoomParametersClient({
            parameters: {
              ...getAllParams(),
              ...mediaSFUFunctions(),
              data: data,
            },
          });
        } catch {
          // Handle error
        }

        if (data.isHost) {
          updateIslevel("2");
        } else {
          // issue with isHost for local room
          if (islevel !== "2") {
            updateIslevel("1");
          }
        }

        if (data.secureCode && data.secureCode != "") {
          updateAdminPasscode(data.secureCode);
        }

        if (data.rtpCapabilities) {
          try {
            let device_ = await createDeviceClient({
              rtpCapabilities: data.rtpCapabilities,
            });

            if (device_) {
              updateDevice(device_);
            }
          } catch (error) {
            console.log("error Device", error);
          }
        }
      } catch (error) {
        console.log("error updateRoomParametersClient", error);
      }
    }

    if (data && data.success) {
      if (
        link.current !== "" &&
        link.current!.includes("mediasfu.com") &&
        isLocal
      ) {
        roomData.current = data;
        return;
      } else if (
        link.current !== "" &&
        link.current!.includes("mediasfu.com") &&
        !isLocal
      ) {
        //update roomData
        if (roomData.current) {
          // updating only the recording and meeting room parameters
          roomData.current!.recordingParams = data.recordingParams;
          roomData.current!.meetingRoomParams = data.meetingRoomParams;
        } else {
          roomData.current = data;
        }
      } else {
        //update roomData
        roomData.current = data;
        if (!link.current!.includes("mediasfu.com")) {
          roomData.current!.meetingRoomParams = data.meetingRoomParams;
        }
      }

      await updateAndComplete(data);
    } else {
      if (
        link.current !== "" &&
        link.current!.includes("mediasfu.com") &&
        !isLocal
      ) {
        // join local room only
        await updateAndComplete(roomData.current!);
        return;
      }

      //might be a wrong room name or room is full or other error; check reason in data object if available
      // updateValidated(false);
      try {
        if (showAlert) {
          showAlert({ message: data!.reason!, type: "danger", duration: 3000 });
        }
      } catch {
        // Handle error
      }
    }
  }

  async function disconnectAllSockets(
    consume_sockets: ConsumeSocket[]
  ): Promise<void> {
    //function to disconnect all sockets consuming media (consume_sockets)

    for (const socket of consume_sockets) {
      try {
        const ip = Object.keys(socket)[0];

        // Assuming each socket has a disconnect method
        socket[ip].disconnect();
      } catch (error) {
        console.log(
          `Error disconnecting socket with IP: ${Object.keys(socket)[0]}`,
          error
        );
      }
    }
  }

  async function closeAndReset() {
    //close and clean up all sockets, modals,... and reset all states to initial values

    updateIsMessagesModalVisible(false);
    updateIsParticipantsModalVisible(false);
    updateIsWaitingModalVisible(false);
    updateIsRequestsModalVisible(false);
    updateIsCoHostModalVisible(false);
    updateIsSettingsModalVisible(false);
    updateIsDisplaySettingsModalVisible(false);
    updateIsMediaSettingsModalVisible(false);
    updateIsMenuModalVisible(false);
    updateIsShareEventModalVisible(false);
    updateIsConfirmExitModalVisible(false);
    await disconnectAllSockets(consume_sockets.current);
    await updateStatesToInitialValues();
    updateMeetingProgressTime("00:00:00");
    updateMeetingElapsedTime(0);
    updateRecordingProgressTime("00:00:00");
    updateRecordElapsedTime(0);
    updateShowRecordButtons(false);

    updateIsConfigureWhiteboardModalVisible(false);
    updateIsWhiteboardModalVisible(false);
    updateIsMenuModalVisible(false);
    updateIsRecordingModalVisible(false);
    updateIsPollModalVisible(false);
    updateIsBreakoutRoomsModalVisible(false);
    updateIsBackgroundModalVisible(false);
    updateIsLoadingModalVisible(false);
    updateIsConfirmHereModalVisible(false);

    setTimeout(async function () {
      updateValidated(false);
      //if on web, reload the page
      // window.location.reload();
    }, 500);
  }

  useEffect(() => {
    //listen to changes in recording state and update the recording status indicator accordingly
    //red - recording, yellow - paused, green - stopped (not recording)
    if (recordStarted && !recordStopped) {
      if (!recordPaused) {
        setRecordState("red");
      } else {
        setRecordState("yellow");
      }
    } else {
      setRecordState("green");
    }
  }, [recordStarted, recordPaused, recordStopped]);

  const computeDimensionsMethod = ({
    containerWidthFraction = 1,
    containerHeightFraction = 1,
    mainSize,
    doStack = true,
    defaultFraction,
  }: {
    containerWidthFraction?: number;
    containerHeightFraction?: number;
    mainSize: number;
    doStack?: boolean;
    defaultFraction: number;
  }): ComponentSizes => {
    const parentWidth = window.innerWidth * containerWidthFraction;
    const parentHeight =
      window.innerHeight * containerHeightFraction * defaultFraction;
    let isWideScreen_ = parentWidth >= 768;
    if (!isWideScreen_ && parentWidth > 1.5 * parentHeight) {
      isWideScreen_ = true;
    }

    updateIsWideScreen(isWideScreen_);

    const computeDimensions = (): ComponentSizes => {
      if (doStack) {
        return isWideScreen_
          ? {
              mainHeight: parentHeight,
              otherHeight: parentHeight,
              mainWidth: Math.floor((mainSize / 100) * parentWidth),
              otherWidth: Math.floor(((100 - mainSize) / 100) * parentWidth),
            }
          : {
              mainHeight: Math.floor((mainSize / 100) * parentHeight),
              otherHeight: Math.floor(((100 - mainSize) / 100) * parentHeight),
              mainWidth: parentWidth,
              otherWidth: parentWidth,
            };
      } else {
        return {
          mainHeight: parentHeight,
          otherHeight: parentHeight,
          mainWidth: parentWidth,
          otherWidth: parentWidth,
        };
      }
    };

    return computeDimensions();
  };

  const handleResize = async () => {
    let fraction = 0.0;

    if (eventType.current == "webinar" || eventType.current == "conference") {
      const currentHeight = window.innerHeight;
      fraction = Number((40 / currentHeight).toFixed(3));
      if (fraction !== controlHeight) {
        updateControlHeight(fraction);
      }
    } else {
      // Set default control button height for portrait mode or other event types
      const currentHeight = window.innerHeight;
      fraction = Number((40 / currentHeight).toFixed(3));
      if (fraction !== controlHeight) {
        updateControlHeight(fraction);
      }
    }

    const { mainHeight, otherHeight, mainWidth, otherWidth } =
      computeDimensionsMethod({
        containerWidthFraction: 1,
        containerHeightFraction: 1,
        mainSize: mainHeightWidth,
        doStack: true,
        defaultFraction:
          eventType.current == "webinar" || eventType.current == "conference"
            ? 1 - fraction
            : 1,
      });

    // Use the computed dimensions as needed
    updateComponentSizes({
      mainHeight,
      otherHeight,
      mainWidth,
      otherWidth,
    });

    const orientation = checkOrientation();
    if (orientation === "portrait") {
      if (!isWideScreen.current) {
        if (shareScreenStarted.current || shared.current) {
          updateScreenForceFullDisplay(true);
        }
      }
    }

    //updates the main grid view
    await prepopulateUserMedia({
      name: hostLabel.current,
      parameters: { ...getAllParams(), ...mediaSFUFunctions() },
    });

    //updates the mini grid view
    await onScreenChanges({
      changed: true,
      parameters: { ...getAllParams(), ...mediaSFUFunctions() },
    });
  };

  const onResize = async () => {
    await handleResize();
  };

  useEffect(() => {
    // Add event listener for dimension changes (window resize)
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      // Remove event listener for dimension changes (window resize)
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [onResize]);

  useEffect(() => {
    //listen to changes in dimensions and update the main video size accordingly

    if (!lock_screen && !shared) {
      prepopulateUserMedia({
        name: hostLabel.current,
        parameters: { ...getAllParams(), ...mediaSFUFunctions() },
      });
    } else {
      if (!first_round) {
        prepopulateUserMedia({
          name: hostLabel.current,
          parameters: { ...getAllParams(), ...mediaSFUFunctions() },
        });
      }
    }
  }, [mainHeightWidth]);

  async function connect_Socket(
    apiUserName: string,
    token: string,
    skipSockets: boolean = false
  ): Promise<Socket | null> {
    //connect socket and attach events listeners to socket
    //Refer to https://www.mediasfu.com/documentation for full documentation of each event and its parameters as well uasage
    const socketDefault = socket.current;
    const socketAlt =
      connectMediaSFU && localSocket.current && localSocket.current.id
        ? localSocket.current
        : socketDefault;

    if (socketDefault.id) {
      if (!skipSockets) {
        socketDefault.on("disconnect", async () => {
          await disconnect({
            showAlert,
            redirectURL: redirectURL.current,
            onWeb: true,
            updateValidated,
          });
          if (videoAlreadyOn.current) {
            await clickVideo({
              parameters: {
                ...getAllParams(),
                ...mediaSFUFunctions(),
              },
            });
          }
          if (audioAlreadyOn.current) {
            await clickAudio({
              parameters: {
                ...getAllParams(),
                ...mediaSFUFunctions(),
              },
            });
          }

          await closeAndReset();
        });

        socketDefault.on("allMembers", async (membersData: AllMembersData) => {
          if (membersData) {
            await allMembers({
              apiUserName: apiUserName,
              apiKey: "", //not recommended - use token instead. Use for testing/development only
              apiToken: token,
              members: membersData.members,
              requestss: membersData.requests
                ? membersData.requests
                : requestList.current, //attend
              coHoste: membersData.coHost ? membersData.coHost : coHost.current, //attend
              coHostRes: membersData.coHostResponsibilities
                ? membersData.coHostResponsibilities
                : coHostResponsibility.current, //attend
              parameters: { ...getAllParams(), ...mediaSFUFunctions() },
              consume_sockets: consume_sockets.current,
            });
          }
        });

        socketDefault.on(
          "allMembersRest",
          async (membersData: AllMembersRestData) => {
            if (membersData) {
              await allMembersRest({
                apiUserName: apiUserName,
                apiKey: "", //not recommended - use token instead. Use for testing/development only
                members: membersData.members,
                apiToken: token,
                settings: membersData.settings,
                coHoste: membersData.coHost
                  ? membersData.coHost
                  : coHost.current, //attend
                coHostRes: membersData.coHostResponsibilities
                  ? membersData.coHostResponsibilities
                  : coHostResponsibility.current, //attend
                parameters: { ...getAllParams(), ...mediaSFUFunctions() },
                consume_sockets: consume_sockets.current,
              });
            }
          }
        );

        socketDefault.on("userWaiting", async ({ name }: { name: string }) => {
          await userWaiting({
            name,
            showAlert,
            totalReqWait: totalReqWait.current,
            updateTotalReqWait,
          });
        });

        socketDefault.on("personJoined", async ({ name }: { name: string }) => {
          await personJoined({
            name,
            showAlert,
          });
        });

        socketDefault.on(
          "allWaitingRoomMembers",
          async (waiting_data: AllWaitingRoomMembersData) => {
            await allWaitingRoomMembers({
              waitingParticipants: waiting_data.waitingParticipants
                ? waiting_data.waitingParticipants
                : waiting_data.waitingParticipantss
                ? waiting_data.waitingParticipantss
                : waitingRoomList.current, //attend
              updateTotalReqWait,
              updateWaitingRoomList,
            });
          }
        );

        socketDefault.on("ban", async ({ name }: { name: string }) => {
          await banParticipant({
            name,
            parameters: { ...getAllParams(), ...mediaSFUFunctions() },
          });
        });

        socketDefault.on(
          "updatedCoHost",
          async (cohost_data: UpdatedCoHostData) => {
            // let { coHost, coHostResponsibilities } = cohost_data;
            await updatedCoHost({
              coHost: cohost_data.coHost ? cohost_data.coHost : coHost.current, //attend
              coHostResponsibility: cohost_data.coHostResponsibilities
                ? cohost_data.coHostResponsibilities
                : coHostResponsibility.current, //attend
              youAreCoHost: youAreCoHost.current,
              updateCoHost,
              updateCoHostResponsibility,
              updateYouAreCoHost,
              showAlert,
              eventType: eventType.current,
              islevel: islevel.current,
              member: member.current,
            });
          }
        );

        socketDefault.on(
          "participantRequested",
          async ({ userRequest }: { userRequest: Request }) => {
            await participantRequested({
              userRequest,
              requestList: requestList.current,
              waitingRoomList: waitingRoomList.current,
              updateTotalReqWait,
              updateRequestList,
            });
          }
        );

        socketDefault.on(
          "screenProducerId",
          async ({ producerId }: { producerId: string }) => {
            screenProducerId({
              producerId,
              screenId: screenId.current,
              membersReceived: membersReceived.current,
              shareScreenStarted: shareScreenStarted.current,
              deferScreenReceived: deferScreenReceived.current,
              participants: participants.current,
              updateScreenId,
              updateShareScreenStarted,
              updateDeferScreenReceived,
            });
          }
        );

        socketDefault.on(
          "updateMediaSettings",
          async ({ settings }: { settings: Settings }) => {
            updateMediaSettings({
              settings,
              updateAudioSetting,
              updateVideoSetting,
              updateScreenshareSetting,
              updateChatSetting,
            });
          }
        );

        socketDefault.on(
          "producer-media-paused",
          async ({
            producerId,
            kind,
            name,
          }: {
            producerId: string;
            kind: "audio";
            name: string;
          }) => {
            await producerMediaPaused({
              producerId,
              kind,
              name,
              parameters: { ...getAllParams(), ...mediaSFUFunctions() },
            });
          }
        );

        socketDefault.on(
          "producer-media-resumed",
          async ({ kind, name }: { kind: "audio"; name: string }) => {
            await producerMediaResumed({
              kind,
              name,
              parameters: { ...getAllParams(), ...mediaSFUFunctions() },
            });
          }
        );

        socketDefault.on(
          "producer-media-closed",
          async ({
            producerId,
            kind,
          }: {
            producerId: string;
            kind: "video" | "audio" | "screenshare" | "screen";
          }) => {
            if (producerId && kind) {
              await producerMediaClosed({
                producerId,
                kind,
                parameters: { ...getAllParams(), ...mediaSFUFunctions() },
              });
            }
          }
        );

        socketDefault.on(
          "controlMediaHost",
          async ({
            type,
          }: {
            type: "video" | "audio" | "screenshare" | "chat" | "all";
          }) => {
            await controlMediaHost({
              type,
              parameters: { ...getAllParams(), ...mediaSFUFunctions() },
            });
          }
        );

        socketDefault.on("meetingEnded", async function () {
          await meetingEnded({
            showAlert,
            redirectURL: redirectURL.current,
            onWeb: true,
            eventType: eventType.current,
            updateValidated,
          });

          if (videoAlreadyOn.current) {
            await clickVideo({
              parameters: {
                ...getAllParams(),
                ...mediaSFUFunctions(),
              },
            });
          }
          if (audioAlreadyOn.current) {
            await clickAudio({
              parameters: {
                ...getAllParams(),
                ...mediaSFUFunctions(),
              },
            });
          }

          await closeAndReset();
        });

        socketDefault.on("disconnectUserSelf", async function () {
          await disconnectUserSelf({
            socket: socketDefault,
            member: member.current,
            roomName: roomName.current,
          });
        });

        socketDefault.on(
          "receiveMessage",
          async ({ message }: { message: Message }) => {
            await receiveMessage({
              message,
              messages: messages.current,
              participantsAll: participants.current,
              member: member.current,
              eventType: eventType.current,
              islevel: islevel.current,
              coHost: coHost.current,
              updateMessages,
              updateShowMessagesBadge,
            });
          }
        );

        socketDefault.on(
          "meetingTimeRemaining",
          async ({ timeRemaining }: { timeRemaining: number }) => {
            await meetingTimeRemaining({
              timeRemaining,
              showAlert,
              eventType: eventType.current,
            });
          }
        );

        socketDefault.on("meetingStillThere", async () => {
          await meetingStillThere({
            updateIsConfirmHereModalVisible,
          });
        });

        socketDefault.on(
          "updateConsumingDomains",
          async ({ domains, alt_domains }: UpdateConsumingDomainsData) => {
            await updateConsumingDomains({
              domains,
              alt_domains,
              apiUserName,
              apiKey: "", //not recommended - use token instead. Use for testing/development only
              apiToken: token,
              parameters: { ...getAllParams(), ...mediaSFUFunctions() },
            });
          }
        );

        socketDefault.on(
          "hostRequestResponse",
          ({ requestResponse }: HostRequestResponseData) => {
            hostRequestResponse({
              requestResponse,
              showAlert,
              requestList: requestList.current,
              updateRequestList,
              updateMicAction,
              updateVideoAction,
              updateScreenAction,
              updateChatAction,
              updateAudioRequestState,
              updateVideoRequestState,
              updateScreenRequestState,
              updateChatRequestState,
              updateAudioRequestTime,
              updateVideoRequestTime,
              updateScreenRequestTime,
              updateChatRequestTime,
              updateRequestIntervalSeconds:
                updateRequestIntervalSeconds.current,
            });
          }
        );

        socketDefault.on("pollUpdated", async (data: PollUpdatedData) => {
          try {
            await pollUpdated({
              data,
              polls: polls.current,
              poll: poll.current!,
              member: member.current,
              islevel: islevel.current,
              showAlert,
              updatePolls,
              updatePoll,
              updateIsPollModalVisible,
            });
          } catch {
            // Handle error
          }
        });

        socketDefault.on(
          "breakoutRoomUpdated",
          async (data: BreakoutRoomUpdatedData) => {
            try {
              await breakoutRoomUpdated({
                data,
                parameters: {
                  ...getAllParams(),
                  ...mediaSFUFunctions(),
                },
              });
            } catch {
              //console.log('error breakoutRoomUpdated', error);
            }
          }
        );
      }

      if (skipSockets) {
        // try remove all listeners related to recoding on  socketDefault and socketAlt
        const events = [
          "roomRecordParams",
          "startRecords",
          "reInitiateRecording",
          "RecordingNotice",
          "timeLeftRecording",
          "stoppedRecording",
        ];
        events.forEach((event) => {
          socketDefault.off(event);
          socketAlt.off(event);
        });
      }

      socketAlt.on(
        "roomRecordParams",
        async ({ recordParams }: { recordParams: RecordParams }) => {
          await roomRecordParams({
            recordParams,
            parameters: { ...getAllParams(), ...mediaSFUFunctions() },
          });
        }
      );

      socketAlt.on("startRecords", async () => {
        await startRecords({
          roomName: roomName.current,
          member: member.current,
          socket: socketAlt,
        });
      });

      socketAlt.on("reInitiateRecording", async () => {
        await reInitiateRecording({
          roomName: roomName.current,
          member: member.current,
          socket: socketAlt,
          adminRestrictSetting: adminRestrictSetting.current,
        });
      });

      socketAlt.on(
        "RecordingNotice",
        async ({ state, userRecordingParam, pauseCount, timeDone }) => {
          await recordingNotice({
            state,
            userRecordingParam,
            pauseCount,
            timeDone,
            parameters: {
              ...getAllParams(),
              ...mediaSFUFunctions(),
            },
          });
        }
      );

      socketAlt.on(
        "timeLeftRecording",
        async ({ timeLeft }: { timeLeft: number }) => {
          timeLeftRecording({
            timeLeft,
            showAlert,
          });
        }
      );

      socketAlt.on(
        "stoppedRecording",
        async ({ state, reason }: { state: string; reason: string }) => {
          await stoppedRecording({
            state,
            reason,
            showAlert,
          });
        }
      );

      if (localLink !== "" && socketDefault && !skipSockets) {
        await join_Room({
          socket: socketDefault,
          roomName: roomName.current,
          islevel: islevel.current,
          member: member.current,
          sec: token,
          apiUserName: apiUserName,
          isLocal: true,
        });
      }

      // there might be change in localSoscket for Community Edition
      let localChanged = false;
      localChanged =
        localSocket.current && localSocket.current.id != socketAlt.id
          ? true
          : false;

      if (!skipSockets && localChanged) {
        // call the connect socket method again
        await connect_Socket(apiUserName, token, true); // skipSocket = true
        await sleep({ ms: 1000 });
        updateIsLoadingModalVisible(false);
        return socketDefault;
      } else {
        if (link.current !== "" && link.current!.includes("mediasfu.com")) {
          // token might be different for local room
          const token = apiToken.current;
          await join_Room({
            socket:
              connectMediaSFU && socketAlt && socketAlt.id
                ? socketAlt
                : socketDefault,
            roomName: roomName.current,
            islevel: islevel.current,
            member: member.current,
            sec: token,
            apiUserName: apiUserName,
          });
        }

        await receiveRoomMessages({
          socket: socketDefault,
          roomName: roomName.current,
          updateMessages,
        });

        if (!skipSockets) {
          await prepopulateUserMedia({
            name: hostLabel.current,
            parameters: { ...getAllParams(), ...mediaSFUFunctions() },
          });
        }

        return socketDefault;
      }
    } else {
      return null;
    }
  }

  useEffect(() => {
    //update allVideoStreams
    updateAllVideoStreams([
      { producerId: "youyou", stream: undefined, id: "youyou", name: "youyou" },
    ]);

    //update StreamNames
    updateStreamNames([{ id: "youyou", name: "youyou", producerId: "" }]);

    //if socket is connected, join the room
    const connectAndAddSocketMethods = async () => {
      const _socket = await connect_Socket(
        apiUserName.current,
        apiToken.current
      );
      updateSocket(_socket!);
    };

    if (validated) {
      try {
        if (localUIMode.current === false) {
          updateIsLoadingModalVisible(true);
          connectAndAddSocketMethods();
        } else {
          updateIsLoadingModalVisible(false);
        }
      } catch (error) {
        console.log("error connectAndaAddSocketMethods", error);
      }

      startMeetingProgressTimer({
        startTime: Date.now() / 1000,
        parameters: { ...getAllParams(), ...mediaSFUFunctions() },
      });
      
      try {
        if (sourceParameters !== null) {
          sourceParameters = {
            ...getAllParams(),
            ...mediaSFUFunctions(),
          };
          if (updateSourceParameters){
            updateSourceParameters(sourceParameters);
          }
        }
      } catch {
        console.log("error updateSourceParameters");
      }
  
    }
  }, [validated]);

  return (
    <div
      className="MediaSFU"
      style={{
        height: "100vh",
        width: "100vw",
        maxWidth: "100vw",
        maxHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {!validated ? (
        <PrejoinPage
          parameters={{
            imgSrc,
            showAlert,
            updateIsLoadingModalVisible,
            connectSocket,
            connectLocalSocket,
            updateSocket,
            updateLocalSocket,
            updateValidated,
            updateApiUserName,
            updateApiToken,
            updateLink,
            updateRoomName,
            updateMember,
          }}
          credentials={credentials}
          localLink={localLink}
          connectMediaSFU={connectMediaSFU}
          returnUI={returnUI}
          noUIPreJoinOptions={noUIPreJoinOptions}
          joinMediaSFURoom={joinMediaSFURoom}
          createMediaSFURoom={createMediaSFURoom}
        />
      ) : returnUI ? (
        <MainContainerComponent>
          {/* Main aspect component containsa ll but the control buttons (as used for webinar and conference) */}
          <MainAspectComponent
            backgroundColor="rgba(217, 227, 234, 0.99)"
            defaultFraction={1 - controlHeight}
            updateIsWideScreen={updateIsWideScreen}
            updateIsMediumScreen={updateIsMediumScreen}
            updateIsSmallScreen={updateIsSmallScreen}
            showControls={
              eventType.current == "webinar" ||
              eventType.current == "conference"
            }
          >
            {/* MainScreenComponent contains the main grid view and the minor grid view */}
            <MainScreenComponent
              doStack={true}
              mainSize={mainHeightWidth}
              updateComponentSizes={updateComponentSizes}
              defaultFraction={1 - controlHeight}
              componentSizes={componentSizes.current}
              showControls={
                eventType.current == "webinar" ||
                eventType.current == "conference"
              }
            >
              {/* MainGridComponent shows the main grid view - not used at all in chat event type  and conference event type when screenshare is not active*/}
              {/* MainGridComponent becomes the dominant grid view in broadcast and webinar event types */}
              {/* MainGridComponent becomes the dominant grid view in conference event type when screenshare is active */}

              <MainGridComponent
                height={componentSizes.current.mainHeight}
                width={componentSizes.current.mainWidth}
                backgroundColor="rgba(217, 227, 234, 0.99)"
                mainSize={mainHeightWidth}
                showAspect={mainHeightWidth > 0 ? true : false}
                timeBackgroundColor={recordState}
                meetingProgressTime={meetingProgressTime}
              >
                <FlexibleVideo
                  customWidth={componentSizes.current.mainWidth}
                  customHeight={componentSizes.current.mainHeight}
                  rows={1}
                  columns={1}
                  componentsToRender={
                    mainGridStream.current ? mainGridStream.current : []
                  }
                  showAspect={
                    mainGridStream.current.length > 0 &&
                    !(whiteboardStarted.current && !whiteboardEnded.current)
                  }
                  localStreamScreen={localStreamScreen.current!}
                  annotateScreenStream={annotateScreenStream.current}
                  Screenboard={
                    shared.current && (
                      <Screenboard
                        customWidth={componentSizes.current.mainWidth}
                        customHeight={componentSizes.current.mainHeight}
                        parameters={{
                          ...getAllParams(),
                          ...mediaSFUFunctions(),
                        }}
                        showAspect={shared.current}
                      />
                    )
                  }
                />

                <Whiteboard
                  customWidth={componentSizes.current.mainWidth}
                  customHeight={componentSizes.current.mainHeight}
                  parameters={{
                    ...getAllParams(),
                    ...mediaSFUFunctions(),
                  }}
                  showAspect={
                    whiteboardStarted.current && !whiteboardEnded.current
                  }
                />

                <ControlButtonsComponentTouch
                  buttons={controlBroadcastButtons}
                  position={"right"}
                  location={"bottom"}
                  direction={"vertical"}
                  showAspect={eventType.current == "broadcast"}
                />

                {/* Button to launch recording modal */}
                <ControlButtonsComponentTouch
                  buttons={recordButton}
                  direction={"horizontal"}
                  showAspect={
                    eventType.current == "broadcast" &&
                    !showRecordButtons &&
                    islevel.current == "2"
                  }
                  location="bottom"
                  position="middle"
                />

                {/* Buttons to control recording */}
                <ControlButtonsComponentTouch
                  buttons={recordButtons}
                  direction={"horizontal"}
                  showAspect={
                    eventType.current == "broadcast" &&
                    showRecordButtons &&
                    islevel.current == "2"
                  }
                  location="bottom"
                  position="middle"
                />
              </MainGridComponent>

              {/* OthergridComponent shows the minor grid view - not used at all in broadcast event type */}
              {/* OthergridComponent becomes the dominant grid view in conference (the main grid only gets re-introduced during screenshare) and chat event types */}
              <OtherGridComponent
                height={componentSizes.current.otherHeight}
                width={componentSizes.current.otherWidth}
                backgroundColor={"rgba(217, 227, 234, 0.99)"}
                showAspect={mainHeightWidth == 100 ? false : true}
                timeBackgroundColor={recordState}
                showTimer={mainHeightWidth == 0 ? true : false}
                meetingProgressTime={meetingProgressTime}
              >
                {/* Pagination is only used in conference and webinar event types */}
                <div
                  style={{
                    width:
                      paginationDirection.current === "horizontal"
                        ? componentSizes.current.otherWidth
                        : paginationHeightWidth.current,
                    height:
                      paginationDirection.current === "horizontal"
                        ? paginationHeightWidth.current
                        : componentSizes.current.otherHeight,
                    padding: 0,
                    margin: 0,
                    display: doPaginate.current ? "flex" : "none",
                    flexDirection:
                      paginationDirection.current === "horizontal"
                        ? "row"
                        : "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* Render Pagination component */}
                  <Pagination
                    totalPages={numberPages}
                    currentUserPage={currentUserPage.current}
                    showAspect={doPaginate.current}
                    paginationHeight={paginationHeightWidth.current}
                    direction={paginationDirection.current!}
                    parameters={{ ...getAllParams(), ...mediaSFUFunctions() }}
                  />
                </div>

                {/* AudioGrid contains all the audio only streams */}
                {/* If broadcasting and there are audio only streams (just one), the audio only streams are displayed in the main grid view */}
                {/* If webinar and you are the host, the audio only streams (just one), are displayed in the main grid view */}
                <AudioGrid
                  componentsToRender={
                    audioOnlyStreams.current ? audioOnlyStreams.current : []
                  }
                />

                <ControlButtonsComponentTouch
                  buttons={controlChatButtons}
                  position={"right"}
                  location={"bottom"}
                  direction={"vertical"}
                  showAspect={eventType.current == "chat"}
                />

                <FlexibleGrid
                  customWidth={gridSizes.current.gridWidth!}
                  customHeight={gridSizes.current.gridHeight!}
                  rows={gridRows}
                  columns={gridCols}
                  componentsToRender={otherGridStreams[0]}
                  backgroundColor={"rgba(217, 227, 234, 0.99)"}
                />

                <FlexibleGrid
                  customWidth={gridSizes.current.altGridWidth!}
                  customHeight={gridSizes.current.altGridHeight!}
                  rows={altGridRows}
                  columns={altGridCols}
                  componentsToRender={otherGridStreams[1]}
                  backgroundColor={"rgba(217, 227, 234, 0.99)"}
                />
              </OtherGridComponent>
            </MainScreenComponent>
          </MainAspectComponent>

          {/* SubAspectComponent is used for webinar and conference events only to display fixed control buttons */}
          <SubAspectComponent
            backgroundColor="rgba(217, 227, 234, 0.99)"
            showControls={
              eventType.current == "webinar" ||
              eventType.current == "conference"
            }
            defaultFractionSub={controlHeight}
          >
            <ControlButtonsComponent
              buttons={controlButtons}
              buttonColor="black" // Set the background color for buttons
              buttonBackgroundColor={{
                default: "transparent",
                pressed: "transparent",
              }} // Set background color options
              alignment="space-between"
              vertical // Set to true for vertical layout
              buttonsContainerStyle={{
                marginTop: 2,
                marginBottom: 2,
                backgroundColor: "transparent",
              }} // Set styles for the buttons container
            />
          </SubAspectComponent>
        </MainContainerComponent>
      ) : (
        <> </>
      )}

      {returnUI && (
        <>
          <MenuModal
            backgroundColor="rgba(181, 233, 229, 0.97)"
            isVisible={isMenuModalVisible}
            onClose={() => updateIsMenuModalVisible(false)}
            customButtons={customMenuButtons}
            roomName={roomName.current}
            adminPasscode={adminPasscode.current}
            islevel={islevel.current}
            eventType={eventType.current}
            localLink={localLink}
          />

          <EventSettingsModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isEventSettingsModalVisible={isSettingsModalVisible}
            updateIsSettingsModalVisible={updateIsSettingsModalVisible}
            onEventSettingsClose={() => updateIsSettingsModalVisible(false)}
            audioSetting={audioSetting.current}
            videoSetting={videoSetting.current}
            screenshareSetting={screenshareSetting.current}
            chatSetting={chatSetting.current}
            updateAudioSetting={updateAudioSetting}
            updateVideoSetting={updateVideoSetting}
            updateScreenshareSetting={updateScreenshareSetting}
            updateChatSetting={updateChatSetting}
            roomName={roomName.current}
            socket={socket.current}
          />

          <RequestsModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isRequestsModalVisible={isRequestsModalVisible}
            onRequestClose={() => updateIsRequestsModalVisible(false)}
            requestCounter={requestCounter.current}
            onRequestFilterChange={onRequestFilterChange}
            updateRequestList={updateRequestList}
            requestList={filteredRequestList.current}
            roomName={roomName.current}
            socket={socket.current}
            parameters={{
              updateRequestCounter: updateRequestCounter,
              updateRequestFilter: updateRequestFilter,
              updateRequestList: updateRequestList,
              getUpdatedAllParams,
            }}
          />

          <WaitingRoomModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isWaitingModalVisible={isWaitingModalVisible}
            onWaitingRoomClose={() => updateIsWaitingModalVisible(false)}
            waitingRoomCounter={waitingRoomCounter.current}
            onWaitingRoomFilterChange={onWaitingRoomFilterChange}
            waitingRoomList={filteredWaitingRoomList.current}
            updateWaitingList={updateWaitingRoomList}
            roomName={roomName.current}
            socket={socket.current}
            parameters={{
              filteredWaitingRoomList: filteredWaitingRoomList.current,
              getUpdatedAllParams,
            }}
          />

          <CoHostModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isCoHostModalVisible={isCoHostModalVisible}
            updateIsCoHostModalVisible={updateIsCoHostModalVisible}
            onCoHostClose={() => updateIsCoHostModalVisible(false)}
            coHostResponsibility={coHostResponsibility.current}
            participants={participants.current}
            currentCohost={coHost.current}
            roomName={roomName.current}
            showAlert={showAlert}
            updateCoHostResponsibility={updateCoHostResponsibility}
            updateCoHost={updateCoHost}
            socket={socket.current}
          />

          <MediaSettingsModal
            backgroundColor="rgba(181, 233, 229, 0.97)"
            isMediaSettingsModalVisible={isMediaSettingsModalVisible}
            onMediaSettingsClose={() =>
              updateIsMediaSettingsModalVisible(false)
            }
            parameters={{
              ...getAllParams(),
              ...mediaSFUFunctions(),
            }}
          />

          <ParticipantsModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isParticipantsModalVisible={isParticipantsModalVisible}
            onParticipantsClose={() => updateIsParticipantsModalVisible(false)}
            participantsCounter={participantsCounter.current}
            onParticipantsFilterChange={onParticipantsFilterChange}
            parameters={{
              updateParticipants: updateParticipants,
              updateIsParticipantsModalVisible:
                updateIsParticipantsModalVisible,

              updateDirectMessageDetails,
              updateStartDirectMessage,
              updateIsMessagesModalVisible,

              showAlert: showAlert,

              filteredParticipants: filteredParticipants.current,
              participants: filteredParticipants.current,
              roomName: roomName.current,
              islevel: islevel.current,
              member: member.current,
              coHostResponsibility: coHostResponsibility.current,
              coHost: coHost.current,
              eventType: eventType.current,

              startDirectMessage: startDirectMessage.current,
              directMessageDetails: directMessageDetails.current,
              socket: socket.current,

              getUpdatedAllParams: getAllParams,
            }}
          />

          <DisplaySettingsModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isDisplaySettingsModalVisible={isDisplaySettingsModalVisible}
            onDisplaySettingsClose={() =>
              updateIsDisplaySettingsModalVisible(false)
            }
            parameters={{
              ...getAllParams(),
              ...mediaSFUFunctions(),
            }}
          />

          <RecordingModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isRecordingModalVisible={isRecordingModalVisible}
            onClose={() => updateIsRecordingModalVisible(false)}
            startRecording={startRecording}
            confirmRecording={confirmRecording}
            parameters={{
              ...getAllParams(),
              ...mediaSFUFunctions(),
            }}
          />

          <MessagesModal
            backgroundColor={
              eventType.current == "webinar" ||
              eventType.current == "conference"
                ? "#f5f5f5"
                : "rgba(255, 255, 255, 0.25)"
            }
            isMessagesModalVisible={isMessagesModalVisible}
            onMessagesClose={() => updateIsMessagesModalVisible(false)}
            messages={messages.current}
            eventType={eventType.current}
            member={member.current}
            islevel={islevel.current}
            coHostResponsibility={coHostResponsibility.current}
            coHost={coHost.current}
            startDirectMessage={startDirectMessage.current}
            directMessageDetails={directMessageDetails.current}
            updateStartDirectMessage={updateStartDirectMessage}
            updateDirectMessageDetails={updateDirectMessageDetails}
            showAlert={showAlert}
            roomName={roomName.current}
            socket={socket.current}
            chatSetting={chatSetting.current}
          />

          <ConfirmExitModal
            backgroundColor="rgba(181, 233, 229, 0.97)"
            isConfirmExitModalVisible={isConfirmExitModalVisible}
            onConfirmExitClose={() => updateIsConfirmExitModalVisible(false)}
            member={member.current}
            roomName={roomName.current}
            socket={socket.current}
            islevel={islevel.current}
          />

          <ConfirmHereModal
            backgroundColor="rgba(181, 233, 229, 0.97)"
            isConfirmHereModalVisible={isConfirmHereModalVisible}
            onConfirmHereClose={() => updateIsConfirmHereModalVisible(false)}
            member={member.current}
            roomName={roomName.current}
            socket={socket.current}
          />

          <ShareEventModal
            isShareEventModalVisible={isShareEventModalVisible}
            onShareEventClose={() => updateIsShareEventModalVisible(false)}
            roomName={roomName.current}
            islevel={islevel.current}
            adminPasscode={adminPasscode.current}
            eventType={eventType.current}
            localLink={localLink}
          />

          <PollModal
            isPollModalVisible={isPollModalVisible}
            onClose={() => setIsPollModalVisible(false)}
            member={member.current}
            islevel={islevel.current}
            polls={polls.current}
            poll={poll.current}
            socket={socket.current}
            roomName={roomName.current}
            showAlert={showAlert}
            updateIsPollModalVisible={setIsPollModalVisible}
            handleCreatePoll={handleCreatePoll}
            handleEndPoll={handleEndPoll}
            handleVotePoll={handleVotePoll}
          />

          <BackgroundModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isVisible={isBackgroundModalVisible}
            onClose={() => updateIsBackgroundModalVisible(false)}
            parameters={{
              ...getAllParams(),
              ...mediaSFUFunctions(),
            }}
          />

          <BreakoutRoomsModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isVisible={isBreakoutRoomsModalVisible}
            onBreakoutRoomsClose={() =>
              updateIsBreakoutRoomsModalVisible(false)
            }
            parameters={{
              ...getAllParams(),
              ...mediaSFUFunctions(),
            }}
          />

          <ConfigureWhiteboardModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isVisible={isConfigureWhiteboardModalVisible}
            onConfigureWhiteboardClose={() =>
              updateIsConfigureWhiteboardModalVisible(false)
            }
            parameters={{
              ...getAllParams(),
              ...mediaSFUFunctions(),
            }}
          />

          <ScreenboardModal
            backgroundColor="rgba(217, 227, 234, 0.99)"
            isVisible={isScreenboardModalVisible}
            onClose={() => updateIsScreenboardModalVisible(false)}
            parameters={{
              ...getAllParams(),
              ...mediaSFUFunctions(),
            }}
          />

          <AlertComponent
            visible={alertVisible}
            message={alertMessage}
            type={alertType}
            duration={alertDuration}
            onHide={() => setAlertVisible(false)}
            textColor={"#ffffff"}
          />

          <LoadingModal
            isVisible={isLoadingModalVisible}
            backgroundColor="rgba(217, 227, 234, 0.99)"
            displayColor="black"
          />
        </>
      )}
    </div>
  );
};

export default MediasfuGenericAlt;