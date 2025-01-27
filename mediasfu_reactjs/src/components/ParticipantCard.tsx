import { approveRequest, rejectRequest } from "api";
import { useEffect, useRef, useState } from "react";
import {
  FaMicrophoneSlash,
  FaMicrophone,
  FaCrown,
  FaCheck,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { ParticipantData, Space } from "types";

const ParticipantCard: React.FC<{
  participant: ParticipantData;
  currentUserId?: string;
  isHost: boolean;
  onMute: (id: string) => void;
  onToggleMic?: (participant: ParticipantData) => void;
  onRemove: (id: string) => void;
  space?: Space;
  video?: MediaStream;
}> = ({
  participant,
  isHost,
  onMute,
  currentUserId,
  onToggleMic,
  onRemove,
  space,
  video,
}) => {
  const [show, setShow] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const micIcon =
    participant.muted && participant.muted === true ? (
      <FaMicrophoneSlash className="icon-muted" />
    ) : (
      <FaMicrophone className="icon-active" />
    );

  const handleParticipantDoubleClick = () => {
    if (
      participant.role === "requested" &&
      isHost &&
      !space?.rejectedSpeakers.includes(participant.id)
    ) {
      setShow(!show);
    } else if (isHost && participant.role !== "host") {
      setShowRemove(!showRemove);
    }
  };

  useEffect(() => {
    if (videoRef.current && video && videoRef.current.srcObject !== video) {
      videoRef.current.srcObject = video;
    }
  }, [video]);

  return (
    <div
      className="participant-card"
      onDoubleClick={handleParticipantDoubleClick}
    >
      {participant.role === "host" && <FaCrown className="fa-crown" />}

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

      <div className="participant-name">{participant.displayName}</div>
      <div className={`participant-role ${participant.role}`}>
        {participant.role === "host" && "Host"}
        {participant.role === "speaker" && "Speaker"}
        {participant.role === "listener" && "Listener"}
        {participant.role === "requested" && "Requested"}
      </div>
      {participant.role !== "listener" && participant.id === currentUserId && (
        <div
          className="participant-audio-status"
          onClick={() => onToggleMic && onToggleMic(participant)}
        >
          {micIcon}
        </div>
      )}
      {show && (
        <div className="participant-request-actions">
          <button
            className="accept-btn"
            onClick={() => {
              approveRequest(space?.id!, participant.id, true);
              setShow(false);
            }}
            title="Approve as Speaker"
          >
            <FaCheck />
          </button>
          <button
            className="reject-btn"
            onClick={() => {
              rejectRequest(space?.id!, participant.id);
              setShow(false);
            }}
            title="Reject Request"
          >
            <FaTimes />
          </button>
        </div>
      )}
      {showRemove && (
        <button
          className="remove-btn"
          onClick={() => {
            onRemove(participant.id);
            setShowRemove(false);
          }}
          title="Remove Participant"
        >
          <FaTrash />
        </button>
      )}
      {isHost && participant.role !== "host" && !participant.muted && (
        <button
          className="mute-other-btn"
          onClick={() => onMute(participant.id)}
          title="Mute Participant"
        >
          <FaMicrophoneSlash />
        </button>
      )}
    </div>
  );
};

export default ParticipantCard;
