import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

class VideoCardOptions {
  final String name;
  final MediaStream? videoStream;
  final bool? isMuted;
  final bool showControls;
  final bool showInfo;
  final BoxDecoration? customStyle;

  VideoCardOptions({
    required this.name,
    this.videoStream,
    this.isMuted,
    this.showControls = true,
    this.showInfo = true,
    this.customStyle,
  });
}

class VideoCard extends StatefulWidget {
  final VideoCardOptions options;

  const VideoCard({
    super.key,
    required this.options,
  });

  @override
  // ignore: library_private_types_in_public_api
  _VideoCardState createState() => _VideoCardState();
}

class _VideoCardState extends State<VideoCard> {
  RTCVideoRenderer? _videoRenderer;
  bool _rendererInitialized = false;

  @override
  void initState() {
    super.initState();
    if (widget.options.videoStream != null) {
      _initializeVideoRenderer();
    }
  }

  @override
  void didUpdateWidget(covariant VideoCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.options.videoStream != widget.options.videoStream) {
      _disposeVideoRenderer();
      if (widget.options.videoStream != null) {
        _initializeVideoRenderer();
      }
    }
  }

  Future<void> _initializeVideoRenderer() async {
    if (_videoRenderer == null) {
      _videoRenderer = RTCVideoRenderer();
      await _videoRenderer!.initialize();
    }
    _videoRenderer!.srcObject = widget.options.videoStream;
    setState(() {
      _rendererInitialized = true;
    });
  }

  void _disposeVideoRenderer() {
    if (_videoRenderer != null) {
      _videoRenderer!.srcObject = null;
      _videoRenderer!.dispose();
      _videoRenderer = null;
    }
    // No setState call needed if the widget is going away anyway.
    _rendererInitialized = false;
  }

  @override
  void dispose() {
    _disposeVideoRenderer();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final options = widget.options;

    return Container(
      decoration: options.customStyle ??
          BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(60), // Circle shape
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                offset: const Offset(0, 2),
                blurRadius: 8,
              ),
            ],
          ),
      width: 120,
      height: 120,
      clipBehavior: Clip.hardEdge,
      child: Stack(
        children: [
          // Video or Fallback
          ClipOval(
            child: _rendererInitialized
                ? RTCVideoView(
                    _videoRenderer!,
                    objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
                  )
                : Container(
                    color: Colors.grey[300],
                    child: Center(
                      child: Text(
                        options.name.isNotEmpty
                            ? options.name[0].toUpperCase()
                            : '',
                        style: const TextStyle(
                          fontSize: 24.0,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
          ),

          // Name Tag
          if (options.showInfo)
            Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  options.name,
                  style: const TextStyle(
                    fontSize: 12.0,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ),
            ),

          // Mic/Audio Status
          if (options.showControls)
            Align(
              alignment: Alignment.topLeft,
              child: Container(
                margin: const EdgeInsets.all(8),
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.6),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  options.isMuted == true ? Icons.mic_off : Icons.mic,
                  color: options.isMuted == true ? Colors.red : Colors.green,
                  size: 16,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
