import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'fe-store-shell',
  standalone: true,
  imports: [RouterModule],
  template: '<section class="flex min-h-full flex-col gap-y-2  max-w-[1600px]"><router-outlet /></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreShellComponent {}
