import React from "react";
import { VideoCard } from "mediasfu-reactjs";

/**
 * Intercepts <VideoCard> children and applies participant-card styling.
 * 
 * Usage:
 *   <VideoCardTransformer>
 *     <VideoCard ... />
 *   </VideoCardTransformer>
 */
export function VideoCardTransformer({ children }: { children: React.ReactNode }) {
  return (
    <>
      {React.Children.map(children, (child) => {
        // Make sure it's a valid React element
        if (!React.isValidElement(child)) return child;

        // Check if the child is actually a VideoCard
        if (child.type === VideoCard) {
          // Extract original props
          const originalProps = child.props;

          // Merge or override the original props
          const newProps = {
            ...originalProps,
            
            // Add or override className so we can use .participant-card CSS
            className: "participant-card",

            // Add or override custom styles for rounded video card
            customStyle: {
              ...(originalProps.customStyle || {}),
              width: "120px",
              height: "120px",
              borderRadius: "50%", // Makes the video rounded
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },

            // Add custom overlays (if not already handled by VideoCard)
            videoControlsComponent: (
              <div className="participant-audio-status">
                {/* Example: Mic Icon */}
                {originalProps.participant?.muted ? (
                  <span className="icon-muted">🔇</span>
                ) : (
                  <span className="icon-active">🎤</span>
                )}
              </div>
            ),
            videoInfoComponent: (
              <div className="participant-name">
                {originalProps.participant?.name || "Unnamed"}
              </div>
            ),
          };

          // Create a cloned element with our newProps
        return React.cloneElement(child, newProps);
        }

        // If it's not a VideoCard, return it untouched
        return child;
      })}
    </>
  );
}
