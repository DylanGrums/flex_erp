import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeSidebarComponent } from '../fe-sidebar/fe-sidebar.component';
import { NavItemConfig } from '../fe-nav-item/fe-nav-item.component';

@Component({
    selector: 'fe-app-layout',
    standalone: true,
    imports: [CommonModule, FeSidebarComponent],
    template: `
    <div class="relative flex h-screen w-full flex-row overflow-hidden bg-ui-bg-subtle">
        <!-- Sidebar Container (Fixed width 220px) -->
        <div class="hidden h-screen w-[220px] lg:block shrink-0">
            <fe-sidebar [groups]="navGroups"></fe-sidebar>
        </div>

        <!-- Main Content Area -->
        <div class="flex h-screen flex-1 flex-col overflow-auto bg-ui-bg-base transition-all duration-200">
             <!-- Topbar Placeholder (Breadcrumbs etc) -->
             <div class="grid w-full grid-cols-2 border-b border-ui-border-base p-3 min-h-[57px] bg-ui-bg-base sticky top-0 z-20">
                <div class="flex items-center gap-x-1.5">
                    <!-- Mobile Toggle would go here -->
                    <span class="text-ui-fg-muted text-sm font-medium">Flex ERP</span>
                </div>
                <!-- Notifications/User/Etc -->
             </div>

             <!-- Content Wrapper (Gutter) -->
             <main class="flex h-full w-full flex-col items-center">
                <div class="flex w-full max-w-[1600px] flex-col gap-y-2 p-3 h-full">
                     <ng-content></ng-content>
                </div>
             </main>
        </div>
    </div>
  `
})
export class FeAppLayoutComponent {
    // We define the nav configuration here or input it. 
    // For now, I'll define the required config matching standard Medusa admin.
    navGroups: { title?: string; items: NavItemConfig[] }[] = [
        {
            items: [
                {
                    label: 'Orders',
                    route: '/store/orders',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 001-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" /></svg>'
                },
                {
                    label: 'Products',
                    route: '/store/products',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>',
                    children: [
                        { label: 'Collections', route: '/store/collections' },
                        { label: 'Categories', route: '/store/categories' },
                        { label: 'Inventory', route: '/store/inventory' },
                    ]
                },
                {
                    label: 'Customers',
                    route: '/store/customers',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>'
                },
                {
                    label: 'Promotions',
                    route: '/store/promotions',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clip-rule="evenodd" /></svg>'
                },
                {
                    label: 'Price Lists',
                    route: '/store/price-lists',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.671 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.671 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clip-rule="evenodd" /></svg>'
                },
            ]
        }
    ];
}
