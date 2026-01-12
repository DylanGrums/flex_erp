import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-util',
  imports: [],
  templateUrl: './util.html',
  styleUrl: './util.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Util {}
