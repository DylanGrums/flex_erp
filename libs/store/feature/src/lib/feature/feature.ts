import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-feature',
  imports: [],
  templateUrl: './feature.html',
  styleUrl: './feature.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Feature {}
