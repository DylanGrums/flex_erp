import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FlexSelectDirective,
  FlexSelectDropdownDirective,
  FlexSelectOptionDirective,
  FlexSelectPortalDirective,
} from '@flex-erp/shared/ui';

export interface CmsSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'cms-select',
  standalone: true,
  imports: [
    FlexSelectDirective,
    FlexSelectPortalDirective,
    FlexSelectDropdownDirective,
    FlexSelectOptionDirective,
  ],
  template: `
    <div
      flexSelect
      [value]="value ?? ''"
      (valueChange)="valueChange.emit($event)"
      [disabled]="disabled"
      [class]="triggerClass"
    >
      <span>{{ selectedLabel || placeholder }}</span>
      <span class="ms-auto text-ui-fg-muted">
        <i class="pi pi-chevron-down"></i>
      </span>
      <div *flexSelectPortal flexSelectDropdown [class]="contentClass">
        @for (option of options; track option.value) {
          <div
            flexSelectOption
            [flexSelectOptionValue]="option.value"
            [class]="itemClass"
          >
            <span>{{ option.label }}</span>
            @if (option.value === value) {
              <span class="ms-auto text-ui-fg-interactive">
                <i class="pi pi-check"></i>
              </span>
            }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsSelectComponent {
  @Input() value: string | null = null;
  @Input() placeholder = 'Select';
  @Input() options: CmsSelectOption[] = [];
  @Input() disabled = false;
  @Input() className = '';

  @Output() valueChange = new EventEmitter<string>();

  get triggerClass(): string {
    const base =
      'flex h-9 w-full items-center justify-between rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-border-interactive data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
    return [base, this.className].filter(Boolean).join(' ');
  }

  get contentClass(): string {
    return 'z-50 mt-2 max-h-60 w-full overflow-auto rounded-md border border-ui-border-base bg-ui-bg-base p-1 shadow';
  }

  get itemClass(): string {
    return 'flex cursor-pointer select-none items-center rounded px-2 py-1.5 text-sm text-ui-fg-base outline-none data-[active]:bg-ui-bg-subtle-hover data-[selected]:bg-ui-bg-subtle';
  }

  get selectedLabel(): string | null {
    return this.options.find((option) => option.value === this.value)?.label ?? null;
  }
}
