import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  booleanAttribute,
  effect,
  inject,
  numberAttribute,
} from '@angular/core';
import { NgpOffset } from 'ng-primitives/portal';
import {
  NgpPopover,
  NgpPopoverPlacement,
  NgpPopoverTrigger,
} from 'ng-primitives/popover';

export type FlexPopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type FlexPopoverAlign = 'start' | 'center' | 'end';

@Directive({
  selector: '[flexPopoverTrigger]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgpPopoverTrigger,
      inputs: [
        'ngpPopoverTrigger:flexPopoverTrigger',
        'ngpPopoverTriggerPlacement:placement',
        'ngpPopoverTriggerOffset:resolvedOffset',
        'ngpPopoverTriggerCloseOnOutsideClick:closeOnOutsideClick',
      ],
    },
  ],
})
export class FlexPopoverTriggerDirective {
  private readonly trigger = inject(NgpPopoverTrigger);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  private removeOutsideListener: (() => void) | null = null;
  private lastOpen = false;
  private defaultOpened = false;

  @Input() flexPopoverTrigger?: unknown;
  @Input({ transform: booleanAttribute }) defaultOpen = false;
  @Input() side: FlexPopoverSide = 'bottom';
  @Input() align: FlexPopoverAlign = 'center';
  @Input({ transform: numberAttribute }) sideOffset = 0;
  @Input() offset?: NgpOffset;

  @Output() onOpen = new EventEmitter<void>();
  @Output() onClosed = new EventEmitter<void>();
  @Output() onOverlayOutsideClick = new EventEmitter<MouseEvent>();

  readonly closeOnOutsideClick = false;

  constructor() {
    effect(
      () => {
        const open = this.trigger.open();
        if (open === this.lastOpen) {
          return;
        }

        this.lastOpen = open;
        if (open) {
          this.onOpen.emit();
          this.bindOutsideListener();
          return;
        }

        this.onClosed.emit();
        this.unbindOutsideListener();
      },
      { injector: this.injector }
    );
  }

  ngAfterViewInit(): void {
    this.openDefaultIfNeeded();
  }

  ngOnChanges(): void {
    this.openDefaultIfNeeded();
  }

  ngOnDestroy(): void {
    this.unbindOutsideListener();
  }

  get placement(): NgpPopoverPlacement {
    if (this.align === 'center') {
      return this.side;
    }

    return `${this.side}-${this.align}` as NgpPopoverPlacement;
  }

  get resolvedOffset(): NgpOffset {
    return this.offset ?? this.sideOffset;
  }

  private openDefaultIfNeeded(): void {
    if (!this.defaultOpen || this.defaultOpened) {
      return;
    }

    this.defaultOpened = true;
    queueMicrotask(() => {
      void this.trigger.show();
    });
  }

  private bindOutsideListener(): void {
    if (this.removeOutsideListener) {
      return;
    }

    const handler = (event: MouseEvent) => this.handleOutsideClick(event);
    this.document.addEventListener('pointerdown', handler, true);
    this.removeOutsideListener = () =>
      this.document.removeEventListener('pointerdown', handler, true);
  }

  private unbindOutsideListener(): void {
    this.removeOutsideListener?.();
    this.removeOutsideListener = null;
  }

  private handleOutsideClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) {
      return;
    }

    const host = this.elementRef.nativeElement;
    if (host.contains(target)) {
      return;
    }

    const overlay = this.trigger.overlay();
    const overlayElements = overlay?.getElements() ?? [];
    if (overlayElements.some((el) => el.contains(target))) {
      return;
    }

    this.onOverlayOutsideClick.emit(event);
    if (event.defaultPrevented) {
      return;
    }

    overlay?.hide({ origin: 'mouse' });
  }
}

@Directive({
  selector: '[flexPopover]',
  standalone: true,
  hostDirectives: [NgpPopover],
})
export class FlexPopoverDirective {}
