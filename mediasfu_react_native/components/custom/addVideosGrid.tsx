import {AudioCard, MiniCard} from 'mediasfu-reactnative';
import VideoCard from './VideoCard';
// import { RTCView } from "../methods/utils/webrtc/webrtc";

import {
  Participant,
  Stream,
  UpdateMiniCardsGridType,
  UpdateMiniCardsGridParameters,
  AudioCardParameters,
  EventType,
  MediaStream as MediaStreamType,
} from 'mediasfu-reactnative';

export interface AddVideosGridParameters
  extends UpdateMiniCardsGridParameters,
    AudioCardParameters {
  eventType: EventType;
  updateAddAltGrid: (addAltGrid: boolean) => void;
  ref_participants: Participant[];
  islevel: string;
  videoAlreadyOn: boolean;
  localStreamVideo: MediaStreamType | null;
  keepBackground: boolean;
  virtualStream: MediaStreamType | null;
  forceFullDisplay: boolean;
  otherGridStreams: JSX.Element[][];
  updateOtherGridStreams: (otherGridStreams: JSX.Element[][]) => void;

  // mediasfu functions
  updateMiniCardsGrid: UpdateMiniCardsGridType;
  getUpdatedAllParams: () => AddVideosGridParameters;
  [key: string]: any;
}

export interface AddVideosGridOptions {
  mainGridStreams: (Stream | Participant)[];
  altGridStreams: (Stream | Participant)[];
  numtoadd: number;
  numRows: number;
  numCols: number;
  actualRows: number;
  lastrowcols: number;
  removeAltGrid: boolean;
  parameters: AddVideosGridParameters;
}

// Export the type definition for the function
export type AddVideosGridType = (
  options: AddVideosGridOptions,
) => Promise<void>;

/**
 * Adds participants to the main and alternate video grids based on the provided parameters.
 *
 * @function
 * @async
 * @param {AddVideosGridOptions} options - The options for adding videos to the grid.
 * @param {Array} options.mainGridStreams - The main grid streams containing participant or stream data.
 * @param {Array} options.altGridStreams - The alternate grid streams containing participant or stream data.
 * @param {number} options.numtoadd - The number of participants to add to the grid.
 * @param {number} options.numRows - The number of rows in the grid layout.
 * @param {number} options.numCols - The number of columns in the grid layout.
 * @param {number} options.actualRows - The actual number of rows currently filled in the grid.
 * @param {number} options.lastrowcols - The number of columns in the last row of the grid.
 * @param {boolean} options.removeAltGrid - Flag indicating whether to remove the alternate grid.
 * @param {AddVideosGridParameters} options.parameters - Additional parameters required for the function.
 * @param {string} options.parameters.eventType - The type of event (e.g., meeting, conference).
 * @param {Function} options.parameters.updateAddAltGrid - Callback to update the status of the alternate grid.
 * @param {Array} options.parameters.ref_participants - A reference list of participants.
 * @param {string} options.parameters.islevel - The participation level of the user.
 * @param {boolean} options.parameters.videoAlreadyOn - Indicates if video streaming is already active.
 * @param {MediaStream} options.parameters.localStreamVideo - The user's local video stream.
 * @param {boolean} options.parameters.keepBackground - Flag to determine if the background should be retained.
 * @param {MediaStream} options.parameters.virtualStream - The virtual stream to use.
 * @param {boolean} options.parameters.forceFullDisplay - Flag to enforce full display mode.
 * @param {Array} options.parameters.otherGridStreams - Additional streams for the grid.
 * @param {Function} options.parameters.updateOtherGridStreams - Callback to update other grid streams.
 * @param {Function} options.parameters.updateMiniCardsGrid - Callback to update the mini card display.
 * @param {Function} options.parameters.getUpdatedAllParams - Function to retrieve updated parameters.
 * @returns {Promise<void>} A promise that resolves when the grid has been updated successfully.
 *
 * @example
 * import { addVideosGrid } from 'mediasfu-reactnative';
 *
 * const options = {
 *   mainGridStreams: mainGridStreams,
 *   altGridStreams: altGridStreams,
 *   numtoadd: numtoadd,
 *   numRows: numRows,
 *   numCols: numCols,
 *   actualRows: actualRows,
 *   lastrowcols: lastrowcols,
 *   removeAltGrid: removeAltGrid,
 *   parameters: {
 *     eventType: eventType,
 *     updateAddAltGrid: updateAddAltGrid,
 *     ref_participants: ref_participants,
 *     islevel: islevel,
 *     videoAlreadyOn: videoAlreadyOn,
 *     localStreamVideo: localStreamVideo,
 *     keepBackground: keepBackground,
 *     virtualStream: virtualStream,
 *     forceFullDisplay: forceFullDisplay,
 *     otherGridStreams: otherGridStreams,
 *     updateOtherGridStreams: updateOtherGridStreams,
 *     updateMiniCardsGrid: updateMiniCardsGrid,
 *     getUpdatedAllParams: getUpdatedAllParams,
 *   },
 * };
 *
 * addVideosGrid(options)
 *   .then(() => {
 *     console.log('Videos grid updated successfully');
 *   })
 *   .catch((error) => {
 *     console.error('Error updating videos grid:', error);
 *   });
 */

