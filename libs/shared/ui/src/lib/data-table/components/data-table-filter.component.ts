import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  computed,
  signal,
} from '@angular/core';
import {
  FlexPopoverAlign,
  FlexPopoverDirective,
  FlexPopoverSide,
  FlexPopoverTriggerDirective,
} from '../../primitives/popover/popover.directive';
import {
  FlexSelectDirective,
  FlexSelectDropdownDirective,
  FlexSelectOptionDirective,
  FlexSelectPortalDirective,
} from '../../primitives/select/select.directive';

import { injectDataTableContext } from '../data-table-context';
import {
  DataTableCustomFilterContext,
  DataTableCustomFilterProps,
  DataTableDateComparisonOperator,
  DataTableDateFilterProps,
  DataTableFilterOption,
  DataTableFilterProps,
  DataTableNumberComparisonOperator,
} from '../types';
import { isDateComparisonOperator } from '../utils/is-date-comparison-operator';
import { DataTableCheckboxComponent } from '../primitives/data-table-checkbox.component';

interface DataTableFilterUpdateEvent {
  value: unknown;
}

@Component({
  selector: 'flex-data-table-filter-select-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-[250px]">
      <div class="flex items-center gap-x-2 border-b border-ui-border-base bg-ui-bg-base px-3 py-2">
        <i class="pi pi-search h-4 w-4 text-ui-fg-muted"></i>
        <input
          [value]="search()"
          (input)="onSearchInput($event)"
          placeholder="Search..."
          class="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-ui-fg-muted"
          autofocus
        />
        @if (search()) {
          <button
            type="button"
            class="text-ui-fg-muted transition-fg hover:text-ui-fg-subtle"
            (click)="search.set('')"
          >
            <i class="pi pi-times text-xs"></i>
          </button>
        }
      </div>

      <div class="max-h-[300px] overflow-auto p-1">
        @if (!filteredOptions().length) {
          <div class="py-6 text-center text-sm text-ui-fg-muted">No results found</div>
        }

        @for (option of filteredOptions(); track option.value) {
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-1.5 text-left text-sm text-ui-fg-base transition-fg hover:bg-ui-bg-base-hover"
            (click)="toggleValue(option.value)"
          >
            <div class="flex size-[15px] items-center justify-center">
              @if (isSelected(option.value)) {
                <i class="pi pi-check text-xs"></i>
              }
            </div>
            <span>{{ option.label }}</span>
          </button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableFilterSelectContentComponent {
  @Input({ required: true }) id!: string;
  @Input() filter: string[] | undefined = [];
  @Input() options: DataTableFilterOption<string>[] = [];

  @Output() update = new EventEmitter<DataTableFilterUpdateEvent>();

  readonly context = injectDataTableContext();
  readonly search = signal('');

  get instance() {
    return this.context.instance;
  }

  readonly filteredOptions = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) {
      return this.options;
    }

    return this.options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  });

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.search.set(target?.value ?? '');
  }

  toggleValue(value: string): void {
    const current = this.filter ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    const updateValue = next.length ? next : undefined;
    if (this.update.observed) {
      this.update.emit({ value: updateValue });
    } else {
      this.instance.updateFilter({ id: this.id, value: updateValue });
    }
  }

  isSelected(value: string): boolean {
    return (this.filter ?? []).includes(value);
  }
}

