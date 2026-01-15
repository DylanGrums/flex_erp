import { ChangeDetectionStrategy, Component, ElementRef, Input, inject } from '@angular/core';

@Component({
  selector: 'cms-resizable-panel',
  standalone: true,
  template: `
    <div [style.flex]="flexStyle" [style.width.px]="widthPx">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmsResizablePanelComponent {
  @Input() minPx = 200;
  @Input() defaultPx: number | null = null;
  @Input() flex = false;

  widthPx: number | null = null;
  private index = 0;

  elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  get flexStyle(): string {
    if (this.flex) return '1 1 0%';
    if (this.widthPx != null) return `0 0 ${this.widthPx}px`;
    if (this.defaultPx != null) return `0 0 ${this.defaultPx}px`;
    return '0 0 auto';
  }

  setIndex(index: number): void {
    this.index = index;
  }

  setSize(width: number): void {
    this.widthPx = width;
  }
}
