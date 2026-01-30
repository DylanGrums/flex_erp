import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'cms-shell',
  standalone: true,
  imports: [RouterModule],
  template:
    '<section class="flex min-h-0 flex-1 flex-col bg-ui-bg-subtle overflow-auto max-w-[1600px]"><router-outlet /></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-0 flex-1 w-full justify-center',
  },
})
export class CmsShellComponent {}
