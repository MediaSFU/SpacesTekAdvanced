import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audio-level-bars',
  templateUrl: './audio-level-bars.component.html',
  styleUrls: ['./audio-level-bars.component.css'],
  imports: [CommonModule]
})
export class AudioLevelBarsComponent implements OnChanges {
  @Input() audioLevel: number = 0;
  bars: boolean[] = Array(10).fill(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['audioLevel']) {
      this.updateBars();
    }
  }

  private updateBars(): void {
    const normalizedLevel = Math.max(
      0,
      ((this.audioLevel - 127.5) / (275 - 127.5)) * 10
    ); // Normalize audio level to 0–10
    this.bars = this.bars.map((_, index) => index < normalizedLevel);
  }

  getColor(index: number): string {
    // Example: Generate a heatmap gradient from red to green
    const red = Math.max(255 - index * 20, 0); // Decrease red as index increases
    const green = Math.min(index * 20, 255);   // Increase green as index increases
    return `rgb(${red}, ${green}, 0)`;         // Return RGB color
  }

}
