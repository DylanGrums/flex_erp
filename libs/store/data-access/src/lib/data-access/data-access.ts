import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'lib-data-access',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './data-access.html',
  styleUrl: './data-access.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataAccess {}
