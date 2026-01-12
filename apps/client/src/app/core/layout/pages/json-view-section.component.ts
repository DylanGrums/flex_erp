import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-json-view-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="medusa-panel p-4">
      <div class="text-sm font-semibold mb-2">JSON</div>
      <pre class="text-xs overflow-auto">{{ data | json }}</pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonViewSectionComponent {
  @Input({ required: true }) data!: unknown;
}
