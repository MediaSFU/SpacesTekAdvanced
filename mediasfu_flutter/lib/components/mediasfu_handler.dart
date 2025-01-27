import 'package:flutter/material.dart';
import 'package:mediasfu_sdk/mediasfu_sdk.dart'
    hide MediasfuGeneric, MediasfuGenericOptions;
import 'custom/mediasfu_generic_alt.dart';

class MediaSFUHandlerOptions {
  final String action; // create, join
  final int? duration;
  final int? capacity;
  final String name;
  final String? meetingID;
  final MediasfuParameters? sourceParameters;
  final Function(MediasfuParameters? parameters) updateSourceParameters;

  MediaSFUHandlerOptions({
    required this.action,
    this.duration,
    this.capacity,
    required this.name,
    this.meetingID,
    this.sourceParameters,
    required this.updateSourceParameters,
  });
}

class MediaSFUHandler extends StatelessWidget {
  final MediaSFUHandlerOptions options;

  const MediaSFUHandler({super.key, required this.options});

  @override
  Widget build(BuildContext context) {
    late final dynamic noUIOptions;
    Credentials credentials = Credentials(
        apiUserName: 'dummyUsr',
        apiKey:
            '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

    try {
      if (options.action == "create") {
        // Prepare options for creating a room
        noUIOptions = CreateMediaSFURoomOptions(
          action: "create",
          duration: options.duration ?? 15,
          capacity: options.capacity ?? 5,
          userName: options.name,
          eventType: EventType.webinar,
        );
      } else if (options.action == "join") {
        if (options.meetingID == null) {
          throw Exception("Meeting ID is required for joining a room.");
        }

        // Prepare options for joining a room
        noUIOptions = JoinMediaSFURoomOptions(
          action: "join",
          userName: options.name,
          meetingID: options.meetingID!,
        );
      } else {
        throw Exception('Invalid action. Must be either "create" or "join".');
      }
    } catch (error) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error handling MediaSFU action: $error")),
        );
      });
    }

    if (noUIOptions == null) {
      return const SizedBox.shrink();
    }

    return SizedBox(
        width: 0,
        height: 0,
        child: MediasfuGeneric(
            options: MediasfuGenericOptions(
          credentials: credentials,
          connectMediaSFU: false,
          localLink: "http://localhost:3000",
          returnUI: false,
          noUIPreJoinOptionsCreate:
              options.action == "create" ? noUIOptions : null,
          noUIPreJoinOptionsJoin: options.action == "join" ? noUIOptions : null,
          sourceParameters: options.sourceParameters,
          updateSourceParameters: options.updateSourceParameters,
        )));
  }
}
