import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Image, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fe-icon-placeholder-cell',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex h-full w-full items-center justify-center">
      <span class="flex h-7 w-7 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
        <i-lucide [img]="Image" class="h-3.5 w-3.5 text-ui-fg-muted"></i-lucide>
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPlaceholderCellComponent {
  readonly Image = Image;
}
