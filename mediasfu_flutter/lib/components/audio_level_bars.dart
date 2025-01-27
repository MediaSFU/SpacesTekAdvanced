import 'package:flutter/material.dart';

class AudioLevelBars extends StatefulWidget {
  final double audioLevel; // Expected range: 0 to 255

  const AudioLevelBars({super.key, required this.audioLevel});

  @override
  // ignore: library_private_types_in_public_api
  _AudioLevelBarsState createState() => _AudioLevelBarsState();
}

class _AudioLevelBarsState extends State<AudioLevelBars>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animatedLevel;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );

    _animatedLevel = Tween<double>(
      begin: 0,
      end: widget.audioLevel,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void didUpdateWidget(AudioLevelBars oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.audioLevel != widget.audioLevel) {
      _animatedLevel = Tween<double>(
        begin: _animatedLevel.value,
        end: widget.audioLevel,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ));

      _controller
        ..reset()
        ..forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animatedLevel,
      builder: (context, child) {
        // Normalize the audio level to determine the number of filled bars (0-10)
        final normalizedLevel =
            ((_animatedLevel.value - 127.5) / (275 - 127.5) * 10)
                .clamp(0, 10)
                .round();

        final List<bool> filledBars =
            List.generate(10, (index) => index < normalizedLevel);

        return SizedBox(
          width: 84.0, // 4rem
          height: 7.0, // 0.5rem
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(10, (index) {
              return Container(
                width: 6.4, // 10% of 64px
                height: 8.0,
                margin: const EdgeInsets.symmetric(horizontal: 1.0),
                decoration: BoxDecoration(
                  color: filledBars[index]
                      ? Color.lerp(Colors.red, Colors.green, index / 10)
                      : Colors.grey[300],
                  borderRadius: BorderRadius.circular(2.0),
                ),
              );
            }),
          ),
        );
      },
    );
  }
}
