import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';

@Component({
    selector: 'fe-admin-shell',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, AvatarModule],
    template: `
    <div class="flex h-screen w-full bg-ui-bg-base text-ui-fg-base overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 border-r border-ui-border-base flex flex-col bg-ui-bg-base flex-shrink-0">
        <!-- Logo / Brand -->
        <div class="h-14 flex items-center px-4 border-b border-ui-border-base">
          <div class="w-8 h-8 rounded bg-ui-bg-subtle flex items-center justify-center mr-3 border border-ui-border-base text-xs font-bold text-ui-fg-base">
            FE
          </div>
          <span class="font-semibold text-sm">Flex ERP Store</span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <ng-container *ngFor="let item of navItems">
             <a 
               [routerLink]="item.link" 
               routerLinkActive="bg-ui-bg-subtle text-ui-fg-base font-medium" 
               class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base transition-colors group"
             >
               <i [class]="item.icon" class="text-xs group-hover:text-ui-fg-base"></i>
               {{ item.label }}
             </a>
          </ng-container>
        </nav>

        <!-- Sidebar Bottom -->
        <div class="p-3 border-t border-ui-border-base">
            <a 
               routerLink="/settings"
               routerLinkActive="bg-ui-bg-subtle text-ui-fg-base"
               class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base transition-colors"
            >
               <i class="pi pi-cog text-xs"></i>
               Settings
            </a>
            <div class="mt-3 pt-3 border-t border-ui-border-base flex items-center gap-3 px-3">
                 <p-avatar label="M" shape="circle" size="normal" styleClass="!bg-ui-bg-subtle !text-xs !text-ui-fg-base"></p-avatar>
                 <div class="flex flex-col">
                     <span class="text-xs font-medium text-ui-fg-base">Admin User</span>
                     <span class="text-2xs text-ui-fg-muted">admin&#64;flex-erp.com</span>
                 </div>
            </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 bg-ui-bg-subtle/30">
        <!-- Topbar -->
        <header class="h-14 border-b border-ui-border-base bg-ui-bg-base flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
          <div class="flex items-center gap-4">
            <h1 class="text-sm font-medium text-ui-fg-base">{{ pageTitle }}</h1>
          </div>
          
          <div class="flex items-center gap-3">
             <ng-content select="[actions]"></ng-content>
          </div>
        </header>

        <!-- Content Body -->
        <div class="flex-1 overflow-y-auto p-6 scroll-smooth">
           <div class="max-w-7xl mx-auto w-full">
              <ng-content></ng-content>
           </div>
        </div>
      </main>
    </div>
  `,
    styles: [`
    :host {
        display: block;
        height: 100vh;
    }
  `]
})
export class FeAdminShellComponent {
    @Input() pageTitle = 'Dashboard';

    navItems = [
        { label: 'Search', icon: 'pi pi-search', link: '/search' },
        { label: 'Orders', icon: 'pi pi-shopping-cart', link: '/orders' },
        { label: 'Products', icon: 'pi pi-tags', link: '/products' },
        { label: 'Collections', icon: 'pi pi-th-large', link: '/collections' },
        { label: 'Categories', icon: 'pi pi-list', link: '/categories' },
        { label: 'Inventory', icon: 'pi pi-box', link: '/inventory' },
        { label: 'Customers', icon: 'pi pi-users', link: '/customers' },
        { label: 'Promotions', icon: 'pi pi-percentage', link: '/promotions' },
        { label: 'Price Lists', icon: 'pi pi-dollar', link: '/price-lists' },
    ];
}
