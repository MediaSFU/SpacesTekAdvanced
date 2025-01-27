import React, { useRef } from "react";
import {
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
  MediasfuGeneric,
  PreJoinPage,
} from "mediasfu-reactjs";
import MediasfuGenericAlt from "./custom/MediasfuGenericAlt";

export interface MediaSFUHandlerProps {
  action: "create" | "join";
  duration?: number;
  capacity?: number;
  name: string;
  meetingID?: string; // Optional for create, required for join
  sourceParameters: Record<string, any>;
  updateSourceParameters: (params: Record<string, any>) => void;
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
  const localLink = useRef<string | undefined>("http://localhost:3000");
  const noUIOptions = useRef<
    CreateMediaSFURoomOptions | JoinMediaSFURoomOptions | undefined
  >(undefined);

  try {
    if (action === "create") {
      // Prepare parameters for creating a room
      noUIOptions.current = {
        action: "create",
        duration: duration || 15,
        capacity: capacity || 5,
        userName: name,
        eventType: "webinar",
      };
    } else if (action === "join") {
      if (!meetingID) {
        throw new Error("Meeting ID is required for joining a room.");
      }

      // Prepare parameters for joining a room
      noUIOptions.current = {
        action: "join",
        userName: name,
        meetingID,
      };
    } else {
      throw new Error('Invalid action. Must be either "create" or "join".');
    }
  } catch (error) {
    console.error("Error handling MediaSFU action:", error);
  }

  return (
   <div style={{ width: 0, height: 0, maxHeight: 0, maxWidth: 0, overflow: "hidden" }}>
    <MediasfuGenericAlt
      PrejoinPage={PreJoinPage}
      localLink={localLink.current}
      connectMediaSFU={false}
      returnUI={false}
      noUIPreJoinOptions={noUIOptions.current}
      sourceParameters={sourceParameters}
      updateSourceParameters={updateSourceParameters} 
    />
    </div>
  );
};

export default MediaSFUHandler;
