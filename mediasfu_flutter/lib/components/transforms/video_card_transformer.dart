import 'package:flutter/material.dart';
import 'package:mediasfu_sdk/components/display_components/video_card.dart';

/// A wrapper widget that intercepts `VideoCard` children and applies
/// custom styling and properties — akin to the "participant-card" in SpacesTek.

class VideoCardTransformer extends StatelessWidget {
  final List<Widget> children;

  const VideoCardTransformer({
    super.key,
    required this.children,
  });

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

            /// Provide custom overlays without using Positioned
            videoInfoComponent: _buildInfoComponent(originalOptions),
            videoControlsComponent: _buildControlsComponent(originalOptions),

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
              borderRadius: BorderRadius.circular(30.0),
              // Box shadow similar to ParticipantCard
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
                if (originalOptions.participant.islevel == '2')
                  const BoxShadow(
                    color: Color.fromARGB(255, 255, 94, 7),
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

  /// Builds the info component (e.g., participant name)
  Widget _buildInfoComponent(VideoCardOptions originalOptions) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.3),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          originalOptions.participant.name,
          style: const TextStyle(
            fontSize: 12.0,
            fontWeight: FontWeight.bold,
            color: Colors.white,
            shadows: [
              Shadow(
                blurRadius: 3.0,
                color: Colors.black,
                offset: Offset(1, 1),
              ),
            ],
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  /// Builds the controls component (e.g., mic icon)
  Widget _buildControlsComponent(VideoCardOptions originalOptions) {
    final participant = originalOptions.participant;
    return Align(
      alignment: Alignment.topRight,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.3),
          shape: BoxShape.circle,
        ),
        padding: const EdgeInsets.all(6.0),
        child: Icon(
          participant.muted! ? Icons.mic_off : Icons.mic,
          color: participant.muted! ? Colors.red : Colors.green,
          size: 16,
        ),
      ),
    );
  }
}