@Component({
  selector: 'flex-data-table-filter-radio-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col p-1 outline-none"
      role="list"
      tabindex="0"
      (focus)="onListFocus()"
      (keydown)="onKeyDown($event)"
    >
      @for (option of options; track option.value; let idx = $index) {
        <button
          type="button"
          role="listitem"
          class="bg-ui-bg-component txt-compact-small transition-fg flex items-center gap-2 rounded px-2 py-1 text-ui-fg-base outline-none"
          [class.bg-ui-bg-component-hover]="focusedIndex() === idx"
          (mouseenter)="focusedIndex.set(idx)"
          (mouseleave)="focusedIndex.set(-1)"
          (click)="selectOption(option.value)"
        >
          <div class="flex size-[15px] items-center justify-center">
            @if (filter === option.value) {
              <span class="size-2 rounded-full bg-ui-fg-subtle"></span>
            }
          </div>
          <span>{{ option.label }}</span>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableFilterRadioContentComponent {
  @Input({ required: true }) id!: string;
  @Input() filter: unknown;
  @Input() options: DataTableFilterOption<string>[] = [];

  @Output() update = new EventEmitter<DataTableFilterUpdateEvent>();

  readonly context = injectDataTableContext();
  readonly focusedIndex = signal(-1);

  get instance() {
    return this.context.instance;
  }

  onListFocus(): void {
    if (this.focusedIndex() === -1) {
      this.focusedIndex.set(0);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.set(Math.min(this.focusedIndex() + 1, this.options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.set(Math.max(this.focusedIndex() - 1, 0));
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (this.focusedIndex() >= 0) {
          this.selectOption(this.options[this.focusedIndex()].value);
        }
        break;
    }
  }

  selectOption(value: string): void {
    if (this.update.observed) {
      this.update.emit({ value });
    } else {
      this.instance.updateFilter({ id: this.id, value });
    }
  }
}

@Component({
  selector: 'flex-data-table-filter-date-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col p-1 outline-none"
      tabindex="0"
      role="list"
      (focus)="onListFocus()"
      (keydown)="onKeyDown($event)"
    >
      @for (option of options; track option.label; let idx = $index) {
        <button
          type="button"
          role="listitem"
          class="bg-ui-bg-component txt-compact-small transition-fg flex items-center gap-2 rounded px-2 py-1 text-ui-fg-base outline-none"
          [class.bg-ui-bg-component-hover]="focusedIndex() === idx"
          (mouseenter)="focusedIndex.set(idx)"
          (mouseleave)="focusedIndex.set(-1)"
          (click)="selectValue(option.value)"
        >
          <div class="flex size-[15px] items-center justify-center">
            @if (selectedValue === stringify(option.value)) {
              <span class="size-2 rounded-full bg-ui-fg-subtle"></span>
            }
          </div>
          <span>{{ option.label }}</span>
        </button>
      }
      @if (!disableRangeOption) {
        <button
          type="button"
          role="listitem"
          class="bg-ui-bg-component txt-compact-small transition-fg flex items-center gap-2 rounded px-2 py-1 text-ui-fg-base outline-none"
          [class.bg-ui-bg-component-hover]="focusedIndex() === options.length"
          (mouseenter)="focusedIndex.set(options.length)"
          (mouseleave)="focusedIndex.set(-1)"
          (click)="selectCustom()"
        >
          <div class="flex size-[15px] items-center justify-center">
            @if (isCustom()) {
              <span class="size-2 rounded-full bg-ui-fg-subtle"></span>
            }
          </div>
          <span>{{ rangeOptionLabel || 'Custom' }}</span>
        </button>
      }
    </div>

    @if (!disableRangeOption && isCustom()) {
      <div class="flex flex-col py-[3px]">
        <div class="bg-ui-border-menu-top h-px w-full"></div>
        <div class="bg-ui-border-menu-bot h-px w-full"></div>
      </div>
      <div class="flex flex-col gap-2 px-2 pb-3 pt-1">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-ui-fg-muted">
            {{ rangeOptionStartLabel || 'Starting' }}
          </label>
          <input
            [type]="inputType"
            [value]="startInputValue"
            [max]="maxStart"
            (input)="onStartInput($event)"
            class="h-9 rounded-md border border-ui-border-base bg-ui-bg-base px-2 text-sm text-ui-fg-base shadow-borders-base"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-ui-fg-muted">
            {{ rangeOptionEndLabel || 'Ending' }}
          </label>
          <input
            [type]="inputType"
            [value]="endInputValue"
            [min]="minEnd"
            (input)="onEndInput($event)"
            class="h-9 rounded-md border border-ui-border-base bg-ui-bg-base px-2 text-sm text-ui-fg-base shadow-borders-base"
          />
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableFilterDateContentComponent {
  @Input({ required: true }) id!: string;
  @Input() filter: unknown;
  @Input() options: DataTableFilterOption<DataTableDateComparisonOperator>[] = [];
  @Input() format: 'date' | 'date-time' = 'date';
  @Input() rangeOptionLabel?: string;
  @Input() rangeOptionStartLabel?: string;
  @Input() rangeOptionEndLabel?: string;
  @Input() disableRangeOption = false;
  @Input() isCustomRange = false;

  @Output() update = new EventEmitter<DataTableFilterUpdateEvent>();

  readonly context = injectDataTableContext();
  readonly isCustom = signal(false);
  readonly focusedIndex = signal(-1);

  get instance() {
    return this.context.instance;
  }

  ngOnInit(): void {
    this.isCustom.set(this.isCustomRange);
  }

  ngOnChanges(): void {
    this.isCustom.set(this.isCustomRange);
  }

  get selectedValue(): string | undefined {
    if (!this.filter || this.isCustom()) {
      return undefined;
    }

    return this.stringify(this.filter as DataTableDateComparisonOperator);
  }

  get inputType(): string {
    return this.format === 'date-time' ? 'datetime-local' : 'date';
  }

  get startInputValue(): string {
    const value = (this.filter as DataTableDateComparisonOperator | undefined)?.$gte;
    return value ? this.formatInputValue(value) : '';
  }

  get endInputValue(): string {
    const value = (this.filter as DataTableDateComparisonOperator | undefined)?.$lte;
    return value ? this.formatInputValue(value) : '';
  }

  get maxStart(): string | null {
    const value = (this.filter as DataTableDateComparisonOperator | undefined)?.$lte;
    return value ? this.formatInputValue(value) : null;
  }

  get minEnd(): string | null {
    const value = (this.filter as DataTableDateComparisonOperator | undefined)?.$gte;
    return value ? this.formatInputValue(value) : null;
  }

  onListFocus(): void {
    if (this.focusedIndex() === -1) {
      this.focusedIndex.set(this.isCustom() ? this.options.length : 0);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const maxIndex = this.options.length + (this.disableRangeOption ? 0 : 1) - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.set(Math.min(this.focusedIndex() + 1, maxIndex));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.set(Math.max(this.focusedIndex() - 1, 0));
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (this.focusedIndex() === this.options.length && !this.disableRangeOption) {
          this.selectCustom();
        } else if (this.focusedIndex() >= 0) {
          this.selectValue(this.options[this.focusedIndex()].value);
        }
        break;
    }
  }

  selectValue(value: DataTableDateComparisonOperator): void {
    this.isCustom.set(false);
    this.emitUpdate(value);
  }

  selectCustom(): void {
    this.isCustom.set(true);
  }

  onStartInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.onCustomValueChange('$gte', target?.value ?? '');
  }

  onEndInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.onCustomValueChange('$lte', target?.value ?? '');
  }

  onCustomValueChange(input: '$gte' | '$lte', value: string): void {
    const current = (this.filter as DataTableDateComparisonOperator) ?? {};
    const next = { ...current } as DataTableDateComparisonOperator;
    next[input] = value ? new Date(value).toISOString() : undefined;
    this.emitUpdate(next);
  }

  emitUpdate(value: DataTableDateComparisonOperator): void {
    if (this.update.observed) {
      this.update.emit({ value });
    } else {
      this.instance.updateFilter({ id: this.id, value });
    }
  }

  stringify(value: DataTableDateComparisonOperator): string {
    return JSON.stringify(value);
  }

  private formatInputValue(value: string): string {
    const date = new Date(value);
    if (this.format === 'date-time') {
      return date.toISOString().slice(0, 16);
    }
    return date.toISOString().slice(0, 10);
  }
}

@Component({
  selector: 'flex-data-table-filter-multiselect-content',
  standalone: true,
  imports: [CommonModule, DataTableCheckboxComponent],
  template: `
    <div class="w-[250px]">
      @if (searchable) {
        <div class="flex items-center gap-x-2 border-b border-ui-border-base bg-ui-bg-base px-3 py-2">
          <i class="pi pi-search h-4 w-4 text-ui-fg-muted"></i>
          <input
            [value]="search()"
            (input)="onSearchInput($event)"
            placeholder="Search..."
            class="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-ui-fg-muted"
            autofocus
          />
          @if (search()) {
            <button
              type="button"
              class="text-ui-fg-muted transition-fg hover:text-ui-fg-subtle"
              (click)="search.set('')"
            >
              <i class="pi pi-times text-xs"></i>
            </button>
          }
        </div>
      }

      <div class="max-h-[300px] overflow-auto p-1">
        @if (!filteredOptions().length) {
          <div class="py-6 text-center text-sm text-ui-fg-muted">No results found</div>
        }

        @for (option of filteredOptions(); track option.value) {
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-1.5 text-left text-sm text-ui-fg-base transition-fg hover:bg-ui-bg-base-hover"
            (click)="toggleValue(option.value)"
          >
            <flex-data-table-checkbox
              [checked]="isSelected(option.value)"
              className="pointer-events-none"
            ></flex-data-table-checkbox>
            <span>{{ option.label }}</span>
          </button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableFilterMultiselectContentComponent {
  @Input({ required: true }) id!: string;
  @Input() filter: string[] | undefined = [];
  @Input() options: DataTableFilterOption<string>[] = [];
  @Input() searchable = true;

  @Output() update = new EventEmitter<DataTableFilterUpdateEvent>();

  readonly context = injectDataTableContext();
  readonly search = signal('');

  get instance() {
    return this.context.instance;
  }

  readonly filteredOptions = computed(() => {
    if (!this.searchable) {
      return this.options;
    }

    const query = this.search().trim().toLowerCase();
    if (!query) {
      return this.options;
    }

    return this.options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  });

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.search.set(target?.value ?? '');
  }

  toggleValue(value: string): void {
    const current = this.filter ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    const updateValue = next.length ? next : undefined;
    if (this.update.observed) {
      this.update.emit({ value: updateValue });
    } else {
      this.instance.updateFilter({ id: this.id, value: updateValue });
    }
  }

  isSelected(value: string): boolean {
    return (this.filter ?? []).includes(value);
  }
}

@Component({
  selector: 'flex-data-table-filter-string-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-[250px] p-3">
      <input
        [placeholder]="placeholder"
        [value]="value()"
        (input)="onInput($event)"
        (keydown)="onKeyDown($event)"
        class="h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-2 text-sm text-ui-fg-base shadow-borders-base"
        autofocus
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableFilterStringContentComponent {
  @Input({ required: true }) id!: string;
  @Input() filter: string | undefined;
  @Input() placeholder = 'Enter value...';

  @Output() update = new EventEmitter<DataTableFilterUpdateEvent>();

  readonly context = injectDataTableContext();
  readonly value = signal('');

  private timeout: ReturnType<typeof setTimeout> | null = null;

  get instance() {
    return this.context.instance;
  }

  ngOnInit(): void {
    this.value.set(this.filter ?? '');
  }

  ngOnChanges(): void {
    this.value.set(this.filter ?? '');
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const nextValue = target?.value ?? '';
    this.handleChange(nextValue);
  }

  handleChange(nextValue: string): void {
    this.value.set(nextValue);

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      const updateValue = nextValue.trim() || undefined;
      this.emitUpdate(updateValue);
    }, 500);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      return;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    const updateValue = this.value().trim() || undefined;
    this.emitUpdate(updateValue);
  }

  emitUpdate(value: unknown): void {
    if (this.update.observed) {
      this.update.emit({ value });
    } else {
      this.instance.updateFilter({ id: this.id, value });
    }
  }
}

@Component({
  selector: 'flex-data-table-filter-number-content',
  standalone: true,
  imports: [
    CommonModule,
    FlexSelectDirective,
    FlexSelectPortalDirective,
    FlexSelectDropdownDirective,
    FlexSelectOptionDirective,
  ],
  template: `
    <div class="w-[250px] space-y-3 p-3">
      @if (includeOperators) {
        <div
          flexSelect
          [value]="operator()"
          (valueChange)="handleOperatorChange($event)"
          class="flex h-9 w-full items-center justify-between rounded-md border border-ui-border-base bg-ui-bg-base px-3 text-sm text-ui-fg-base shadow-borders-base"
        >
          <span>{{ selectedOperatorLabel }}</span>
          <span class="ms-auto text-ui-fg-muted">
            <i class="pi pi-chevron-down text-xs"></i>
          </span>
          <div
            *flexSelectPortal
            flexSelectDropdown
            class="mt-2 max-h-60 w-full overflow-auto rounded-md border border-ui-border-base bg-ui-bg-base p-1 shadow"
          >
            @for (op of operators; track op.value) {
              <div
                flexSelectOption
                [flexSelectOptionValue]="op.value"
                class="flex cursor-pointer select-none items-center rounded px-2 py-1.5 text-sm text-ui-fg-base outline-none transition-fg data-[active]:bg-ui-bg-subtle-hover data-[selected]:bg-ui-bg-subtle"
              >
                <span>{{ op.label }}</span>
                @if (operator() === op.value) {
                  <span class="ms-auto text-ui-fg-interactive">
                    <i class="pi pi-check text-xs"></i>
                  </span>
                }
              </div>
            }
          </div>
        </div>
      }

      <input
        type="number"
        [placeholder]="placeholder"
        [value]="value()"
        (input)="onValueInput($event)"
        (keydown)="onKeyDown($event)"
        class="h-9 w-full rounded-md border border-ui-border-base bg-ui-bg-base px-2 text-sm text-ui-fg-base shadow-borders-base"
        [attr.autofocus]="includeOperators ? null : true"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableFilterNumberContentComponent {
  @Input({ required: true }) id!: string;
  @Input() filter: unknown;
  @Input() placeholder = 'Enter number...';
  @Input() includeOperators = true;

  @Output() update = new EventEmitter<DataTableFilterUpdateEvent>();

  readonly context = injectDataTableContext();
  readonly operator = signal('eq');
  readonly value = signal('');

  private timeout: ReturnType<typeof setTimeout> | null = null;

  get instance() {
    return this.context.instance;
  }

  readonly operators = [
    { value: 'eq', label: 'Equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater than or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less than or equal' },
  ];

  get selectedOperatorLabel(): string {
    return this.operators.find((op) => op.value === this.operator())?.label ?? 'Equals';
  }

  ngOnInit(): void {
    this.syncFromFilter();
  }

  ngOnChanges(): void {
    this.syncFromFilter();
  }

  onValueInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.handleValueChange(target?.value ?? '');
  }

  handleValueChange(nextValue: string): void {
    this.value.set(nextValue);

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.applyFilterFromValue(nextValue);
    }, 500);
  }

  handleOperatorChange(nextOperator: string): void {
    this.operator.set(nextOperator);
    this.applyFilterFromValue(this.value());
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      return;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.applyFilterFromValue(this.value());
  }

  private applyFilterFromValue(raw: string): void {
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      const operator = this.operator();
      const filterValue = this.includeOperators && operator !== 'eq'
        ? { [`$${operator}`]: num }
        : num;

      this.emitUpdate(filterValue);
      return;
    }

    if (raw === '') {
      this.emitUpdate(undefined);
    }
  }

  private emitUpdate(value: unknown): void {
    if (this.update.observed) {
      this.update.emit({ value });
    } else {
      this.instance.updateFilter({ id: this.id, value });
    }
  }

  private syncFromFilter(): void {
    if (typeof this.filter === 'number') {
      this.operator.set('eq');
      this.value.set(String(this.filter));
      return;
    }

    if (this.filter && typeof this.filter === 'object') {
      const op = Object.keys(this.filter as Record<string, unknown>)[0];
      const value = (this.filter as Record<string, unknown>)[op];
      if (typeof value === 'number') {
        this.operator.set(op.replace('$', ''));
        this.value.set(String(value));
      }
    }
  }
}

@Component({
  selector: 'flex-data-table-filter',
  standalone: true,
  imports: [
    CommonModule,
    FlexPopoverTriggerDirective,
    FlexPopoverDirective,
    DataTableFilterSelectContentComponent,
    DataTableFilterRadioContentComponent,
    DataTableFilterDateContentComponent,
    DataTableFilterMultiselectContentComponent,
    DataTableFilterStringContentComponent,
    DataTableFilterNumberContentComponent,
  ],
  template: `
    @if (!meta) {
      <ng-container></ng-container>
    } @else {
      <div>
        <div
          class="bg-ui-bg-field flex h-8 flex-shrink-0 items-stretch overflow-hidden rounded-md text-xs text-ui-fg-base shadow-borders-base"
        >
          <div
            class="flex items-center whitespace-nowrap px-2 text-ui-fg-muted"
            [class.border-r]="hasValue"
          >
            {{ meta.label || id }}
          </div>
          @if (hasValue && isValueSelectable) {
            <div class="flex items-center border-r px-2 text-ui-fg-muted">is</div>
          }
          @if (hasValue || isNew) {
            <button
              type="button"
              [flexPopoverTrigger]="popover"
              [side]="popoverSide"
              [align]="popoverAlign"
              sideOffset="8"
              [defaultOpen]="isNew"
              (onOpen)="handleOpen()"
              (onClosed)="handleClosed()"
              (onOverlayOutsideClick)="onInteractOutside($event)"
              class="flex min-w-[80px] flex-1 items-center truncate px-2 outline-none transition-fg hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed"
              [ngClass]="valueButtonClass"
            >
              {{ displayValue || '\u00A0' }}
            </button>
          }
          @if (hasValue) {
            <button
              type="button"
              class="flex size-8 items-center justify-center text-ui-fg-muted outline-none transition-fg hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed"
              (click)="removeFilter()"
            >
              <i class="pi pi-times text-xs"></i>
            </button>
          }
        </div>

        <ng-template #popover>
          <div
            flexPopover
            class="bg-ui-bg-component rounded-md border border-ui-border-base p-0 outline-none shadow"
            [attr.data-filter-popover]="id"
          >
            @switch (meta.type) {
              @case ('select') {
                <flex-data-table-filter-select-content
                  [id]="id"
                  [filter]="selectFilterValue"
                  [options]="selectOptions"
                  (update)="emitUpdate($event.value)"
                ></flex-data-table-filter-select-content>
              }
              @case ('radio') {
                <flex-data-table-filter-radio-content
                  [id]="id"
                  [filter]="radioFilterValue"
                  [options]="radioOptions"
                  (update)="emitUpdate($event.value)"
                ></flex-data-table-filter-radio-content>
              }
              @case ('date') {
                <flex-data-table-filter-date-content
                  [id]="id"
                  [filter]="dateFilterValue"
                  [options]="dateOptions"
                  [format]="dateFormat"
                  [rangeOptionLabel]="dateRangeOptionLabel"
                  [rangeOptionStartLabel]="dateRangeOptionStartLabel"
                  [rangeOptionEndLabel]="dateRangeOptionEndLabel"
                  [disableRangeOption]="dateDisableRangeOption"
                  [isCustomRange]="isCustomRange"
                  (update)="emitUpdate($event.value)"
                ></flex-data-table-filter-date-content>
              }
              @case ('multiselect') {
                <flex-data-table-filter-multiselect-content
                  [id]="id"
                  [filter]="multiSelectFilterValue"
                  [options]="multiselectOptions"
                  [searchable]="multiselectSearchable"
                  (update)="emitUpdate($event.value)"
                ></flex-data-table-filter-multiselect-content>
              }
              @case ('string') {
                <flex-data-table-filter-string-content
                  [id]="id"
                  [filter]="stringFilterValue"
                  [placeholder]="stringPlaceholder"
                  (update)="emitUpdate($event.value)"
                ></flex-data-table-filter-string-content>
              }
              @case ('number') {
                <flex-data-table-filter-number-content
                  [id]="id"
                  [filter]="filter"
                  [placeholder]="numberPlaceholder"
                  [includeOperators]="includeNumberOperators"
                  (update)="emitUpdate($event.value)"
                ></flex-data-table-filter-number-content>
              }
              @case ('custom') {
                <ng-container *ngIf="customTemplate; else customComponent">
                  <ng-container
                    *ngTemplateOutlet="customTemplate; context: customContext"
                  ></ng-container>
                </ng-container>
                <ng-template #customComponent>
                  @if (customComponentType) {
                    <ng-container
                      *ngComponentOutlet="customComponentType; inputs: customComponentInputs"
                    ></ng-container>
                  }
                </ng-template>
              }
            }
          </div>
        </ng-template>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableFilterComponent {
  @Input({ required: true }) id!: string;
  @Input() filter: unknown;
  @Input() isNew = false;

  @Output() update = new EventEmitter<DataTableFilterUpdateEvent>();
  @Output() remove = new EventEmitter<void>();

  readonly context = injectDataTableContext();
  readonly hasInteracted = signal(false);

  readonly popoverSide: FlexPopoverSide = 'bottom';
  readonly popoverAlign: FlexPopoverAlign = 'start';

  get instance() {
    return this.context.instance;
  }

  get meta(): DataTableFilterProps | null {
    return this.instance.getFilterMeta(this.id) as DataTableFilterProps | null;
  }

  get selectFilterValue(): string[] {
    return Array.isArray(this.filter) ? (this.filter as string[]) : [];
  }

  get multiSelectFilterValue(): string[] {
    return Array.isArray(this.filter) ? (this.filter as string[]) : [];
  }

  get radioFilterValue(): string | undefined {
    return typeof this.filter === 'string' ? this.filter : undefined;
  }

  get stringFilterValue(): string | undefined {
    return typeof this.filter === 'string' ? this.filter : undefined;
  }

  get dateFilterValue(): unknown {
    return this.filter;
  }

  get selectOptions(): DataTableFilterOption[] {
    return this.meta?.type === 'select' ? this.meta.options ?? [] : [];
  }

  get radioOptions(): DataTableFilterOption[] {
    return this.meta?.type === 'radio' ? this.meta.options ?? [] : [];
  }

  get dateOptions(): DataTableFilterOption<DataTableDateComparisonOperator>[] {
    return this.meta?.type === 'date' ? this.meta.options ?? [] : [];
  }

  get multiselectOptions(): DataTableFilterOption[] {
    return this.meta?.type === 'multiselect' ? this.meta.options ?? [] : [];
  }

  get multiselectSearchable(): boolean {
    return this.meta?.type === 'multiselect'
      ? this.meta.searchable ?? true
      : true;
  }

  get stringPlaceholder(): string {
    return this.meta?.type === 'string'
      ? this.meta.placeholder ?? 'Enter value...'
      : 'Enter value...';
  }

  get numberPlaceholder(): string {
    return this.meta?.type === 'number'
      ? this.meta.placeholder ?? 'Enter number...'
      : 'Enter number...';
  }

  get includeNumberOperators(): boolean {
    return this.meta?.type === 'number'
      ? this.meta.includeOperators ?? true
      : true;
  }

  get dateFormat(): 'date' | 'date-time' {
    return this.meta?.type === 'date' ? this.meta.format ?? 'date' : 'date';
  }

  get dateRangeOptionLabel(): string | undefined {
    return this.meta?.type === 'date' ? this.meta.rangeOptionLabel : undefined;
  }

  get dateRangeOptionStartLabel(): string | undefined {
    return this.meta?.type === 'date' ? this.meta.rangeOptionStartLabel : undefined;
  }

  get dateRangeOptionEndLabel(): string | undefined {
    return this.meta?.type === 'date' ? this.meta.rangeOptionEndLabel : undefined;
  }

  get dateDisableRangeOption(): boolean {
    return this.meta?.type === 'date' ? this.meta.disableRangeOption ?? false : false;
  }

  get hasValue(): boolean {
    const filter = this.filter;

    if (filter === null || filter === undefined) {
      return false;
    }

    if (typeof filter === 'string') {
      return filter.trim().length > 0;
    }

    if (Array.isArray(filter)) {
      return filter.length > 0;
    }

    if (typeof filter === 'number') {
      return true;
    }

    if (isDateComparisonOperator(filter)) {
      return Boolean(filter.$gte || filter.$lte || filter.$gt || filter.$lt);
    }

    if (typeof filter === 'object') {
      const keys = Object.keys(filter as Record<string, unknown>);
      return keys.length > 0;
    }

    return true;
  }

  get isValueSelectable(): boolean {
    return (
      this.meta?.type === 'select' ||
      this.meta?.type === 'multiselect' ||
      this.meta?.type === 'radio'
    );
  }

  get valueButtonClass(): Record<string, boolean> {
    return {
      'text-ui-fg-subtle': Boolean(this.displayValue),
      'text-ui-fg-muted': !this.displayValue,
      'min-w-[80px] justify-center': !this.displayValue,
      'border-r': true,
    };
  }

  get displayValue(): string | null {
    const meta = this.meta;
    if (!meta) {
      return null;
    }

    const filter = this.filter;
    const options = (meta as { options?: DataTableFilterOption[] }).options ?? [];

    if (typeof filter === 'string') {
      if (!options.length) {
        return filter;
      }
      return options.find((option) => option.value === filter)?.label ?? null;
    }

    if (typeof filter === 'number') {
      return String(filter);
    }

    if (Array.isArray(filter)) {
      return (
        filter
          .map((value) => options.find((option) => option.value === value)?.label)
          .filter(Boolean)
          .join(', ') || null
      );
    }

    if (isDateComparisonOperator(filter)) {
      const matching = options.find((option) => {
        if (!isDateComparisonOperator(option.value)) {
          return false;
        }

        return (
          (filter.$gte === option.value.$gte || (!filter.$gte && !option.value.$gte)) &&
          (filter.$lte === option.value.$lte || (!filter.$lte && !option.value.$lte)) &&
          (filter.$gt === option.value.$gt || (!filter.$gt && !option.value.$gt)) &&
          (filter.$lt === option.value.$lt || (!filter.$lt && !option.value.$lt))
        );
      });

      if (matching?.label) {
        return matching.label;
      }

      if (meta.type === 'date') {
        const formatDateValue =
          (meta as DataTableDateFilterProps).formatDateValue ??
          ((value: Date) =>
            value.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }));

        if (filter.$gte && !filter.$lte) {
          return `${(meta as DataTableDateFilterProps).rangeOptionStartLabel ?? 'Starting'} ${formatDateValue(
            new Date(filter.$gte)
          )}`;
        }

        if (filter.$lte && !filter.$gte) {
          return `${(meta as DataTableDateFilterProps).rangeOptionEndLabel ?? 'Ending'} ${formatDateValue(
            new Date(filter.$lte)
          )}`;
        }

        if (filter.$gte && filter.$lte) {
          return `${formatDateValue(new Date(filter.$gte))} - ${formatDateValue(
            new Date(filter.$lte)
          )}`;
        }
      }
    }

    if (typeof filter === 'object' && filter !== null && !Array.isArray(filter)) {
      const operators: Record<string, string> = {
        $eq: '=',
        $gt: '>',
        $gte: '>=',
        $lt: '<',
        $lte: '<=',
      };

      const op = Object.keys(filter as Record<string, unknown>)[0];
      const value = (filter as DataTableNumberComparisonOperator)[op as keyof DataTableNumberComparisonOperator];
      if (typeof value === 'number') {
        return `${operators[op] ?? op} ${value}`;
      }
    }

    return null;
  }

  get isCustomRange(): boolean {
    const meta = this.meta;
    if (!meta || meta.type !== 'date') {
      return false;
    }

    if (!isDateComparisonOperator(this.filter)) {
      return false;
    }

    const options = meta.options ?? [];
    return !options.some((option) => {
      if (!isDateComparisonOperator(option.value)) {
        return false;
      }

      return (
        (this.filter as DataTableDateComparisonOperator).$gte === option.value.$gte &&
        (this.filter as DataTableDateComparisonOperator).$lte === option.value.$lte &&
        (this.filter as DataTableDateComparisonOperator).$gt === option.value.$gt &&
        (this.filter as DataTableDateComparisonOperator).$lt === option.value.$lt
      );
    });
  }

  get customTemplate(): TemplateRef<DataTableCustomFilterContext> | null {
    const meta = this.meta as DataTableCustomFilterProps | undefined;
    return meta?.template ?? null;
  }

  get customComponentType(): DataTableCustomFilterProps['component'] | null {
    const meta = this.meta as DataTableCustomFilterProps | undefined;
    return meta?.component ?? null;
  }

  get customComponentInputs(): Record<string, unknown> {
    const meta = this.meta as DataTableCustomFilterProps | undefined;
    return {
      ...(meta?.componentInputs ?? {}),
      value: this.filter,
      onChange: (value: unknown) => this.emitUpdate(value),
      onRemove: () => this.removeFilter(),
    };
  }

  get customContext(): DataTableCustomFilterContext {
    return {
      value: this.filter,
      onChange: (value) => this.emitUpdate(value),
      onRemove: () => this.removeFilter(),
    };
  }

  handleOpen(): void {
    if (this.isNew) {
      setTimeout(() => {
        const target = document.querySelector(
          `[data-filter-popover="${this.id}"] input:not([type="hidden"]), [data-filter-popover="${this.id}"] [role="list"][tabindex="0"]`
        ) as HTMLElement | null;
        target?.focus();
      }, 0);
    }
  }

  handleClosed(): void {
    const hasValue = this.hasValue;
    const hasInteracted = this.hasInteracted();

    if (!hasValue) {
      if ((this.isNew && !hasInteracted) || !this.isNew) {
        this.removeFilter();
      }
    }

    this.hasInteracted.set(true);
  }

  onInteractOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('[role="menuitem"], [role="option"]')) {
      event.preventDefault();
    }
  }

  emitUpdate(value: unknown): void {
    if (this.update.observed) {
      this.update.emit({ value });
      return;
    }

    this.instance.updateFilter({ id: this.id, value });
  }

  removeFilter(): void {
    if (this.remove.observed) {
      this.remove.emit();
      return;
    }

    this.instance.removeFilter(this.id);
  }
}