export async function addVideosGrid({
  mainGridStreams,
  altGridStreams,
  numtoadd,
  numRows,
  numCols,
  actualRows,
  lastrowcols,
  removeAltGrid,
  parameters,
}: AddVideosGridOptions): Promise<void> {
  const {getUpdatedAllParams} = parameters;
  parameters = getUpdatedAllParams();

  const {
    eventType,
    updateAddAltGrid,
    ref_participants,
    islevel,
    videoAlreadyOn,
    localStreamVideo,
    keepBackground,
    virtualStream,
    otherGridStreams,
    updateOtherGridStreams,
    updateMiniCardsGrid,
  } = parameters;

  const newComponents: JSX.Element[][] = [[], []];
  let participant: any;
  let remoteProducerId: string = '';

  numtoadd = mainGridStreams.length;

  if (removeAltGrid) {
    updateAddAltGrid(false);
  }

  // Add participants to the main grid
  for (let i = 0; i < numtoadd; i++) {
    participant = mainGridStreams[i];
    remoteProducerId = participant.producerId;

    const pseudoName = !remoteProducerId || remoteProducerId === '';

    if (pseudoName) {
      remoteProducerId = participant.name;

      if (participant.audioID) {
        //get random number between 1 and 70
        const random = Math.floor(Math.random() * 70) + 1;
        const imageSource = `https://i.pravatar.cc/150?img=${random}`;
        newComponents[0].push(
          <AudioCard
            key={`audio-${participant.id}`}
            name={participant.name || ''}
            barColor="red"
            textColor="white"
            customStyle={{
              backgroundColor: 'transparent',
              borderWidth: eventType !== 'broadcast' ? 2 : 0,
              borderColor: 'black',
            }}
            controlsPosition="topLeft"
            infoPosition="topRight"
            roundedImage
            parameters={parameters}
            backgroundColor="transparent"
            showControls={eventType !== 'chat'}
            participant={participant}
            imageSource={imageSource}
          />,
        );
      } else {
        newComponents[0].push(
          <MiniCard
            key={`mini-${participant.id}`}
            initials={participant.name}
            fontSize={20}
            customStyle={{
              backgroundColor: 'transparent',
              borderWidth: eventType !== 'broadcast' ? 2 : 0,
              borderColor: 'black',
            }}
          />,
        );
      }
    } else if (
      remoteProducerId === 'youyou' ||
      remoteProducerId === 'youyouyou'
    ) {
      let name = 'You';
      if (islevel === '2' && eventType !== 'chat') {
        name = 'You (Host)';
      }

      if (!videoAlreadyOn) {
        newComponents[0].push(
          <MiniCard
            key="mini-you"
            initials={name}
            fontSize={20}
            customStyle={{
              backgroundColor: 'transparent',
              borderWidth: eventType !== 'broadcast' ? 2 : 0,
              borderColor: 'black',
            }}
          />,
        );
      } else {
        participant = {
          id: 'youyouyou',
          stream:
            keepBackground && virtualStream ? virtualStream : localStreamVideo,
          name: 'youyouyou',
        };

        newComponents[0].push(
          <VideoCard
            key="video-you"
            videoStream={participant.stream || new MediaStream()}
            customStyle={{
              borderWidth: eventType !== 'broadcast' ? 2 : 0,
              borderColor: 'black',
            }}
            participant={participant}
            showControls={false}
            showInfo={false}
            name={participant.name}
          />,
        );
      }
    } else {
      const participant_ = ref_participants.find(
        (obj: Participant) => obj.videoID === remoteProducerId,
      );
      if (participant_) {
        newComponents[0].push(
          <VideoCard
            key={`video-${participant_.id}`}
            videoStream={participant.stream || new MediaStream()}
            customStyle={{
              borderWidth: eventType !== 'broadcast' ? 2 : 0,
              borderColor: 'black',
            }}
            showControls={eventType !== 'chat'}
            showInfo
            name={participant_.name || ''}
          />,
        );
      }
    }

    if (i === numtoadd - 1) {
      otherGridStreams[0] = newComponents[0];

      await updateMiniCardsGrid({
        rows: numRows,
        cols: numCols,
        defal: true,
        actualRows,
        parameters,
      });

      updateOtherGridStreams(otherGridStreams);

      await updateMiniCardsGrid({
        rows: numRows,
        cols: numCols,
        defal: true,
        actualRows,
        parameters,
      });
    }
  }

  // Handle the alternate grid streams
  if (!removeAltGrid) {
    for (let i = 0; i < altGridStreams.length; i++) {
      participant = altGridStreams[i];
      remoteProducerId = participant.producerId;

      const pseudoName = !remoteProducerId || remoteProducerId === '';

      if (pseudoName) {
        if (participant.audioID) {
          const random = Math.floor(Math.random() * 70) + 1;
          const imageSource = `https://i.pravatar.cc/150?img=${random}`;
          newComponents[1].push(
            <AudioCard
              key={`audio-alt-${participant.id}`}
              name={participant.name}
              barColor="red"
              textColor="white"
              customStyle={{
                backgroundColor: 'transparent',
                borderWidth: eventType !== 'broadcast' ? 2 : 0,
                borderColor: 'black',
              }}
              controlsPosition="topLeft"
              infoPosition="topRight"
              roundedImage
              parameters={parameters}
              backgroundColor="transparent"
              showControls={eventType !== 'chat'}
              participant={participant}
              imageSource={imageSource}
            />,
          );
        } else {
          newComponents[1].push(
            <MiniCard
              key={`mini-alt-${participant.id}`}
              initials={participant.name}
              fontSize={20}
              customStyle={{
                backgroundColor: 'transparent',
                borderWidth: eventType !== 'broadcast' ? 2 : 0,
                borderColor: 'black',
              }}
            />,
          );
        }
      } else {
        const participant_ = ref_participants.find(
          (obj: Participant) => obj.videoID === remoteProducerId,
        );
        if (participant_) {
          newComponents[1].push(
            <VideoCard
              key={`video-alt-${participant_.id}`}
              videoStream={participant.stream || new MediaStream()}
              customStyle={{
                borderWidth: eventType !== 'broadcast' ? 2 : 0,
                borderColor: 'black',
              }}
              showControls={eventType !== 'chat'}
              showInfo
              name={participant.name}
            />,
          );
        }
      }

      if (i === altGridStreams.length - 1) {
        otherGridStreams[1] = newComponents[1];

        await updateMiniCardsGrid({
          rows: 1,
          cols: lastrowcols,
          defal: false,
          actualRows,
          parameters,
        });

        updateOtherGridStreams(otherGridStreams);

        await updateMiniCardsGrid({
          rows: numRows,
          cols: numCols,
          defal: true,
          actualRows,
          parameters,
        });
      }
    }
  } else {
    updateAddAltGrid(false);
    otherGridStreams[1] = [];

    await updateMiniCardsGrid({
      rows: 0,
      cols: 0,
      defal: false,
      actualRows,
      parameters,
    });

    updateOtherGridStreams(otherGridStreams);

    await updateMiniCardsGrid({
      rows: numRows,
      cols: numCols,
      defal: true,
      actualRows,
      parameters,
    });
  }
}
