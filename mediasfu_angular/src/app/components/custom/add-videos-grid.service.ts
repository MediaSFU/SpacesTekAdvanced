import { Injectable } from '@angular/core';
import { MiniCard , AudioCard } from 'mediasfu-angular';
import { VideoCard, VideoCardOptions } from './video-card.component';
import {
  Participant,
  Stream,
  UpdateMiniCardsGridType,
  UpdateMiniCardsGridParameters,
  AudioCardParameters,
  EventType,
  CustomMediaComponent,
} from 'mediasfu-angular';

export interface AddVideosGridParameters
  extends UpdateMiniCardsGridParameters,
    AudioCardParameters {
  eventType: EventType;
  updateAddAltGrid: (addAltGrid: boolean) => void;
  ref_participants: Participant[];
  islevel: string;
  videoAlreadyOn: boolean;
  localStreamVideo: MediaStream | null;
  keepBackground: boolean;
  virtualStream: MediaStream | null;
  forceFullDisplay: boolean;
  otherGridStreams: CustomMediaComponent[][];
  updateOtherGridStreams: (otherGridStreams: CustomMediaComponent[][]) => void;

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
export type AddVideosGridType = (options: AddVideosGridOptions) => Promise<void>;

/**
 * @service AddVideosGrid
 * @description Service to manage and update video and audio components on a grid in the user interface. This service helps organize and configure participants and streams into different grid layouts.
 *
 * @method addVideosGrid
 * Adds video and audio cards to the main and alternate grids based on the parameters and configuration options provided.
 *
 * @param {AddVideosGridOptions} options - Configuration options for setting up the grid.
 * @param {(Stream | Participant)[]} options.mainGridStreams - Streams or participants to display on the main grid.
 * @param {(Stream | Participant)[]} options.altGridStreams - Streams or participants to display on the alternate grid.
 * @param {number} options.numtoadd - The number of items to add to the grid.
 * @param {number} options.numRows - The number of rows for the main grid.
 * @param {number} options.numCols - The number of columns for the main grid.
 * @param {number} options.actualRows - The actual rows currently displayed.
 * @param {number} options.lastrowcols - The number of columns in the last row of the grid.
 * @param {boolean} options.removeAltGrid - Whether to remove the alternate grid layout.
 * @param {AddVideosGridParameters} options.parameters - Additional parameters for updating the grid, controlling appearance, and handling events.
 *
 * @returns {Promise<void>} A promise that resolves once the grid layout is updated.
 *
 * @example
 * ```typescript
 * await addVideosGridService.addVideosGrid({
 *   mainGridStreams: [...],
 *   altGridStreams: [...],
 *   numtoadd: 4,
 *   numRows: 2,
 *   numCols: 2,
 *   actualRows: 2,
 *   lastrowcols: 2,
 *   removeAltGrid: false,
 *   parameters: {
 *     eventType: 'webinar',
 *     updateAddAltGrid: (value) => {},
 *     ref_participants: participantsList,
 *     islevel: '1',
 *     videoAlreadyOn: true,
 *     localStreamVideo: localStream,
 *     keepBackground: true,
 *     virtualStream: virtualStream,
 *     forceFullDisplay: false,
 *     otherGridStreams: otherStreamsArray,
 *     updateOtherGridStreams: (newStreams) => {},
 *     updateMiniCardsGrid: (params) => {},
 *     getUpdatedAllParams: () => ({ /* updated parameters * / }),
 *   },
 * });
 * ```
 */


@Injectable({
  providedIn: 'root',
})
export class AddVideosGrid {
  addVideosGrid = async ({
    mainGridStreams,
    altGridStreams,
    numtoadd,
    numRows,
    numCols,
    actualRows,
    lastrowcols,
    removeAltGrid,
    parameters,
  }: AddVideosGridOptions): Promise<void> => {
    let { getUpdatedAllParams } = parameters;
    parameters = { ...parameters, ...getUpdatedAllParams() };

    let {
      eventType,
      updateAddAltGrid,
      ref_participants,
      islevel,
      videoAlreadyOn,
      localStreamVideo,
      keepBackground,
      virtualStream,
      forceFullDisplay,
      otherGridStreams,
      updateOtherGridStreams,
      updateMiniCardsGrid,
    } = parameters;

    let newComponents: { component: any; inputs: any }[][] = [[], []];
    let participant: any;
    let remoteProducerId = '';
    let participant_ = null;

    numtoadd = mainGridStreams.length;

    if (removeAltGrid) {
      updateAddAltGrid(false);
    }

    // Add participants to the main grid
    for (let i = 0; i < numtoadd; i++) {
      participant = mainGridStreams[i];
      remoteProducerId = participant.producerId;

      let pseudoName = !remoteProducerId || remoteProducerId === '';

      if (pseudoName) {
        participant_ = participant;
        remoteProducerId = await participant.name;

        if (
          Object.prototype.hasOwnProperty.call(participant, 'audioID') &&
          participant.audioID != null &&
          participant.audioID !== ''
        ) {
          const random = Math.floor(Math.random() * 70) + 1;
          const imageSource = `https://i.pravatar.cc/150?img=${random}`;
          newComponents[0].push({
            component: AudioCard,
            inputs: {
              name: participant.name,
              barColor: 'red',
              textColor: 'white',
              customStyle: {
                backgroundColor: 'transparent',
                border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
              },
              controlsPosition: 'topLeft',
              infoPosition: 'topRight',
              showWaveform: true,
              roundedImage: true,
              parameters,
              backgroundColor: 'transparent',
              showControls: eventType !== 'chat',
              participant,
              imageSource,
            },
          });
        } else {
          newComponents[0].push({
            component: MiniCard,
            inputs: {
              initials: participant.name,
              fontSize: 20,
              customStyle: {
                backgroundColor: 'transparent',
                border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
              },
            },
          });
        }
      } else {
        if (remoteProducerId === 'youyou' || remoteProducerId === 'youyouyou') {
          let name = 'You';
          if (islevel === '2' && eventType !== 'chat') {
            name = 'You (Host)';
          }

          if (!videoAlreadyOn) {
            name = 'You';
            if (islevel == '2' && eventType != 'chat') {
              name = 'You (Host)';
            }

            newComponents[0].push({
              component: MiniCard,
              inputs: {
                initials: name,
                fontSize: 20,
                customStyle: {
                  backgroundColor: 'transparent',
                  border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                },
              },
            });
          } else {
            participant = {
              id: 'youyouyou',
              stream: keepBackground && virtualStream ? virtualStream : localStreamVideo,
              name: 'youyouyou',
              muted: true,
            };
            participant_ = {
              id: 'youyou',
              videoID: 'youyou',
              name: 'youyouyou',
              stream: keepBackground && virtualStream ? virtualStream : localStreamVideo,
            };
            remoteProducerId = 'youyouyou';

            const options: VideoCardOptions = {
              name,
              videoStream: participant.stream ? participant.stream : null,
              participant: participant_,
              customStyle: {
                border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
              },
              showControls: false,
              showInfo: false,
            };

            newComponents[0].push({
              component: VideoCard,
              inputs: options,
            });
          }
        } else {
          participant_ = ref_participants.find((obj: any) => obj.videoID === remoteProducerId);
          if (participant_) {
            const options: VideoCardOptions = {
              name: participant.name,
              videoStream: participant.stream ? participant.stream : null,
              participant: participant_,
              customStyle: {
                border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
              },
              showControls: false,
              showInfo: false,
            };

            newComponents[0].push({
              component: VideoCard,
              inputs: options,
            });
          }
        }
      }

      if (i === numtoadd - 1) {
        otherGridStreams[0] = newComponents[0];

        await updateMiniCardsGrid({
          rows: numRows,
          cols: numCols,
          defal: true,
          actualRows: actualRows,
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

        let participant_;
        let pseudoName = false;

        //check if there is .name in the participant object and if it is null
        if (
          Object.prototype.hasOwnProperty.call(participant, 'producerId') &&
          participant.producerId != null &&
          participant.producerId !== ''
        ) {
          //actual video
          pseudoName = false;
        } else {
          pseudoName = true;
        }

        if (pseudoName) {
          participant_ = participant;
          remoteProducerId = await participant.name;

          if (
            Object.prototype.hasOwnProperty.call(participant, 'audioID') &&
            participant.audioID != null &&
            participant.audioID !== ''
          ) {
            const random = Math.floor(Math.random() * 70) + 1;
            const imageSource = `https://i.pravatar.cc/150?img=${random}`;
            newComponents[1].push({
              component: AudioCard,
              inputs: {
                name: participant.name,
                barColor: 'red',
                textColor: 'white',
                customStyle: {
                  backgroundColor: 'transparent',
                  border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                },
                controlsPosition: 'topLeft',
                infoPosition: 'topRight',
                showWaveform: true,
                roundedImage: true,
                parameters,
                backgroundColor: 'transparent',
                showControls: eventType !== 'chat',
                participant,
                imageSource,
              },
            });
          } else {
            newComponents[1].push({
              component: MiniCard,
              inputs: {
                initials: participant.name,
                fontSize: 20,
                customStyle: {
                  backgroundColor: 'transparent',
                  border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
                },
              },
            });
          }
        } else {
          participant_ = ref_participants.find((obj: any) => obj.videoID === remoteProducerId);
          const options: VideoCardOptions = {
            name: participant.name,
            videoStream: participant.stream ? participant.stream : null,
            participant: participant_,
            customStyle: {
              border: eventType !== 'broadcast' ? '2px solid black' : '0px solid black',
            },
            showControls: false,
            showInfo: false,
          };
          newComponents[1].push({
            component: VideoCard,
            inputs: options,
          });
        }

        if (i === numtoadd - 1) {
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
            rows: 1,
            cols: lastrowcols,
            defal: false,
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
        actualRows: actualRows,
        parameters,
      });

      updateOtherGridStreams(otherGridStreams);
      await updateMiniCardsGrid({
        rows: 0,
        cols: 0,
        defal: false,
        actualRows,
        parameters,
      });
    }
  };
}
