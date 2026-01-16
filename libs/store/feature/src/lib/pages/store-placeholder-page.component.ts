import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'fe-store-placeholder-page',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <section class="space-y-6">
      <header>
        <h2 class="text-2xl font-semibold text-ui-fg-base">
          {{ pageTitle | transloco }}
        </h2>
        <p class="mt-1 text-sm text-ui-fg-subtle">
          {{ pageSubtitle | transloco }}
        </p>
      </header>

      <div class="medusa-panel p-6 text-sm text-ui-fg-subtle">
        {{ 'store.pages.comingSoon' | transloco }}
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorePlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly pageTitle = this.route.snapshot.data['title'] ?? '';
  readonly pageSubtitle = this.route.snapshot.data['subtitle'] ?? '';
}
