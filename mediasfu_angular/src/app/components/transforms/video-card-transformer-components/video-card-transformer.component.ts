import { Component, Input, OnInit } from '@angular/core';
import { VideoCardOptions, CustomMediaComponent, VideoCard } from 'mediasfu-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-card-transformer',
  template: `
<div class="video-grid">
  <div *ngFor="let row of videoCards; let rowIndex = index" class="video-row">
    <ng-container *ngFor="let video of row">
      <app-video-card
        *ngIf="video.inputs && video.inputs.videoStream"
        [ngClass]="{'hidden': !video.inputs}"
        [customStyle]="transformStyle(video.inputs)"
        [videoStream]="video.inputs.videoStream"
        [participant]="video.inputs.participant"
        [videoControlsComponent]="renderControls(video.inputs)"
        [videoInfoComponent]="renderInfo(video.inputs)"
        [parameters]="video.inputs.parameters"
      ></app-video-card>
    </ng-container>
  </div>
</div>

  `,
  styleUrls: ['./video-card-transformer.component.css'],
  imports: [VideoCard, CommonModule],
})
export class VideoCardTransformerComponent implements OnInit {
  @Input() videoCards: CustomMediaComponent[][] = [];

  constructor() { }

  ngOnInit(): void { }

  transformStyle(video: VideoCardOptions): Partial<CSSStyleDeclaration> {
    return {
      ...video.customStyle,
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  }

  renderControls(video: VideoCardOptions): HTMLElement {
    return `
      <div class="participant-audio-status">
        ${video.participant?.muted! ? '🔇' : '🎤'}
      </div>
    ` as unknown as HTMLElement;
  }

  renderInfo(video: VideoCardOptions): HTMLElement {
    return `
      <div class="participant-name">
        ${video.participant?.name! || 'Unnamed'}
      </div>
    ` as unknown as HTMLElement;
  }
}
