import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'fe-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TranslocoModule],
  template: `
    <p-dialog 
      [(visible)]="open" 
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{ width: '400px' }"
      (onHide)="canceled.emit()"
      [header]="title | transloco"
      styleClass="medusa-dialog"
    >
      <div class="flex flex-col gap-4">
        <p class="text-sm text-ui-fg-subtle">
          {{ description | transloco }}
        </p>
        
        <div class="flex justify-end gap-2 pt-2">
          <button 
            pButton 
            class="p-button-secondary !h-8 !px-3"
            (click)="onCancel()"
          >
            <span>{{ cancelText | transloco }}</span>
          </button>
          
          <button 
            pButton 
            [class.p-button-danger]="severity === 'danger'"
            class="!h-8 !px-3"
            (click)="onConfirm()"
          >
            <span>{{ confirmText | transloco }}</span>
          </button>
        </div>
      </div>
    </p-dialog>
  `
})
export class FeConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'common.confirmTitle';
  @Input() description = 'common.confirmDescription';
  @Input() confirmText = 'common.delete';
  @Input() cancelText = 'common.cancel';
  @Input() severity: 'danger' | 'default' = 'danger';

  readonly confirmed = output<void>();
  readonly canceled = output<void>();
  readonly openChange = output<boolean>();

  onCancel() {
    this.open = false;
    this.openChange.emit(false);
    this.canceled.emit();
  }

  onConfirm() {
    this.open = false;
    this.openChange.emit(false);
    this.confirmed.emit();
  }
}
