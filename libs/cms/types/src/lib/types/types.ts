import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'cms-types',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './types.html',
  styleUrl: './types.css',
})
export class Types {}

