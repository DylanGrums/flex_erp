import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  effect,
  inject,
  signal,
} from '@angular/core';

let collapsibleId = 0;

@Directive({
  selector: '[flexCollapsibleRoot]',
  standalone: true,
})
export class FlexCollapsibleRootDirective {
  private readonly viewId = ++collapsibleId;

  @Input({ transform: booleanAttribute }) open = false;
  @Input({ transform: booleanAttribute }) disabled = false;

  @Output() openChange = new EventEmitter<boolean>();

  readonly openState = signal(false);

  @HostBinding('attr.data-state')
  get dataState(): string {
    return this.openState() ? 'open' : 'closed';
  }

  readonly contentId = `flex-collapsible-content-${this.viewId}`;

  ngOnChanges(): void {
    this.openState.set(this.open);
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }

    const next = !this.openState();
    this.openState.set(next);
    this.openChange.emit(next);
  }
}

@Directive({
  selector: '[flexCollapsibleTrigger]',
  standalone: true,
})
export class FlexCollapsibleTriggerDirective {
  private readonly root = inject(FlexCollapsibleRootDirective);

  @HostBinding('attr.aria-expanded')
  get ariaExpanded(): string {
    return this.root.openState() ? 'true' : 'false';
  }

  @HostBinding('attr.aria-controls')
  get ariaControls(): string {
    return this.root.contentId;
  }

  @HostBinding('attr.data-state')
  get dataState(): string {
    return this.root.openState() ? 'open' : 'closed';
  }

  @HostListener('click')
  handleClick(): void {
    this.root.toggle();
  }
}

@Directive({
  selector: '[flexCollapsibleContent]',
  standalone: true,
})
export class FlexCollapsibleContentDirective {
  private readonly root = inject(FlexCollapsibleRootDirective);

  @HostBinding('attr.id')
  get id(): string {
    return this.root.contentId;
  }

  @HostBinding('attr.data-state')
  get dataState(): string {
    return this.root.openState() ? 'open' : 'closed';
  }

  @HostBinding('attr.hidden')
  get hidden(): '' | null {
    return this.root.openState() ? null : '';
  }
}

@Directive({
  selector: '[flexCollapsibleContentPresence]',
  standalone: true,
})
export class FlexCollapsibleContentPresenceDirective {
  private readonly root = inject(FlexCollapsibleRootDirective);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private hasView = false;

  constructor() {
    effect(() => {
      const open = this.root.openState();
      if (open && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
        return;
      }

      if (!open && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
