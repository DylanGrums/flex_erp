import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CmsDialogComponent } from '../dialog/cms-dialog.component';

@Component({
  selector: 'cms-sheet',
  standalone: true,
  imports: [CmsDialogComponent],
  template: `
    <cms-dialog
      [open]="open"
      (openChange)="openChange.emit($event)"
      [modal]="modal"
      [mode]="mode"
      [contentClass]="contentClass"
      [panelClasses]="panelClasses"
      [backdropClass]="backdropClass"
    >
      <ng-content></ng-content>
    </cms-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsSheetComponent {
  @Input() open = false;
  @Input() modal = true;
  @Input() mode: 'sheet' | 'sheet-bottom' | 'sheet-top' | 'sheet-left' | 'sheet-right' = 'sheet-right';
  @Input() contentClass = 'w-full max-w-md h-full bg-ui-bg-base shadow-lg';
  @Input() panelClasses: string[] = [];
  @Input() backdropClass: string | string[] = 'bg-black/40';

  @Output() openChange = new EventEmitter<boolean>();
}
