import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class I18nInitService {
  private readonly transloco = inject(TranslocoService);

  init(): void {
    const savedLang = localStorage.getItem('lang');
    const lang = savedLang ?? 'fr';
    this.transloco.setActiveLang(lang);
  }
}
