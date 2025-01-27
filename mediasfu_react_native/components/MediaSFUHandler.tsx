/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import {
  createRoomOnMediaSFU,
  joinRoomOnMediaSFU,
  PreJoinPageOptions,
  CreateMediaSFURoomOptions,
  JoinMediaSFURoomOptions,
  Credentials,
  MediasfuGeneric,
  PreJoinPage,
} from 'mediasfu-reactnative';
import MediasfuGenericAlt from './custom/MediasfuGenericAlt';

export interface MediaSFUHandlerProps {
  action: 'create' | 'join';
  duration?: number;
  capacity?: number;
  name: string;
  meetingID?: string; // Optional for create, required for join
  sourceParameters: Record<string, any>;
  updateSourceParameters: (params: Record<string, any>) => void;
}

/**
 * MediaSFUHandler Component
 *
 * This component takes inputs for `action`, `duration`, `capacity`, `name`, `sourceParameters`, and `updateSourceParameters`,
 * updates `sourceParameters` using `updateSourceParameters`, and performs the
 * necessary action (create or join) using MediaSFU methods.
 * It renders the `MediasfuGenericAlt` component with 0 width and height.
 *
 * @param {MediaSFUHandlerProps} props - The component props.
 */
const MediaSFUHandler: React.FC<MediaSFUHandlerProps> = ({
  action,
  duration,
  capacity,
  name,
  meetingID,
  sourceParameters,
  updateSourceParameters,
}) => {
  const noUIOptions = useRef<CreateMediaSFURoomOptions | JoinMediaSFURoomOptions | undefined>(undefined);
  const localLink = useRef<string | undefined>('http://10.0.0.125:3000'); // Adjust as needed

  useEffect(() => {
    try {
      if (action === 'create') {
        // Prepare parameters for creating a room
        noUIOptions.current = {
          action: 'create',
          duration: duration || 15,
          capacity: capacity || 5,
          userName: name,
          eventType: 'conference',
        };
      } else if (action === 'join') {
        if (!meetingID) {
          throw new Error('Meeting ID is required for joining a room.');
        }

        // Prepare parameters for joining a room
        noUIOptions.current = {
          action: 'join',
          userName: name,
          meetingID,
        };
      } else {
        throw new Error('Invalid action. Must be either "create" or "join".');
      }
    } catch (error) {
      Alert.alert('Error', `Error handling MediaSFU action: ${(error as Error).message}`);
      console.error('MediaSFUHandler Error:', error);
    }
  }, [action, duration, capacity, name, meetingID]);

  if (!noUIOptions.current) {
    return null;
  }

  return (
    <View style={styles.hiddenContainer}>
      <MediasfuGenericAlt
        PrejoinPage={PreJoinPage}
        sourceParameters={sourceParameters}
        updateSourceParameters={updateSourceParameters}
        returnUI={false}
        noUIPreJoinOptions={noUIOptions.current}
        localLink={localLink.current}
        connectMediaSFU={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hiddenContainer: {
    width: 0,
    height: 0,
    maxHeight: 0,
    maxWidth: 0,
    overflow: 'hidden',
  },
});

export default MediaSFUHandler;
