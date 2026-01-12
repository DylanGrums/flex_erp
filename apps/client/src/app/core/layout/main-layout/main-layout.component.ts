import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ShellComponent } from '../shell/shell.component';
import { MainSidebarComponent } from './main-sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, ShellComponent, MainSidebarComponent],
  template: `
    <app-shell>
        <app-main-sidebar sidebar></app-main-sidebar>
    </app-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent { }
