import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { injectDataTableContext } from '../data-table-context';
import { DataTableCommand, DataTableRowSelectionState } from '../types';

@Component({
  selector: 'flex-data-table-command-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div
          class="pointer-events-auto flex flex-wrap items-center gap-2 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-xs text-ui-fg-base shadow-elevation-commandbar"
          [class]="className"
        >
          @if (selectedText) {
            <span class="text-ui-fg-subtle">{{ selectedText }}</span>
            <span class="h-4 w-px bg-ui-border-base"></span>
          }

          @for (command of commands; track command.label; let isLast = $last) {
            <button
              type="button"
              class="flex items-center gap-2 rounded px-1.5 py-1 text-ui-fg-base transition-fg hover:bg-ui-bg-base-hover"
              (click)="runCommand(command)"
            >
              <span>{{ command.label }}</span>
              <kbd
                class="rounded border border-ui-border-base bg-ui-bg-subtle px-1.5 py-0.5 text-[10px] text-ui-fg-subtle"
              >
                {{ command.shortcut }}
              </kbd>
            </button>
            @if (!isLast) {
              <span class="h-4 w-px bg-ui-border-base"></span>
            }
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableCommandBarComponent {
  @Input() className = '';
  @Input() selectedLabel?: ((count: number) => string) | string;

  readonly context = injectDataTableContext();

  get instance() {
    return this.context.instance;
  }

  get commands(): DataTableCommand[] {
    return this.instance.getCommands();
  }

  get selection(): DataTableRowSelectionState {
    return this.instance.getRowSelection() ?? {};
  }

  get selectionCount(): number {
    return Object.keys(this.selection).length;
  }

  get open(): boolean {
    return this.commands.length > 0 && this.selectionCount > 0;
  }

  get selectedText(): string | null {
    if (!this.selectedLabel) {
      return null;
    }

    if (typeof this.selectedLabel === 'function') {
      return this.selectedLabel(this.selectionCount);
    }

    return this.selectedLabel;
  }

  runCommand(command: DataTableCommand): void {
    const selection = this.selection;
    void command.action(selection);
  }
}
