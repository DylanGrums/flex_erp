import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { NgpDialog, NgpDialogManager, NgpDialogOverlay, NgpDialogRef } from 'ng-primitives/dialog';

export type FlexDialogMode =
  | 'default'
  | 'sheet'
  | 'sheet-bottom'
  | 'sheet-top'
  | 'sheet-left'
  | 'sheet-right'
  | 'fullscreen';

@Component({
  selector: 'flex-dialog',
  standalone: true,
  imports: [NgpDialogOverlay, NgpDialog],
  template: `
    <ng-template #dialogTemplate>
      <div
        ngpDialogOverlay
        [ngpDialogOverlayCloseOnClick]="modal"
        [class]="overlayClass"
      >
        <div ngpDialog [ngpDialogModal]="modal" [class]="panelClass">
          <ng-content></ng-content>
        </div>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexDialogComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('dialogTemplate', { static: true }) dialogTemplate!: TemplateRef<unknown>;

  @Input() open = false;
  @Input() modal = true;
  @Input() mode: FlexDialogMode = 'default';
  @Input()
  contentClass =
    'w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-lg';
  @Input() panelClasses: string[] = [];
  @Input() backdropClass: string | string[] = 'bg-black/40';

  @Output() openChange = new EventEmitter<boolean>();

  private dialogRef: NgpDialogRef<unknown, unknown> | null = null;
  private readonly dialogManager = inject(NgpDialogManager);

  ngAfterViewInit(): void {
    if (this.open) {
      this.openDialog();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.dialogTemplate || !changes['open']) {
      return;
    }

    if (this.open) {
      this.openDialog();
      return;
    }

    this.closeDialog();
  }

  ngOnDestroy(): void {
    this.closeDialog();
  }

  get overlayClass(): string {
    const base = 'fixed inset-0 z-50 flex';
    const modeClass = this.getModeOverlayClass();
    const backdrop = Array.isArray(this.backdropClass)
      ? this.backdropClass.join(' ')
      : this.backdropClass;

    return [base, modeClass, backdrop].filter(Boolean).join(' ');
  }

  get panelClass(): string {
    const panel = this.panelClasses.length ? this.panelClasses.join(' ') : '';
    const fullscreen =
      this.mode === 'fullscreen'
        ? 'w-screen h-screen max-w-none max-h-none rounded-none border-0'
        : '';
    return [this.contentClass, panel, fullscreen].filter(Boolean).join(' ');
  }

  private getModeOverlayClass(): string {
    switch (this.mode) {
      case 'sheet':
      case 'sheet-right':
        return 'items-stretch justify-end';
      case 'sheet-left':
        return 'items-stretch justify-start';
      case 'sheet-top':
        return 'items-start justify-center';
      case 'sheet-bottom':
        return 'items-end justify-center';
      case 'fullscreen':
        return 'items-stretch justify-center';
      case 'default':
      default:
        return 'items-center justify-center';
    }
  }

  private openDialog(): void {
    if (this.dialogRef) {
      return;
    }

    this.dialogRef = this.dialogManager.open(this.dialogTemplate as TemplateRef<any>, {
      modal: this.modal,
      closeOnClick: this.modal,
      closeOnEscape: true,
    });

    this.dialogRef.closed.subscribe(() => {
      this.dialogRef = null;
      if (this.open) {
        this.openChange.emit(false);
      }
    });
  }

  private closeDialog(): void {
    if (!this.dialogRef) {
      return;
    }

    this.dialogRef.close();
    this.dialogRef = null;
  }
}
