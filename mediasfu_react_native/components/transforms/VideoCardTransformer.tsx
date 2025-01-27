
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VideoCard } from 'mediasfu-reactnative';

type VideoCardTransformerProps = {
  children: React.ReactNode;
};

/**
 * Intercepts <VideoCard> children and applies "participant-card" styling or props,
 * similar to your React (web) version.
 *
 * Usage (React Native):
 *   <VideoCardTransformer>
 *     <VideoCard ... />
 *     <VideoCard ... />
 *   </VideoCardTransformer>
 */
const VideoCardTransformer: React.FC<VideoCardTransformerProps> = ({ children }) => {
  return (
    <>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          // Not a valid React element, return as-is
          return child;
        }

        // Check if child is actually a VideoCard
        if (child.type === VideoCard) {
          // Extract original props
          const originalProps = child.props;

          // Merge or override props
          const newProps = {
            ...originalProps,

            // Example: Merge or override customStyle for a circular video
            customStyle: [
              // In React Native, styles can be an array
              originalProps.customStyle || {},
              styles.participantCard, // Our "participant-card" style
            ],

            // Optionally override or add custom overlays
            // e.g., if child already has a videoInfoComponent, preserve or override
            videoInfoComponent: (
              <View style={styles.infoContainer}>
                {/*
                  If child had its own info, we can show it or replace it.
                  For instance, show a name or status:
                */}
                <Text style={styles.infoText}>
                  {originalProps.participant?.name || 'Unnamed'}
                </Text>
              </View>
            ),

            // Add or override controls
            videoControlsComponent: (
              <View style={styles.controlsContainer}>
                <Text style={styles.controlsText}>
                  {originalProps.participant?.muted ? '🔇' : '🎤'}
                </Text>
              </View>
            ),
          };

          // Return cloned element with our newProps

          return React.cloneElement(child, newProps);
          //return child;
        }

        // If it's not a VideoCard, return it untouched
        return child;
      })}
    </>
  );
};

const styles = StyleSheet.create({
  participantCard: {
    backgroundColor: '#fff',
    width: 140,
    height: 140,
    borderRadius: 50,
    borderWidth: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  avatar: {
    width: '65%',
    height: '65%',
    borderRadius: 50,
    backgroundColor: '#ccc',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: 'rgba(0,0,0,0.9)',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  controlsText: {
    color: '#fff',
    fontSize: 12,
  },
  micIcon: {
    position: 'absolute',
    top: 8,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 4,
    borderRadius: 12,
  },
});

export default VideoCardTransformer;
