import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input,
  inject,
} from '@angular/core';

@Component({
  selector: 'cms-resizable-panel',
  standalone: true,
  template: ` <ng-content></ng-content> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsResizablePanelComponent {
  @Input() minPx = 200;
  @Input() defaultPx: number | null = null;
  @Input() flex = false;

  widthPx: number | null = null;
  private index = 0;

  elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostBinding('class')
  hostClass = 'flex flex-col h-full min-h-0 min-w-0 flex-1';

  @HostBinding('style.flex')
  get flexStyle(): string {
    if (this.flex) return '1 1 0%';
    if (this.widthPx != null) return `0 0 ${this.widthPx}px`;
    if (this.defaultPx != null) return `0 0 ${this.defaultPx}px`;
    return '0 0 auto';
  }

  @HostBinding('style.width.px')
  get hostWidthPx(): number | null {
    return this.widthPx;
  }

  setIndex(index: number): void {
    this.index = index;
  }

  setSize(width: number): void {
    this.widthPx = width;
  }
}
