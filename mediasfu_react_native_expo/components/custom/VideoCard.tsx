import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { RTCView, MediaStream } from './webrtc/webrtc';
import { FontAwesome5 } from '@expo/vector-icons';

export interface VideoCardOptions {
  name: string;
  videoStream?: MediaStream;
  participant?: { id: string; name: string; muted: boolean };
  customStyle?: object;
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

  useEffect(() => {
    setIsMuted(participant?.muted || false);
  }, [participant?.muted]);


  return (
    <View style={[styles.cardContainer, customStyle]}>
      {/* Video Element */}
      {videoStream ? (
        <View style={styles.videoAvatarContainer}>
          {/* RTCView component for WebRTC video stream */}
          {Platform.OS === 'web' ? (
            <RTCView stream={videoStream} style={styles.videoAvatar} />
          ) : (
          <RTCView
            streamURL={videoStream.toURL()}
            style={styles.videoAvatar}
            objectFit="cover"
            mirror={false}
          />
          )}
        </View>
      ) : (
        <View style={styles.videoAvatarContainer}>
          <FontAwesome5 name="user-circle" size={60} color="#ccc" />
        </View>
      )}

      {/* Name Tag */}
      {showInfo && <Text style={styles.participantName}>{name}</Text>}

      {/* Audio Status Icon */}
      {showControls && (
        <Pressable style={styles.audioStatus} >
          <FontAwesome5
            name={isMuted ? 'microphone-slash' : 'microphone'}
            size={16}
            color={isMuted ? 'red' : 'green'}
          />
        </Pressable>
      )}
    </View>
  );
};

export default VideoCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    width: 120,
    height: 120,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    // margin: 8,
  },
  videoAvatarContainer: {
    width: '65%',
    height: '65%',
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  videoAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  participantName: {
    position: 'absolute',
    bottom: 8,
    fontWeight: '500',
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
  },
  audioStatus: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 6,
    borderRadius: 12,
  },
});
