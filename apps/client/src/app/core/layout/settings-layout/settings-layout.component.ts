import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ShellComponent } from '../shell/shell.component';
import { SettingsSidebarComponent } from './settings-sidebar.component';

@Component({
  selector: 'app-settings-layout',
  standalone: true,
  imports: [CommonModule, ShellComponent, SettingsSidebarComponent],
  template: `
    <app-shell>
      <ng-template #sidebar>
        <app-settings-sidebar />
      </ng-template>
    </app-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsLayoutComponent {}
