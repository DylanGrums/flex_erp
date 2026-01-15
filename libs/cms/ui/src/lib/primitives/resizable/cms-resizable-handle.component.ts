import { ChangeDetectionStrategy, Component, HostBinding, HostListener, inject } from '@angular/core';
import { CmsResizableGroupComponent } from './cms-resizable-group.component';

@Component({
  selector: 'cms-resizable-handle',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsResizableHandleComponent {
  private index = 0;

  private group = inject(CmsResizableGroupComponent);

  @HostBinding('class')
  hostClass =
    'h-full w-1.5 flex-shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-ui-bg-subtle-hover';

  setIndex(index: number): void {
    this.index = index;
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    this.group.startResize(this.index, event);
  }
}
