import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import "./ParticipantCard.css"; // Import the participant-card styles

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
  const videoRef = React.useRef<HTMLVideoElement>(null);

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
