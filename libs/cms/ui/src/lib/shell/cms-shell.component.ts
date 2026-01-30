import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'cms-shell',
  standalone: true,
  imports: [RouterModule],
  template: '<section class=" min-h-full max-w-[1600px] "><router-outlet /></section>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        @apply w-full grid place-items-center;
      }
    `,
  ],
})
export class CmsShellComponent {}
