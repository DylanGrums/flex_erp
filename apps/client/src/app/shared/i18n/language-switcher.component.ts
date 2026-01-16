import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-1 rounded-md border border-ui-border-subtle bg-ui-bg-base p-1">
      <button
        type="button"
        class="rounded-md px-2 py-1 text-xs font-semibold transition-fg"
        [class.bg-ui-bg-subtle]="activeLang === 'fr'"
        [class.text-ui-fg-base]="activeLang === 'fr'"
        [class.text-ui-fg-muted]="activeLang !== 'fr'"
        (click)="setLang('fr')"
        [attr.aria-pressed]="activeLang === 'fr'"
      >
        FR
      </button>
      <button
        type="button"
        class="rounded-md px-2 py-1 text-xs font-semibold transition-fg"
        [class.bg-ui-bg-subtle]="activeLang === 'en'"
        [class.text-ui-fg-base]="activeLang === 'en'"
        [class.text-ui-fg-muted]="activeLang !== 'en'"
        (click)="setLang('en')"
        [attr.aria-pressed]="activeLang === 'en'"
      >
        EN
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent implements OnInit {
  private readonly transloco = inject(TranslocoService);
  activeLang = 'fr';

  ngOnInit(): void {
    const savedLang = localStorage.getItem('lang');
    const lang = savedLang ?? this.transloco.getDefaultLang() ?? 'fr';
    this.setLang(lang);
  }

  setLang(lang: string): void {
    this.activeLang = lang;
    this.transloco.setActiveLang(lang);
    localStorage.setItem('lang', lang);
  }
}
