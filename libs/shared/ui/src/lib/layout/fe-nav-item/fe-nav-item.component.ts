import { Component, Input, signal, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

export interface NavItemConfig {
    label: string;
    route?: string;
    icon?: string; // HTML string for SVG or class name if using font icons
    children?: NavItemConfig[];
    isExact?: boolean;
}

@Component({
    selector: 'fe-nav-item',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    template: `
    <div class="px-3">
        <!-- Base Item -->
        <a *ngIf="!hasChildren" 
           [routerLink]="item.route" 
           [routerLinkActive]="['bg-ui-bg-base', 'shadow-elevation-card-rest', 'text-ui-fg-base', 'hover:bg-ui-bg-base']"
           [routerLinkActiveOptions]="{exact: item.isExact ?? false}"
           class="text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover flex items-center gap-x-2 rounded-md py-0.5 pl-0.5 pr-2 outline-none [&>svg]:text-ui-fg-subtle focus-visible:shadow-borders-focus cursor-pointer">
            <div *ngIf="item.icon" class="flex size-6 items-center justify-center" [innerHTML]="item.icon"></div>
            <span class="text-small-plus leading-compact">{{ item.label }}</span>
        </a>

        <!-- Parent Item (Collapsible) -->
        <div *ngIf="hasChildren" class="flex flex-col">
            <button (click)="toggle()"
                    [class.text-ui-fg-base]="hasActiveChild()"
                    class="text-ui-fg-subtle hover:text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover flex w-full items-center gap-x-2 rounded-md py-0.5 pl-0.5 pr-2 outline-none cursor-pointer">
                <div *ngIf="item.icon" class="flex size-6 items-center justify-center" [innerHTML]="item.icon"></div>
                <span class="text-small-plus leading-compact">{{ item.label }}</span>
                <!-- Optional chevron could go here -->
            </button>

            <!-- Children List -->
            <div *ngIf="isOpen()" class="flex flex-col gap-y-0.5 pb-2 pt-0.5">
                <a *ngFor="let child of item.children"
                   [routerLink]="child.route"
                   routerLinkActive="bg-ui-bg-base shadow-elevation-card-rest text-ui-fg-base hover:bg-ui-bg-base"
                   class="pl-[34px] pr-2 py-1 w-full text-ui-fg-muted transition-fg hover:bg-ui-bg-subtle-hover flex items-center gap-x-2 rounded-md outline-none focus-visible:shadow-borders-focus cursor-pointer">
                   <span class="text-small-plus leading-compact">{{ child.label }}</span>
                </a>
            </div>
        </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class FeNavItemComponent implements OnChanges {
    @Input({ required: true }) item!: NavItemConfig;

    private router = inject(Router);

    // Track current url to auto-open
    private currentUrl = toSignal(
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
        ),
        { initialValue: null }
    );

    isOpen = signal(false);

    hasChildren = false;

    ngOnChanges() {
        this.hasChildren = !!this.item.children?.length;

        // Auto expand if child is active on init or change
        if (this.hasChildren && this.hasActiveChild()) {
            this.isOpen.set(true);
        }
    }

    constructor() {
        // Effect equivalent to check active state on route change logic can be added if needed,
        // but simplified approach:
    }

    hasActiveChild(): boolean {
        if (!this.item.children) return false;
        const url = this.router.url;
        return this.item.children.some(child => child.route && url.includes(child.route));
    }

    toggle() {
        this.isOpen.update(v => !v);
    }
}
