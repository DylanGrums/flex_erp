import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-resident-management',
  standalone: true,
  templateUrl: './resident-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResidentManagementComponent {}
