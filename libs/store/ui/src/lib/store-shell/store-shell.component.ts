import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'fe-store-shell',
  standalone: true,
  imports: [RouterModule],
  template: '<section class="flex min-h-full flex-col gap-y-2 w-full  max-w-[1600px]"><router-outlet /></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-0 flex-1 w-full justify-center w-full',
  },
})
export class StoreShellComponent {}
