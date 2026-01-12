import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-metadata-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="medusa-panel p-4">
      <div class="text-sm font-semibold mb-2">Metadata</div>
      <div class="text-sm text-ui-fg-subtle">Provided data is available for widgets/JSON/metadata rendering.</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataSectionComponent {
  @Input({ required: true }) data!: unknown;
}
