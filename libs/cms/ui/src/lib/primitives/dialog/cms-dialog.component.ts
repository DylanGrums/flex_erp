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
import { RdxDialogModule, RdxDialogRef, RdxDialogService } from '@radix-ng/primitives/dialog';

@Component({
  selector: 'cms-dialog',
  standalone: true,
  imports: [RdxDialogModule],
  template: `
    <ng-template #dialogTemplate>
      <div rdxDialogContent [class]="contentClass">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsDialogComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('dialogTemplate', { static: true }) dialogTemplate!: TemplateRef<unknown>;

  @Input() open = false;
  @Input() modal = true;
  @Input() mode: 'default' | 'sheet' | 'sheet-bottom' | 'sheet-top' | 'sheet-left' | 'sheet-right' = 'default';
  @Input() contentClass =
    'w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-lg';
  @Input() panelClasses: string[] = [];
  @Input() backdropClass: string | string[] = 'bg-black/40';

  @Output() openChange = new EventEmitter<boolean>();

  private dialogRef: RdxDialogRef<unknown> | null = null;

  private dialogService = inject(RdxDialogService);

  ngAfterViewInit(): void {
    if (this.open) {
      this.openDialog();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.dialogTemplate || !changes['open']) return;
    if (this.open) {
      this.openDialog();
    } else {
      this.closeDialog();
    }
  }

  ngOnDestroy(): void {
    this.closeDialog();
  }

  private openDialog(): void {
    if (this.dialogRef) return;
    this.dialogRef = this.dialogService.open({
      content: this.dialogTemplate,
      modal: this.modal,
      mode: this.mode,
      backdropClass: this.backdropClass,
      panelClasses: this.panelClasses,
    });

    this.dialogRef.closed$.subscribe(() => {
      this.dialogRef = null;
      if (this.open) {
        this.openChange.emit(false);
      }
    });
  }

  private closeDialog(): void {
    if (!this.dialogRef) return;
    this.dialogRef.dismiss();
    this.dialogRef = null;
  }
}
