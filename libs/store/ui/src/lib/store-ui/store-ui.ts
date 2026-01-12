import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-store-ui',
  imports: [],
  templateUrl: './store-ui.html',
  styleUrl: './store-ui.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreUi {}
