import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FlexDialogComponent, FlexDialogMode } from '@flex-erp/shared/ui';

@Component({
  selector: 'cms-dialog',
  standalone: true,
  imports: [FlexDialogComponent],
  template: `
    <flex-dialog
      [open]="open"
      (openChange)="openChange.emit($event)"
      [modal]="modal"
      [mode]="mode"
      [contentClass]="contentClass"
      [panelClasses]="panelClasses"
      [backdropClass]="backdropClass"
    >
      <ng-content></ng-content>
    </flex-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsDialogComponent {
  @Input() open = false;
  @Input() modal = true;
  @Input() mode: FlexDialogMode = 'default';
  @Input()
  contentClass =
    'w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-lg';
  @Input() panelClasses: string[] = [];
  @Input() backdropClass: string | string[] = 'bg-black/40';

  @Output() openChange = new EventEmitter<boolean>();
}
