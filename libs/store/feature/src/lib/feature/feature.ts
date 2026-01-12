import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'fe-store-feature',
  imports: [],
  templateUrl: './feature.html',
  styleUrl: './feature.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Feature {}
