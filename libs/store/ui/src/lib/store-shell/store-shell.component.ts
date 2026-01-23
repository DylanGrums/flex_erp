import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'fe-store-shell',
  standalone: true,
  template: '<section class="min-h-full"><ng-content></ng-content></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreShellComponent {}
