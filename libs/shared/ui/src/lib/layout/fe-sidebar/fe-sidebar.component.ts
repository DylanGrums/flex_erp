import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeNavItemComponent, NavItemConfig } from '../fe-nav-item/fe-nav-item.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'fe-sidebar',
    standalone: true,
    imports: [CommonModule, FeNavItemComponent, RouterLink],
    template: `
    <aside class="flex h-full flex-col justify-between overflow-y-auto bg-ui-bg-subtle border-r border-ui-border-base w-[220px]">
      <div class="flex flex-1 flex-col h-full">
        <!-- Sticky Header (Store / Workspace) -->
        <div class="bg-ui-bg-subtle sticky top-0 z-10">
          <div class="p-3">
             <!-- Simplified Store Switcher Placeholder -->
             <div class="bg-ui-bg-subtle transition-fg hover:bg-ui-bg-subtle-hover grid w-full grid-cols-[24px_1fr_15px] items-center gap-x-3 rounded-md p-0.5 pe-2 outline-none cursor-pointer">
                <div class="h-6 w-6 rounded-md bg-ui-bg-base border border-ui-border-base flex items-center justify-center">
                    <span class="text-xs font-medium">S</span>
                </div>
                <div class="block overflow-hidden text-start">
                    <span class="text-small-plus leading-compact truncate block">Medusa Store</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-ui-fg-muted">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
             </div>
          </div>
          <div class="px-3">
            <div class="border-t border-dashed border-ui-border-base h-px w-full"></div>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex flex-1 flex-col justify-between">
            <div class="flex flex-1 flex-col py-3 gap-y-1">
                <!-- Search Mock -->
                 <div class="px-3">
                    <button class="bg-ui-bg-subtle text-ui-fg-subtle hover:bg-ui-bg-subtle-hover flex w-full items-center gap-x-2.5 rounded-md px-2 py-1 outline-none border border-transparent focus-visible:border-ui-border-interactive">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 1.879l-3.147 3.147a1 1 0 01-1.414 0l-3.147-3.147A7 7 0 012 9z" clip-rule="evenodd" />
                        </svg>
                         <span class="text-small-plus leading-compact flex-1 text-start">Search</span>
                         <span class="text-small leading-compact text-ui-fg-muted">⌘K</span>
                    </button>
                 </div>

                <!-- Navigation Items -->
                 <div class="mt-2 flex flex-col gap-y-1">
                     <ng-container *ngFor="let group of groups">
                        <div *ngIf="group.title" class="px-3 py-2 text-ui-fg-muted text-xs font-semibold uppercase tracking-wider">
                            {{ group.title }}
                        </div>
                        <fe-nav-item *ngFor="let item of group.items" [item]="item"></fe-nav-item>
                     </ng-container>
                 </div>
            </div>

            <!-- Utility Section -->
            <div class="flex flex-col gap-y-0.5 py-3">
                 <fe-nav-item [item]="settingsItem"></fe-nav-item>
            </div>
        </div>

        <!-- Sticky Bottom User Section -->
         <div class="bg-ui-bg-subtle sticky bottom-0 z-10">
            <div class="px-3">
                <div class="border-t border-dashed border-ui-border-base h-px w-full"></div>
            </div>
            <div class="p-3">
                 <div class="flex items-center gap-x-3 p-1 rounded-md hover:bg-ui-bg-subtle-hover cursor-pointer transition-colors">
                    <div class="h-6 w-6 rounded bg-ui-bg-base border border-ui-border-base flex items-center justify-center text-xs">U</div>
                    <div class="flex flex-col overflow-hidden">
                        <span class="text-small-plus leading-compact truncate">Maad Waffle</span>
                        <span class="text-xs text-ui-fg-muted truncate">maad@example.com</span>
                    </div>
                 </div>
            </div>
         </div>

      </div>
    </aside>
  `
})
export class FeSidebarComponent {
    @Input() groups: { title?: string; items: NavItemConfig[] }[] = [];

    settingsItem: NavItemConfig = {
        label: 'Settings',
        route: '/settings',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>`
    };
}
