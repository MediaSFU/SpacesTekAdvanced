import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import {
  faMicrophone,
  faMicrophoneSlash,
} from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

export interface VideoCardOptions {
  name: string;
  videoStream?: MediaStream;
  participant?: any;
  customStyle?: Partial<CSSStyleDeclaration>;
  showControls?: boolean;
  showInfo?: boolean;
}

@Component({
  selector: 'app-video-card',
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="participant-card-alt" [ngStyle]="customStyle">
      <!-- Video Element -->
      <video
        #videoElement
        class="participant-video"
        [muted]="true"
        autoplay
        playsinline
      ></video>

      <!-- Name Tag -->
      <div *ngIf="showInfo" class="participant-name">{{ name }}</div>

      <!-- Mic/Audio Status -->
      <div *ngIf="showControls" class="participant-audio-status">
        <fa-icon
          [icon]="isMuted ? faMicrophoneSlash : faMicrophone"
          [ngClass]="isMuted ? 'icon-muted' : 'icon-active'"
        ></fa-icon>
      </div>
    </div>
  `,
  styles: [
    `
    .participant-card-alt {
      background: #fff;
      width: 120px;
      height: 120px;
      border-radius: 50%; /* Rounded card */
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .participant-card-alt .participant-card-alt:hover {
      transform: translateY(-2px); /* Elevation on hover */
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    }

    /* Video Element */
    .participant-card-alt .participant-video {
      width: 100%;
      height: 100%;
      border-radius: 50%; /* Matches card rounding */
      object-fit: cover;
    }

    /* Name Tag */
    .participant-card-alt .participant-name {
      position: absolute;
      bottom: 5%; /* Positioned at the bottom */
      width: 90%; /* Slight padding from the edges */
      text-align: center;
      color: #333;
      font-size: 0.8em;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.8); /* Semi-transparent background */
      padding: 3px 5px;
      border-radius: 12px; /* Slightly rounded tag */
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Audio Status Icon */
    .participant-card-alt .participant-audio-status {
      position: absolute;
      top: 5%; /* Positioned at the top-left */
      left: 5%;
      background: rgba(0, 0, 0, 0.6); /* Semi-transparent black */
      color: #fff;
      font-size: 1.2em;
      padding: 6px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .participant-card-alt .participant-audio-status .icon-muted {
      color: red;
    }

    .participant-card-alt .participant-audio-status .icon-active {
      color: green;
    }

    `,
  ],
})
export class VideoCard implements OnInit, OnDestroy, OnChanges {
  @Input() name!: string;
  @Input() videoStream?: MediaStream;
  @Input() participant?: any;
  @Input() customStyle: Partial<CSSStyleDeclaration> = {};
  @Input() showControls = true;
  @Input() showInfo = true;

  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;

  isMuted = false;

  // FontAwesome Icons
  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;

  ngOnInit() {
    this.isMuted = this.participant?.muted || false;
    if (this.videoStream && this.videoElement) {
      const videoElement = this.videoElement.nativeElement;
      videoElement.srcObject = this.videoStream;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['videoStream'] && this.videoStream) {
      const currentStream = changes['videoStream'].currentValue;
      const previousStream = changes['videoStream'].previousValue;

      if (
        !previousStream ||
        currentStream.id !== previousStream.id ||
        currentStream.active !== previousStream.active
      ) {
        this.updateVideoStream();
      }
    }
  }

  ngOnDestroy() {
    if (this.videoElement) {
      const videoElement = this.videoElement.nativeElement;
      videoElement.srcObject = null;
    }
  }


  updateVideoStream() {
    if (this.videoElement && this.videoStream) {
      const videoElement = this.videoElement.nativeElement;

      // Update the video element's srcObject only if it has changed
      if (videoElement.srcObject !== this.videoStream) {
        videoElement.srcObject = this.videoStream;
      }
    }
  }
}
