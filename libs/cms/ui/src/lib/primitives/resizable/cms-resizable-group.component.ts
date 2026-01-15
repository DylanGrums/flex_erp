import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  DestroyRef,
  Input,
  NgZone,
  QueryList,
  inject,
} from '@angular/core';
import { CmsResizableHandleComponent } from './cms-resizable-handle.component';
import { CmsResizablePanelComponent } from './cms-resizable-panel.component';

@Component({
  selector: 'cms-resizable-group',
  standalone: true,
  template: `
    <div [class]="groupClass">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        @apply flex h-full w-full;
      }
    `,
  ],
})
export class CmsResizableGroupComponent implements AfterContentInit {
  @Input() className = '';

  @ContentChildren(CmsResizablePanelComponent) panels!: QueryList<CmsResizablePanelComponent>;
  @ContentChildren(CmsResizableHandleComponent) handles!: QueryList<CmsResizableHandleComponent>;

  private ngZone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  private activeResize: {
    handleIndex: number;
    startX: number;
    startBefore: number;
    startAfter: number;
  } | null = null;

  get groupClass(): string {
    const base = 'flex h-full w-full overflow-hidden';
    return [base, this.className].filter(Boolean).join(' ');
  }

  ngAfterContentInit(): void {
    this.syncPanels();
    this.syncHandles();

    this.panels.changes.subscribe(() => this.syncPanels());
    this.handles.changes.subscribe(() => this.syncHandles());
  }

  startResize(handleIndex: number, event: PointerEvent): void {
    const panels = this.panels.toArray();
    const before = panels[handleIndex];
    const after = panels[handleIndex + 1];
    if (!before || !after) return;

    const beforeWidth = before.elementRef.nativeElement.getBoundingClientRect().width;
    const afterWidth = after.elementRef.nativeElement.getBoundingClientRect().width;

    this.activeResize = {
      handleIndex,
      startX: event.clientX,
      startBefore: beforeWidth,
      startAfter: afterWidth,
    };

    event.preventDefault();
    event.stopPropagation();

    this.ngZone.runOutsideAngular(() => {
      const onMove = (moveEvent: PointerEvent) => this.onPointerMove(moveEvent);
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        this.onPointerUp();
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      });
    });
  }

  private onPointerMove(event: PointerEvent): void {
    if (!this.activeResize) return;
    const panels = this.panels.toArray();
    const before = panels[this.activeResize.handleIndex];
    const after = panels[this.activeResize.handleIndex + 1];
    if (!before || !after) return;

    const delta = event.clientX - this.activeResize.startX;
    const beforeFixed = !before.flex;
    const afterFixed = !after.flex;

    if (beforeFixed && afterFixed) {
      const total = this.activeResize.startBefore + this.activeResize.startAfter;
      const nextBefore = clamp(
        this.activeResize.startBefore + delta,
        before.minPx,
        total - after.minPx
      );
      const nextAfter = total - nextBefore;
      before.setSize(nextBefore);
      after.setSize(nextAfter);
      return;
    }

    if (beforeFixed) {
      const nextBefore = clamp(this.activeResize.startBefore + delta, before.minPx, Infinity);
      before.setSize(nextBefore);
      return;
    }

    if (afterFixed) {
      const nextAfter = clamp(this.activeResize.startAfter - delta, after.minPx, Infinity);
      after.setSize(nextAfter);
    }
  }

  private onPointerUp(): void {
    this.activeResize = null;
  }

  private syncPanels(): void {
    this.panels.forEach((panel, index) => {
      panel.setIndex(index);
      if (!panel.flex && panel.defaultPx != null) {
        panel.setSize(panel.defaultPx);
      }
    });
  }

  private syncHandles(): void {
    this.handles.forEach((handle, index) => handle.setIndex(index));
  }
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
